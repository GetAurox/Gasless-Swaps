import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers } from "hardhat";
import { BaseSwapProxy, Vault } from "../typechain";
import chai, { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { assertBigNumWithRange } from "./helpers/assertions";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { range } from "lodash";
import chaiAsPromised from "chai-as-promised";
import { HOT_WALLET, HOT_WALLET_ADMIN } from "../constants/roles";
import {
  ETHAddress,
  AuroxAddress,
} from "@aurox-gasless-swaps/constants/src/addresses";
import { AuroxWhale } from "../constants/whales";
import { AuroxToken } from "./helpers/contracts";
import { assertBeforeAndAfterBalance } from "./helpers/extensions";
import { impersonateAndReturnAccount } from "./helpers/hardhatHelpers";
import { JsonRpcSigner } from "@ethersproject/providers";

chai.use(chaiAsPromised);

describe("vault", () => {
  let vault: Vault;
  let deployer: SignerWithAddress;
  let users: SignerWithAddress[];

  before(async () => {
    [deployer, ...users] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("testbed");

    vault = await ethers.getContract("Vault");
  });

  const fundVault = (value: BigNumberish) =>
    deployer.sendTransaction({ to: vault.address, value });

  const newLimit = parseEther("0.5");

  it("tests that setting the wallet limit works", async () => {
    await vault.setWalletBalanceLimit(newLimit);

    expect(await vault.walletBalanceLimit()).eq(newLimit);
  });

  it("tests that setting the wallet limit for a non-admin account fails", async () => {
    await expect(
      vault.connect(users[0]).setWalletBalanceLimit(newLimit)
    ).to.revertedWith("");
  });

  it("tests that claiming fees works for an admin", async () => {
    const fundedWalletBalance = parseEther("0.5");

    await fundVault(fundedWalletBalance);

    const beforeBalance = await deployer.getBalance();
    await vault.claimFees();
    const afterBalance = await deployer.getBalance();

    // Using range assert here because the transaction fees for the transaction itself modifies the amount
    assertBigNumWithRange(fundedWalletBalance, afterBalance.sub(beforeBalance));
  });

  it("tests that claiming fees fails for a non-admin", async () => {
    await expect(vault.connect(users[0]).claimFees()).to.revertedWith("");
  });

  it("tests that the topUpWallets function fails when there are no registered hot wallets", async () => {
    await expect(vault.topUpHotWallets()).to.revertedWith("");
  });

  it("tests that granting the HOT_WALLET_ADMIN role to a test user allows that user to grant the HOT_WALLET role to an account and also to revoke it", async () => {
    await vault.grantRole(HOT_WALLET_ADMIN, users[0].address);

    await vault.connect(users[0]).grantRole(HOT_WALLET, users[1].address);
    expect(await vault.hasRole(HOT_WALLET, users[1].address)).true;

    await vault.connect(users[0]).revokeRole(HOT_WALLET, users[1].address);
    expect(await vault.hasRole(HOT_WALLET, users[1].address)).false;
  });

  it("tests that the topUpWallets function funds one hot wallet", async () => {
    const newWallet = Wallet.createRandom();

    await vault.grantRole(HOT_WALLET, newWallet.address);

    await vault.setWalletBalanceLimit(newLimit);

    await vault.topUpHotWallets({ value: newLimit });

    expect(await ethers.provider.getBalance(newWallet.address)).eq(newLimit);
  });

  it("tests that a wallet that is half funded isn't over topped up when topping up wallets", async () => {
    const halfFundAmount = BigNumber.from(newLimit).div(2);
    const newWallet = Wallet.createRandom();

    await vault.grantRole(HOT_WALLET, newWallet.address);
    await vault.setWalletBalanceLimit(newLimit);

    await deployer.sendTransaction({
      to: newWallet.address,
      value: halfFundAmount,
    });

    const expectedTotalETHRequired = await vault.ethRequiredForHotWalletTopup();

    await vault.topUpHotWallets({ value: expectedTotalETHRequired });

    expect(await ethers.provider.getBalance(newWallet.address)).eq(newLimit);
  });

  it("tests that the topUpWallets function funds a 10 new hot wallets and the expected top-up estimate returns the correct amount", async () => {
    const wallets = range(10).map(() => Wallet.createRandom());

    await Promise.all(
      wallets.map((wallet) => vault.grantRole(HOT_WALLET, wallet.address))
    );

    await vault.setWalletBalanceLimit(newLimit);

    const expectedTotalETHRequired = await vault.ethRequiredForHotWalletTopup();
    await fundVault(expectedTotalETHRequired);

    const beforeBalance = await ethers.provider.getBalance(vault.address);
    await vault.topUpHotWallets();
    const afterBalance = await ethers.provider.getBalance(vault.address);

    const totalBalanceUsed = afterBalance.sub(beforeBalance).abs();
    expect(expectedTotalETHRequired).eq(totalBalanceUsed);

    await Promise.all(
      wallets.map(async (wallet) =>
        expect(await ethers.provider.getBalance(wallet.address)).eq(newLimit)
      )
    );
  });
});

describe("withdrawERC20", () => {
  const amount = parseEther("0.5");

  let baseSwapProxy: BaseSwapProxy;
  let user: SignerWithAddress;

  let auroxWhale: JsonRpcSigner;

  before(async () => {
    [user] = await ethers.getSigners();

    const BaseSwapProxy = await ethers.getContractFactory("BaseSwapProxy");
    baseSwapProxy = await BaseSwapProxy.deploy(user.address);

    auroxWhale = await impersonateAndReturnAccount(AuroxWhale, user);
  });

  it("tests that ETH can be withdrawn from the contract", async () => {
    await user.sendTransaction({ to: baseSwapProxy.address, value: amount });

    const beforeETHBalance = await user.getBalance();
    await baseSwapProxy.withdrawERC20(ETHAddress);
    const afterETHBalance = await user.getBalance();

    assertBigNumWithRange(amount, afterETHBalance.sub(beforeETHBalance));
  });

  it("tests that the function reverts if there is no ETH to be withdrawn", async () => {
    await expect(baseSwapProxy.withdrawERC20(ETHAddress)).to.be.rejectedWith(
      "Nothing to withdraw"
    );
  });

  it("tests that ERC20 token's can be withdrawn from the contract", async () => {
    await AuroxToken.connect(auroxWhale).transfer(
      baseSwapProxy.address,
      amount
    );

    await assertBeforeAndAfterBalance(
      AuroxToken,
      {
        address: user.address,
        expectedValue: amount.toString(),
      },
      () => baseSwapProxy.withdrawERC20(AuroxToken.address)
    );
  });

  it("tests that the function reverts if there are no ERC20 tokens to be withdrawn", async () => {
    await expect(baseSwapProxy.withdrawERC20(AuroxAddress)).to.be.rejectedWith(
      "Nothing to withdraw"
    );
  });
});
