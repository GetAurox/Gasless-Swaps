/* eslint-disable camelcase */
import { typechain } from "@aurox-gasless-swaps/services";
import { BigNumber } from "ethers";
import { parseTransaction } from "ethers/lib/utils";
import { ZodError } from "zod";

import {
  INVALID_CHAINID,
  INVALID_METHOD_NAME,
  INVALID_SPENDER,
} from "../../../constants";
import { MockWallet, populateSignTxAndParse } from "../__mocks__";

import validateApprovalTx from "./validateApprovalTx";

const { ERC20__factory, ForwardingSwapProxy__factory } = typechain;

const TestContractAddress = "0xc6DdDB5bc6E61e0841C54f3e723Ae1f3A807260b";

const TestToken = ERC20__factory.connect(TestContractAddress, MockWallet);

const TestSwapProxy = ForwardingSwapProxy__factory.connect(
  TestContractAddress,
  MockWallet
);

const forwardingSwapProxy = "0x690059258f4EC11c42d3E06a0Df4C110F391b448";

jest.mock("@aurox-gasless-swaps/contracts", () => ({
  deployment: {
    returnDeployedContracts: () => ({
      addresses: {
        // Unfortunately defining this twice as jest.mocks get hoisted and the forwardingSwapProxy variable doesn't exist in this context
        forwardingSwapProxy: "0x690059258f4EC11c42d3E06a0Df4C110F391b448",
      },
    }),
  },
}));

const invalidMethodNameError = new ZodError([
  { code: "custom", message: INVALID_METHOD_NAME, path: ["data"] },
]);

describe("validateApprovalTx", () => {
  it("should validate the approval Tx", async () => {
    const expectedAmount = BigNumber.from(1);

    const parsedApprovalTx = await populateSignTxAndParse(
      () =>
        TestToken.populateTransaction.approve(
          forwardingSwapProxy,
          expectedAmount,
          {
            type: 2,
          }
        ),
      MockWallet
    );
    parsedApprovalTx.chainId = 1;

    const validatedTx = validateApprovalTx(parsedApprovalTx);

    expect(validatedTx).toStrictEqual({
      response: {
        to: TestContractAddress,
        transaction: parsedApprovalTx,
        params: { spender: forwardingSwapProxy, amount: expectedAmount },
      },
    });
  });

  it("should fail the validation when using a different method", async () => {
    const parsedTransferTx = await populateSignTxAndParse(
      () =>
        TestToken.populateTransaction.transfer(forwardingSwapProxy, 1, {
          type: 2,
        }),
      MockWallet
    );

    const validatedTx = validateApprovalTx(parsedTransferTx);

    expect(validatedTx).toStrictEqual({
      error: invalidMethodNameError,
    });
  });

  it("should fail the validation when using a method on a different contract", async () => {
    const parsedProxySwapTx = await populateSignTxAndParse(
      () =>
        TestSwapProxy.populateTransaction.setFee(1, {
          type: 2,
        }),
      MockWallet
    );

    const validatedTx = validateApprovalTx(parsedProxySwapTx);

    expect(validatedTx).toStrictEqual({
      error: invalidMethodNameError,
    });
  });

  it("should fail when passing the wrong address to approve to", async () => {
    const expectedAmount = "1";

    const parsedApprovalTx = await populateSignTxAndParse(
      () =>
        TestToken.populateTransaction.approve(
          TestContractAddress,
          expectedAmount,
          {
            type: 2,
          }
        ),
      MockWallet
    );
    parsedApprovalTx.chainId = 1;

    const validatedTx = validateApprovalTx(parsedApprovalTx);

    expect(validatedTx).toStrictEqual({
      error: new ZodError([
        { code: "custom", message: INVALID_SPENDER, path: ["spender"] },
      ]),
    });
  });

  it("should fail with wrong chainId when sending with the incorrect chainId", async () => {
    const parsedApprovalTx = await populateSignTxAndParse(
      () =>
        TestToken.populateTransaction.approve(forwardingSwapProxy, 1, {
          type: 2,
        }),
      MockWallet
    );
    parsedApprovalTx.chainId = 0;

    const validatedTx = validateApprovalTx(parsedApprovalTx);

    expect(validatedTx).toStrictEqual({
      error: new ZodError([
        { code: "custom", message: INVALID_CHAINID, path: ["chainId"] },
      ]),
    });
  });

  it("should fail when providing a type 1 transaction", async () => {
    const signedTx = await MockWallet.signTransaction(
      await TestToken.populateTransaction.approve(forwardingSwapProxy, 1, {})
    );

    const parsedApprovalTx = parseTransaction(signedTx);

    const validatedTx = validateApprovalTx(parsedApprovalTx);

    expect((validatedTx as any).error instanceof ZodError).toBe(true);
  });
});
