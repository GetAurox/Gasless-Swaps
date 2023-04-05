/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable camelcase */
import { Addresses } from "@aurox-gasless-swaps/constants";
import { typechain, validation } from "@aurox-gasless-swaps/services";
import { ethers, BigNumber, PopulatedTransaction } from "ethers";
import { ZodError } from "zod";

import {
  FEE_FIELD_MISMATCH,
  FROM_FIELD_MISMATCH,
  INSUFFICIENT_APPROVAL_BALANCE,
  INSUFFICIENT_ETH_PROVIDED,
  INSUFFICIENT_FROM_TOKEN_BALANCE,
  INSUFFICIENT_GAS_REFUND,
  INVALID_TO_ADDRESS_FORWARDING_SWAP,
} from "../../../constants";
import { ValidatedApprovalTx } from "../../../types/validation";
import {
  populateSignTxAndParse,
  forwardingSwapProxyAddressMock,
  MockWallet,
  MockWallet1,
} from "../__mocks__";
import validateApprovalTx from "../approval/validateApprovalTx";

import validateForwardingSwapProxyTx from "./validateForwardingSwapProxyTx";

// Using var here to prevent this inline variable from being hoisted. If I use let or const the variable is undefined within the jest.mock closure
// eslint-disable-next-line no-var
var isWhitelistedMock: jest.Mock;
var allowanceMock: jest.Mock;
var balanceOfMock: jest.Mock;
var getBalanceETHMock: jest.Mock;

jest.mock("@aurox-gasless-swaps/contracts", () => {
  isWhitelistedMock = jest.fn();

  return {
    deployment: {
      returnDeployedContracts: () => ({
        addresses: {
          // Unfortunately defining this twice as jest.mocks get hoisted and the forwardingSwapProxy variable doesn't exist in this context
          forwardingSwapProxy: "0x690059258f4EC11c42d3E06a0Df4C110F391b448",
        },
        ForwardingSwapProxy: {
          isWhitelisted: isWhitelistedMock,
        },
      }),
    },
  };
});

// Complicated mocking here so that we can mock the balanceOf and allowance method calls for tests
jest.mock("@aurox-gasless-swaps/services", () => {
  allowanceMock = jest.fn();
  balanceOfMock = jest.fn();

  const { typechain: actualTypechainImport, ...actual } = jest.requireActual(
    "@aurox-gasless-swaps/services"
  );

  return {
    ...actual,
    typechain: {
      ...actualTypechainImport,
      ERC20__factory: {
        // Spreading actualTypechainImport.ERC20__factory doesn't seem to work
        createInterface: actualTypechainImport.ERC20__factory.createInterface,
        connect: (address: string, wallet: ethers.providers.Provider) => {
          const instance = actualTypechainImport.ERC20__factory.connect(
            address,
            wallet
          );

          return {
            populateTransaction: instance.populateTransaction,
            allowance: allowanceMock,
            balanceOf: balanceOfMock,
          };
        },
      },
    },
  };
});

jest.mock("ethers", () => {
  getBalanceETHMock = jest.fn();

  const actualEthers = jest.requireActual("ethers");

  const defaultProvider = actualEthers.ethers.getDefaultProvider();
  defaultProvider.getBalance = getBalanceETHMock;

  return {
    ...actualEthers,
    ethers: {
      ...actualEthers.ethers,
      getDefaultProvider: () => defaultProvider,
    },
  };
});

const { ERC20__factory, ForwardingSwapProxy__factory } = typechain;

const TestContractAddress = "0xc6DdDB5bc6E61e0841C54f3e723Ae1f3A807260b";

const TestToken = ERC20__factory.connect(TestContractAddress, MockWallet);

const TestSwapProxy = ForwardingSwapProxy__factory.connect(
  TestContractAddress,
  MockWallet
);

