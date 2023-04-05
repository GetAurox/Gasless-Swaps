import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers } from "hardhat";
import { AuroxWhale, USDCWhale } from "../constants/whales";
import { UniswapSwapProxy, Vault } from "../typechain";
import {
  AuroxToken,
  UniToken,
  USDCToken,
  WETHToken,
} from "./helpers/contracts";
import { impersonateAndReturnAccount } from "./helpers/hardhatHelpers";
import { JsonRpcSigner } from "@ethersproject/providers";
import chai, { expect } from "chai";
import {
  AuroxAddress,
  ETHAddress,
  UniAddress,
  WETHAddress,
  USDCAddress,
  CompTokenAddress,
} from "@aurox-gasless-swaps/constants/src/addresses";
import { parseEther } from "ethers/lib/utils";
import { assertBigNumWithRange } from "./helpers/assertions";
import { BigNumber } from "ethers";
import { assertBeforeAndAfterBalance } from "./helpers/extensions";
import { ERC20__factory } from "../typechain";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

describe("uniswapSwapProxy", () => {
  const originalAmount = "100";
  const amount = parseEther(originalAmount);

  const slippage = parseEther("0.10");

  let uniswapSwapProxy: UniswapSwapProxy;
  let vault: Vault;
  let user: SignerWithAddress;

  let auroxWhale: JsonRpcSigner;

  before(async () => {
    [user] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("testbed");

    uniswapSwapProxy = await ethers.getContract("UniswapSwapProxy");
    vault = await ethers.getContract("Vault");

    await vault.claimFees();
    await uniswapSwapProxy.setFee(0);

    auroxWhale = await impersonateAndReturnAccount(AuroxWhale, user);

    await AuroxToken.connect(auroxWhale).approve(
      uniswapSwapProxy.address,
      amount
    );
  });

  const returnExpectedAmount = async (
    toToken: string,
    fromToken: string,
    amountIn: BigNumber | string
  ) => {
    const exchangeRate = await uniswapSwapProxy.getExchangeRate(
      toToken,
      fromToken
    );

    if (!(amountIn instanceof BigNumber)) amountIn = BigNumber.from(amountIn);

    return amountIn.mul(exchangeRate).div(parseEther("1"));
  };

  it("tests that swapping from Aurox -> Uni works and the users now holds the uni tokens", async () => {
    await uniswapSwapProxy
      .connect(auroxWhale)
      .proxySwapWithFee(AuroxAddress, UniAddress, amount, 0, slippage);

    const uniswapSwapProxyUniBalance = await UniToken.balanceOf(
      uniswapSwapProxy.address
    );
    expect(uniswapSwapProxyUniBalance).eq(0);

    const usersUniBalance = await UniToken.balanceOf(auroxWhale._address);
    expect(usersUniBalance).gt(0);
  });

  it("tests that swapping tokens for tokens with a gasTotal amount results in the Vault getting the correct amount of ETH", async () => {
    const gasTotal = parseEther("0.0001");

    await uniswapSwapProxy
      .connect(auroxWhale)
      .proxySwapWithFee(AuroxAddress, UniAddress, amount, gasTotal, slippage);

    const vaultBalance = await ethers.provider.getBalance(vault.address);

    expect(gasTotal).eq(vaultBalance);
  });

  it("tests that swapping to ETH works", async () => {
    const beforeBalance = await auroxWhale.getBalance();

    await uniswapSwapProxy
      .connect(auroxWhale)
      .proxySwapWithFee(AuroxAddress, ETHAddress, amount, 0, slippage);

    const afterBalance = await auroxWhale.getBalance();

    const changeInETH = afterBalance.sub(beforeBalance);

    const exchangeRate = await uniswapSwapProxy.getExchangeRate(
      AuroxAddress,
      ETHAddress
    );

    const expectedAmount = amount.mul(exchangeRate).div(parseEther("1"));

    assertBigNumWithRange(expectedAmount, changeInETH);
  });

  it("tests that swapping to WETH works", async () => {
    await uniswapSwapProxy
      .connect(auroxWhale)
      .proxySwapWithFee(AuroxAddress, WETHAddress, amount, 0, slippage);

    const wethBalance = await WETHToken.balanceOf(auroxWhale._address);

    const exchangeRate = await uniswapSwapProxy.getExchangeRate(
      AuroxAddress,
      WETHAddress
    );

    const expectedAmount = amount.mul(exchangeRate).div(parseEther("1"));

    assertBigNumWithRange(expectedAmount, wethBalance);
  });

  it("tests that swapping tokens for tokens with a percentage fee results in the Vault getting the correct refund", async () => {
    await uniswapSwapProxy.setFee(parseEther("0.05"));

    const gasRefund = 0;

    await uniswapSwapProxy
      .connect(auroxWhale)
      .proxySwapWithFee(AuroxAddress, UniAddress, amount, gasRefund, slippage);

    const { feeTotalInETH } =
      await uniswapSwapProxy.calculatePercentageFeeInETH(
        AuroxAddress,
        amount,
        gasRefund
      );

    const vaultBalance = await ethers.provider.getBalance(vault.address);

    assertBigNumWithRange(feeTotalInETH, vaultBalance);
  });

  it("tests that swapping tokens for ETH with a percentage fee results in the correct amount of ETH for the vault", async () => {
    await uniswapSwapProxy.setFee(parseEther("0.10"));

    const gasRefund = 0;

    await uniswapSwapProxy
      .connect(auroxWhale)
      .proxySwapWithFee(AuroxAddress, ETHAddress, amount, gasRefund, slippage);

    const { feeTotalInETH } =
      await uniswapSwapProxy.calculatePercentageFeeInETH(
        AuroxAddress,
        amount,
        gasRefund
      );

    const vaultBalance = await ethers.provider.getBalance(vault.address);

    assertBigNumWithRange(feeTotalInETH, vaultBalance);
  });

  it("tests that a _gasRefund and a percentage fee result in the Vault getting the correct fee", async () => {
    await uniswapSwapProxy.setFee(parseEther("0.05"));

    const gasRefund = parseEther("0.01");

    await uniswapSwapProxy
      .connect(auroxWhale)
      .proxySwapWithFee(AuroxAddress, UniAddress, amount, gasRefund, slippage);

    const { feeTotalInETH } =
      await uniswapSwapProxy.calculatePercentageFeeInETH(
        AuroxAddress,
        amount,
        gasRefund
      );

    const vaultBalance = await ethers.provider.getBalance(vault.address);

    assertBigNumWithRange(feeTotalInETH, vaultBalance);
  });

  /**
   * < 18 Decimals Token testing
   */

  // Because USDC has 6 decimals (I know right, how dumb) scale the value to USDC decimals
  const usdcScaledAmount = BigNumber.from(originalAmount).mul(
    BigNumber.from(10).pow(6)
  );

  it("tests that swapping with a _fromToken that doesn't have 18 decimals works", async () => {
    const gasRefund = parseEther("0.01");

    const usdcWhale = await impersonateAndReturnAccount(USDCWhale, user);

    await USDCToken.connect(usdcWhale).approve(
      uniswapSwapProxy.address,
      usdcScaledAmount
    );

    await uniswapSwapProxy
      .connect(usdcWhale)
      .proxySwapWithFee(
        USDCAddress,
        UniAddress,
        usdcScaledAmount,
        gasRefund,
        slippage
      );

    const vaultBalance = await ethers.provider.getBalance(vault.address);
    expect(vaultBalance).eq(gasRefund);

    const usersUniBalance = await UniToken.balanceOf(usdcWhale._address);
    expect(usersUniBalance).gt(0);
  });

  it("tests that swapping with a _toToken that doesn't have 18 decimals works", async () => {
    const expectedAmount = await returnExpectedAmount(
      AuroxAddress,
      USDCAddress,
      amount
    );

    await assertBeforeAndAfterBalance(
      USDCToken,
      {
        address: auroxWhale._address,
        expectedValue: expectedAmount.toString(),
      },
      async () =>
        uniswapSwapProxy
          .connect(auroxWhale)
          .proxySwapWithFee(AuroxAddress, USDCAddress, amount, 0, slippage)
    );
  });

  it("tests that swapping with USDC as the _toToken and taking a fee works", async () => {
    await uniswapSwapProxy.setFee(parseEther("0.10"));
    const gasRefund = parseEther("0.01");

    const { feeTotalInETH } =
      await uniswapSwapProxy.calculatePercentageFeeInETH(
        AuroxAddress,
        amount,
        gasRefund
      );

    await uniswapSwapProxy
      .connect(auroxWhale)
      .proxySwapWithFee(AuroxAddress, USDCAddress, amount, 0, slippage);

    assertBigNumWithRange(
      feeTotalInETH,
      await ethers.provider.getBalance(vault.address),
      { range: 0.1 }
    );
  });

  it("tests that when swapping with tokens that have an inactive pool that pool isn't used and the swap is instead routed through ETH", async () => {
    const usdcWhale = await impersonateAndReturnAccount(USDCWhale, user);

    await USDCToken.connect(usdcWhale).approve(
      uniswapSwapProxy.address,
      usdcScaledAmount
    );

    const expectedAmount = await returnExpectedAmount(
      USDCAddress,
      CompTokenAddress,
      amount
    );

    const CompToken = ERC20__factory.connect(CompTokenAddress, user);

    await assertBeforeAndAfterBalance(
      CompToken,
      {
        address: usdcWhale._address,
        expectedValue: expectedAmount.toString(),
      },
      async () =>
        uniswapSwapProxy
          .connect(usdcWhale)
          .proxySwapWithFee(
            USDCAddress,
            CompTokenAddress,
            usdcScaledAmount,
            0,
            slippage
          )
    );
  });

  it("tests that swapping a token for the same token fails", async () => {
    await expect(
      uniswapSwapProxy
        .connect(auroxWhale)
        .proxySwapWithFee(AuroxAddress, AuroxAddress, amount, 0, slippage)
    ).to.rejectedWith("_fromToken equal to _toToken");
  });

  it("tests that pausing the contract disables swaps", async () => {
    await uniswapSwapProxy.setContractPaused(true);

    await expect(
      uniswapSwapProxy
        .connect(auroxWhale)
        .proxySwapWithFee(AuroxAddress, AuroxAddress, amount, 0, slippage)
    ).to.rejectedWith("Pausable: paused");
  });
});
