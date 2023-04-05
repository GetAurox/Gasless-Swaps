/* eslint-disable camelcase */
import { Addresses } from "@aurox-gasless-swaps/constants";
import { OneInch, typechain } from "@aurox-gasless-swaps/services";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { config } from "dotenv";
import { Wallet } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import sinon from "sinon";

import { BackendAxiosInstance } from "../constants/BackendAxios";
import {
  ErrorType,
  proxySwapWithFeeUniswap,
} from "../forwardingProxySwapWithFee";

import { EmptyWallet } from "./__mocks__/wallet";
import { impersonateAndReturnAccount } from "./helpers/hardhat";

const { ForwardingSwapProxy__factory, ERC20__factory } = typechain;

config();

const testSwapReq = {
  fromTokenAddress: Addresses.AuroxAddress,
  toTokenAddress: Addresses.UniAddress,
  amount: "100000",
};

export const AuroxWhale = "0xe67c1a187daf3aaf79cd61de603ae8cb2e34b85f";

export const AuroxToken = typechain.ERC20__factory.connect(
  Addresses.AuroxAddress,
  ethers.provider
);

describe("tests varios", () => {
  let users: SignerWithAddress[];
  let forwardingSwapProxy: typechain.ForwardingSwapProxy;

  before(async () => {
    users = await ethers.getSigners();

    forwardingSwapProxy = await new ForwardingSwapProxy__factory(
      users[0]
    ).deploy(users[0].address);
  });

  it("should return the missing balance error when the user doesn't have the right funds", async () => {
    const response = await proxySwapWithFeeUniswap(
      EmptyWallet,
      ethers.provider,
      testSwapReq
    );

    expect("error" in response).eq(true);

    expect(response).eql({
      error: {
        type: ErrorType.NotEnoughSwapTokenBalance,
        log: `Requested swap to ${testSwapReq.fromTokenAddress}, user is missing ${testSwapReq.amount} tokens`,
      },
    });
  });

  it("should should call the route with the correct parameters when the user has the correct funds", async () => {
    const stub = sinon
      .stub(BackendAxiosInstance, "post")
      .returns(undefined as any);

    const whaleAccount = await impersonateAndReturnAccount(
      AuroxWhale,
      users[0]
    );

    await AuroxToken.connect(whaleAccount).transfer(
      EmptyWallet.address,
      testSwapReq.amount
    );

    const response = await proxySwapWithFeeUniswap(
      EmptyWallet,
      ethers.provider,
      testSwapReq
    );

    expect("error" in response).eq(false);

    const [routeName, args] = stub.args[0] as [string, any];

    expect(routeName).eq("/gasless-swap");

    expect("approvalTx" in args).eq(true);
    expect("swapProxyTx" in args).eq(true);
  });

  it.skip("should work when swapping from ETH", async () => {
    const stub = sinon
      .stub(BackendAxiosInstance, "post")
      .returns(undefined as any);

    const response = await proxySwapWithFeeUniswap(
      EmptyWallet,
      ethers.provider,
      {
        fromTokenAddress: Addresses.ETHAddress,
        toTokenAddress: Addresses.AuroxAddress,
        amount: "1000",
      }
    );
    console.log(response);
  });
});

// const GoerliTestToken = ERC20__factory.connect(
//   "0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc",
//   signer
// );

const testGoerliSwapReq = {
  toTokenAddress: Addresses.AuroxAddress,
  fromTokenAddress: Addresses.UniAddress,
  amount: "1000",
};

const testMainnetSwapReq = {
  fromTokenAddress: Addresses.USDCAddress,
  toTokenAddress: Addresses.AuroxAddress,
  amount: parseEther("3").toString(),
};

describe("network tests", () => {
  it.skip("goerli ", async () => {
    const GoerliEmptyWallet = EmptyWallet;

    const response = await proxySwapWithFeeUniswap(
      GoerliEmptyWallet,
      ethers.getDefaultProvider("goerli"),
      testGoerliSwapReq
    );

    console.log(response);
  });

  it.only("mainnet", async () => {
    const provider = new ethers.providers.InfuraProvider(
      "mainnet",
      process.env.INFURA_API_KEY
    );

    const BraveWallet = Wallet.fromMnemonic(
      process.env.MNEMONIC as string
    ).connect(provider);

    const fromToken = ERC20__factory.connect(
      testMainnetSwapReq.fromTokenAddress,
      provider
    );

    const usersBalance = await fromToken.balanceOf(BraveWallet.address);

    const response = await proxySwapWithFeeUniswap(BraveWallet, provider, {
      ...testMainnetSwapReq,
      amount: usersBalance.toString(),
    });
  });
});