describe("validateForwardingSwapProxyTx", () => {
  const amount = BigNumber.from(1000);
  const maxFeePerGas = BigNumber.from(100);
  const maxPriorityFeePerGas = BigNumber.from(15);

  let validatedApprovalTx: ValidatedApprovalTx;
  let validProxySwapTransaction: PopulatedTransaction;

  beforeAll(async () => {
    // Mock returning a correct balance to allow most validation tests to isolate what they're testing
    balanceOfMock.mockImplementation(() => amount);
    allowanceMock.mockImplementation(() => amount);
    getBalanceETHMock.mockImplementation(() => amount);
    isWhitelistedMock.mockImplementation(() => true);

    const parsedApprovalTx = await populateSignTxAndParse(
      () =>
        TestToken.populateTransaction.approve(
          forwardingSwapProxyAddressMock,
          amount,
          {
            type: 2,
            maxFeePerGas,
            maxPriorityFeePerGas,
          }
        ),
      MockWallet
    );

    const approvalTxResponse = validateApprovalTx(parsedApprovalTx);

    if ("error" in approvalTxResponse) {
      throw approvalTxResponse.error;
    }

    validatedApprovalTx = approvalTxResponse.response;
  });

  beforeEach(async () => {
    const total = validation.getRequiredGasRefund(
      // Supplying this transaction twice as its using the same maxFeePerGas and gasLimit for both
      validatedApprovalTx.transaction,
      validatedApprovalTx.transaction
    );

    // Recreate this each test as its being modified by test cases
    validProxySwapTransaction =
      await TestSwapProxy.populateTransaction.proxySwapWithFee(
        TestContractAddress,
        TestContractAddress,
        { to: TestContractAddress, amount, data: "0x", value: "0" },
        total.totalGasRefund,
        0,
        { type: 2, maxFeePerGas, maxPriorityFeePerGas }
      );
  });

  it("tests that providing a different maxFeePerGas and maxPriority value for the swap proxy tx, results in an error being returned", async () => {
    validProxySwapTransaction.maxFeePerGas = BigNumber.from(2);
    validProxySwapTransaction.maxPriorityFeePerGas = BigNumber.from(1);

    const parsedSwapProxyTx = await populateSignTxAndParse(
      () => validProxySwapTransaction,
      MockWallet
    );

    const validatedTx = await validateForwardingSwapProxyTx(
      parsedSwapProxyTx,
      validatedApprovalTx
    );

    expect(validatedTx).toStrictEqual({
      error: new ZodError([
        {
          code: "custom",
          message: FEE_FIELD_MISMATCH,
          path: ["maxFeePerGas"],
        },
        {
          code: "custom",
          message: FEE_FIELD_MISMATCH,
          path: ["maxPriorityFeePerGas"],
        },
      ]),
    });
  });

  it("tests that supplying an insufficient gasRefund value returns the correct error", async () => {
    const parsedSwapProxyTx = await populateSignTxAndParse(
      () =>
        TestSwapProxy.populateTransaction.proxySwapWithFee(
          TestContractAddress,
          TestContractAddress,
          { to: TestContractAddress, amount: "1", data: "0x", value: "0" },
          1,
          0,
          { type: 2, maxFeePerGas, maxPriorityFeePerGas }
        ),
      MockWallet
    );

    const validatedTx = await validateForwardingSwapProxyTx(
      parsedSwapProxyTx,
      validatedApprovalTx
    );

    expect(validatedTx).toStrictEqual({
      error: new ZodError([
        {
          code: "custom",
          message: INSUFFICIENT_GAS_REFUND,
          path: ["_gasRefund"],
        },
      ]),
    });
  });

  it("tests that supplying the correct gasRefund value and overriding the gasLimit, results in the validation succeeding", async () => {
    const swapProxyGasLimit = BigNumber.from("10000");

    const total = validation.getRequiredGasRefund(
      validatedApprovalTx.transaction,
      {
        maxFeePerGas: validatedApprovalTx.transaction.maxFeePerGas,
        gasLimit: swapProxyGasLimit,
      }
    );

    const parsedSwapProxyTx = await populateSignTxAndParse(
      () =>
        TestSwapProxy.populateTransaction.proxySwapWithFee(
          TestContractAddress,
          TestContractAddress,
          { to: TestContractAddress, amount: "1", data: "0x", value: "0" },
          total.totalGasRefund,
          0,
          {
            type: 2,
            maxFeePerGas,
            maxPriorityFeePerGas,
            gasLimit: swapProxyGasLimit,
          }
        ),
      MockWallet
    );

    const validatedTx = await validateForwardingSwapProxyTx(
      parsedSwapProxyTx,
      validatedApprovalTx
    );

    expect("error" in validatedTx).toBe(false);
    expect("response" in validatedTx).toBe(true);
  });

  it("tests that supplying a swap proxy transaction that was signed with a different wallet fails the validation", async () => {
    validProxySwapTransaction.from = MockWallet1.address;

    const parsedSwapProxyTx = await populateSignTxAndParse(
      () => validProxySwapTransaction,
      MockWallet1
    );

    const validatedTx = await validateForwardingSwapProxyTx(
      parsedSwapProxyTx,
      validatedApprovalTx
    );

    expect(validatedTx).toStrictEqual({
      error: new ZodError([
        {
          code: "custom",
          message: FROM_FIELD_MISMATCH,
          path: ["from"],
        },
      ]),
    });
  });

  it("tests that supplying a swap transaction that is attempting to swap more than the approval transaction approve amount, fails with an error", async () => {
    const total = validation.getRequiredGasRefund(
      validatedApprovalTx.transaction,
      validatedApprovalTx.transaction
    );

    const parsedSwapProxyTx = await populateSignTxAndParse(
      () =>
        TestSwapProxy.populateTransaction.proxySwapWithFee(
          TestContractAddress,
          TestContractAddress,
          {
            to: TestContractAddress,
            amount: amount.add(1),
            data: "0x",
            value: "0",
          },
          total.totalGasRefund,
          0,
          { type: 2, maxFeePerGas, maxPriorityFeePerGas }
        ),
      MockWallet
    );

    const validatedTx = await validateForwardingSwapProxyTx(
      parsedSwapProxyTx,
      validatedApprovalTx
    );

    expect(validatedTx).toStrictEqual({
      error: new ZodError([
        {
          code: "custom",
          message: INSUFFICIENT_APPROVAL_BALANCE,
          path: ["amount"],
        },
      ]),
    });
  });

  it("tests that when the users balance is less than the amount they are requesting to swap, the validation fails with an error", async () => {
    balanceOfMock.mockImplementationOnce(() => BigNumber.from(0));

    const parsedSwapProxyTx = await populateSignTxAndParse(
      () => validProxySwapTransaction,
      MockWallet
    );

    const validatedTx = await validateForwardingSwapProxyTx(
      parsedSwapProxyTx,
      validatedApprovalTx
    );

    expect(validatedTx).toStrictEqual({
      error: new ZodError([
        {
          code: "custom",
          message: INSUFFICIENT_FROM_TOKEN_BALANCE,
          path: ["amount"],
        },
      ]),
    });
  });

  describe("without providing a validatedApprovalTx", () => {
    it("tests that the validation returns an approval balance too low error when the user doesn't have enough approval balance", async () => {
      allowanceMock.mockImplementationOnce(async () => BigNumber.from(0));

      const parsedSwapProxyTx = await populateSignTxAndParse(
        () => validProxySwapTransaction,
        MockWallet
      );

      const validatedTx = await validateForwardingSwapProxyTx(
        parsedSwapProxyTx,
        undefined
      );

      expect(validatedTx).toStrictEqual({
        error: new ZodError([
          {
            code: "custom",
            message: INSUFFICIENT_APPROVAL_BALANCE,
            path: ["amount"],
          },
        ]),
      });
    });

    it("tests that the validation succeeds when the user has enough approval balance for the swap", async () => {
      allowanceMock.mockImplementation(async () => amount);

      const parsedSwapProxyTx = await populateSignTxAndParse(
        () => validProxySwapTransaction,
        MockWallet
      );

      const validatedTx = await validateForwardingSwapProxyTx(
        parsedSwapProxyTx,
        undefined
      );

      expect("error" in validatedTx).toBe(false);
      expect("response" in validatedTx).toBe(true);
    });

    it("tests that trying to execute a request with a value field greater than the amount of ETH supplied in the transaction, fails with the right error", async () => {
      const total = validation.getRequiredGasRefund(
        undefined,
        validatedApprovalTx.transaction
      );

      const parsedSwapProxyTx = await populateSignTxAndParse(
        () =>
          TestSwapProxy.populateTransaction.proxySwapWithFee(
            Addresses.ETHAddress,
            TestContractAddress,
            {
              to: TestContractAddress,
              amount: "0",
              data: "0x",
              value: amount,
            },
            total.totalGasRefund,
            0,
            {
              type: 2,
              maxFeePerGas,
              maxPriorityFeePerGas,
              value: amount.sub("1"),
            }
          ),
        MockWallet
      );

      const validatedTx = await validateForwardingSwapProxyTx(
        parsedSwapProxyTx,
        undefined
      );

      expect(validatedTx).toStrictEqual({
        error: new ZodError([
          {
            code: "custom",
            message: INSUFFICIENT_ETH_PROVIDED,
            path: ["value"],
          },
        ]),
      });
    });

    it("tests that when the user is trying to swap ETH without enough ETH balance, an insufficient balance error is returned", async () => {
      getBalanceETHMock.mockImplementationOnce(async () => BigNumber.from(0));

      const total = validation.getRequiredGasRefund(
        undefined,
        validatedApprovalTx.transaction
      );

      const parsedSwapProxyTx = await populateSignTxAndParse(
        () =>
          TestSwapProxy.populateTransaction.proxySwapWithFee(
            Addresses.ETHAddress,
            TestContractAddress,
            {
              to: TestContractAddress,
              amount: "0",
              data: "0x",
              value: amount,
            },
            total.totalGasRefund,
            0,
            { type: 2, maxFeePerGas, maxPriorityFeePerGas, value: amount }
          ),
        MockWallet
      );

      const validatedTx = await validateForwardingSwapProxyTx(
        parsedSwapProxyTx,
        undefined
      );

      expect(validatedTx).toStrictEqual({
        error: new ZodError([
          {
            code: "custom",
            message: INSUFFICIENT_FROM_TOKEN_BALANCE,
            path: ["amount"],
          },
        ]),
      });
    });

    it("tests that an ETH swap validates when all the parameters are correct", async () => {
      const total = validation.getRequiredGasRefund(
        undefined,
        validatedApprovalTx.transaction
      );

      const parsedSwapProxyTx = await populateSignTxAndParse(
        () =>
          TestSwapProxy.populateTransaction.proxySwapWithFee(
            Addresses.ETHAddress,
            TestContractAddress,
            {
              to: TestContractAddress,
              amount: "0",
              data: "0x",
              value: amount,
            },
            total.totalGasRefund,
            0,
            { type: 2, maxFeePerGas, maxPriorityFeePerGas, value: amount }
          ),
        MockWallet
      );

      const validatedTx = await validateForwardingSwapProxyTx(
        parsedSwapProxyTx,
        undefined
      );

      expect("error" in validatedTx).toBe(false);
      expect("response" in validatedTx).toBe(true);
    });
  });

  describe("whitelist validation", () => {
    let parsedSwapProxyTx: ethers.Transaction;

    beforeAll(async () => {
      const total = validation.getRequiredGasRefund(
        validatedApprovalTx.transaction,
        validatedApprovalTx.transaction
      );

      parsedSwapProxyTx = await populateSignTxAndParse(
        () => validProxySwapTransaction,
        MockWallet
      );
    });

    it("tests that returning false for the whitelisted call returns the expected error", async () => {
      isWhitelistedMock.mockImplementation(() => false);

      const validatedTx = await validateForwardingSwapProxyTx(
        parsedSwapProxyTx,
        validatedApprovalTx
      );

      expect(validatedTx).toStrictEqual({
        error: new ZodError([
          {
            code: "custom",
            message: INVALID_TO_ADDRESS_FORWARDING_SWAP,
            path: ["_swapParams", "to"],
          },
        ]),
      });
    });

    it("tests that returning true for the whitelisted call returns a response", async () => {
      isWhitelistedMock.mockImplementation(() => true);

      const validatedTx = await validateForwardingSwapProxyTx(
        parsedSwapProxyTx,
        validatedApprovalTx
      );

      expect("error" in validatedTx).toBe(false);
      expect("response" in validatedTx).toBe(true);
    });
  });
});
