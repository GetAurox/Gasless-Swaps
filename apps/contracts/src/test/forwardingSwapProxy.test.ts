import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers } from "hardhat";
import { ERC20__factory, ForwardingSwapProxy, Vault } from "../typechain";
import { OneInch } from "@aurox-gasless-swaps/services";
import { Addresses } from "@aurox-gasless-swaps/constants";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { AuroxWhale, UniWhale, USDCWhale } from "../constants/whales";
import {
  impersonateAndReturnAccount,
  resetFork,
} from "./helpers/hardhatHelpers";
import {
  auroxToETHSwap,
  auroxToUSDCSwap,
  auroxToWETHSwap,
  ETHToAuroxSwap,
  usdcToAuroxSwap,
} from "./__mocks__/1inchSwapParamMocks.mocks";
import { BigNumber, BigNumberish } from "ethers/lib/ethers";
import { assertBeforeAndAfterBalance } from "./helpers/extensions";
import { JsonRpcSigner } from "@ethersproject/providers";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { BigNumAssertionOptions } from "./helpers/assertions";
import { DEFAULT_ADMIN } from "../constants/roles";
chai.use(chaiAsPromised);

describe("forwardingSwapProxy", () => {
  let forwardingSwapProxy: ForwardingSwapProxy;
  let vault: Vault;
  let deployer: SignerWithAddress;
  let testUsers: SignerWithAddress[];

  const returnExpectedAmount = async (
    fromToken: OneInch.TokenDetails,
    toToken: OneInch.TokenDetails,
    amountIn: BigNumber | string
  ) => {
    const exchangeRate = await forwardingSwapProxy.getExchangeRate(
      fromToken.address,
      toToken.address
    );

    if (!(amountIn instanceof BigNumber)) amountIn = BigNumber.from(amountIn);

    const expectedAmount = amountIn
      .mul(exchangeRate)
      .div(parseUnits("1", toToken.decimals));

    return forwardingSwapProxy.scaleAmountFromDecimals(
      expectedAmount,
      fromToken.decimals,
      toToken.decimals
    );
  };

  const executeSwapAndAssert = async (
    {
      formattedSwapParams,
      fromToken,
      toToken,
    }: OneInch.FormattedOneInchSwapResult,
    user: SignerWithAddress | JsonRpcSigner,
    options?: {
      gasRefund?: BigNumberish;
      minimumReturnAmount?: string;
    } & BigNumAssertionOptions
  ) => {
    const amount =
      formattedSwapParams.value !== "0"
        ? formattedSwapParams.value
        : formattedSwapParams.amount;

    const expected = await returnExpectedAmount(fromToken, toToken, amount);

    const { feeTotalInToken } =
      await forwardingSwapProxy.calculatePercentageFeeInETH(
        toToken.address,
        expected,
        options?.gasRefund ?? "0"
      );

    if (
      fromToken.address.toLowerCase() !== Addresses.ETHAddress.toLowerCase()
    ) {
      await ERC20__factory.connect(fromToken.address, user).approve(
        forwardingSwapProxy.address,
        formattedSwapParams.amount
      );
    }

    await assertBeforeAndAfterBalance(
      toToken.address,
      {
        address:
          (user as SignerWithAddress).address ??
          (user as JsonRpcSigner)._address,
        expectedValue: expected.sub(feeTotalInToken).toString(),
        options,
      },
      () =>
        forwardingSwapProxy
          .connect(user)
          .proxySwapWithFee(
            fromToken.address,
            toToken.address,
            formattedSwapParams,
            options?.gasRefund ?? "0",
            options?.minimumReturnAmount ?? "0",
            { value: formattedSwapParams.value }
          )
    );
  };

  before(async () => {
    [deployer, ...testUsers] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await resetFork();

    await deployments.fixture("testbed");

    forwardingSwapProxy = await ethers.getContract("ForwardingSwapProxy");
    vault = await ethers.getContract("Vault");

    await forwardingSwapProxy.addToWhitelist(Addresses.OneInchRouterAddress);
    await forwardingSwapProxy.setFee(0);

    await vault.claimFees();
  });

  it("tests that granting the admin role to a user, grants it for all required admin functionality", async () => {
    await forwardingSwapProxy.grantRole(DEFAULT_ADMIN, testUsers[0].address);

    const forwardingSwapProxyTestUser = forwardingSwapProxy.connect(
      testUsers[0]
    );

    await forwardingSwapProxyTestUser.addToWhitelist(
      forwardingSwapProxy.address
    );
    await forwardingSwapProxyTestUser.removeFromWhitelist(
      forwardingSwapProxy.address
    );

    await forwardingSwapProxyTestUser.setFee(0);
    await forwardingSwapProxyTestUser.setVault(forwardingSwapProxy.address);

    await deployer.sendTransaction({
      to: forwardingSwapProxy.address,
      value: parseEther("1"),
    });
    await forwardingSwapProxyTestUser.withdrawERC20(Addresses.ETHAddress);

    await forwardingSwapProxyTestUser.setContractPaused(true);
  });

  it("tests that a simple Aurox - ETH swap works with a gas refund", async () => {
    const gasRefund = parseEther("0.1");

    const auroxWhale = await impersonateAndReturnAccount(AuroxWhale, deployer);

    await executeSwapAndAssert(auroxToETHSwap, auroxWhale, { gasRefund });

    const vaultBalance = await ethers.provider.getBalance(vault.address);
    expect(vaultBalance).eq(gasRefund);
  });

  it("tests that a swap from ETH - Aurox works, without fees applied", async () => {
    await executeSwapAndAssert(ETHToAuroxSwap, deployer);
  });

  it("tests that a swap from ETH - Aurox works, with a gas refund", async () => {
    const gasRefund = parseEther("0.1");

    await executeSwapAndAssert(ETHToAuroxSwap, deployer, { gasRefund });

    const vaultBalance = await ethers.provider.getBalance(vault.address);
    expect(vaultBalance).eq(gasRefund);
  });

  it("tests that a swap from Aurox - USDC works, with a gas refund and a percentage fee", async () => {
    const auroxWhale = await impersonateAndReturnAccount(AuroxWhale, deployer);

    await forwardingSwapProxy.setFee(parseEther("0.05"));

    const gasRefund = parseEther("0.15");

    await executeSwapAndAssert(auroxToUSDCSwap, auroxWhale, {
      gasRefund,
      range: 0.1,
    });

    const vaultBalance = await ethers.provider.getBalance(vault.address);
    expect(vaultBalance).gt(gasRefund);
  });

  it("tests that a swap from USDC - Aurox works, with a gas refund and a percentage fee", async () => {
    await forwardingSwapProxy.setFee(parseEther("0.10"));

    const gasRefund = parseEther("0.05");

    const usdcWhale = await impersonateAndReturnAccount(USDCWhale, deployer);

    await executeSwapAndAssert(usdcToAuroxSwap, usdcWhale, {
      gasRefund,
    });
  });

  it("tests that a swap from Aurox - WETH works, without fees", async () => {
    const gasRefund = parseEther("0");

    const auroxWhale = await impersonateAndReturnAccount(AuroxWhale, deployer);

    await executeSwapAndAssert(auroxToWETHSwap, auroxWhale, {
      gasRefund,
    });
  });

  it("tests that a swap from Aurox - WETH works, with fees. This also validates that WETH - ETH swap works, due to the fee recovery at the end of the users swap", async () => {
    const gasRefund = parseEther("0.05");

    const auroxWhale = await impersonateAndReturnAccount(AuroxWhale, deployer);

    await executeSwapAndAssert(auroxToWETHSwap, auroxWhale, {
      gasRefund,
    });
    const vaultBalance = await ethers.provider.getBalance(vault.address);
    expect(vaultBalance).eq(gasRefund);
  });

  it("tests that a swap reverts when the minimum return amount isn't met", async () => {
    const auroxWhale = await impersonateAndReturnAccount(AuroxWhale, deployer);

    await expect(
      executeSwapAndAssert(auroxToWETHSwap, auroxWhale, {
        minimumReturnAmount: parseEther("1000").toString(),
      })
    ).to.be.rejectedWith("Not enough tokens returned");
  });
});
