import { Wallet } from "ethers";
import { ethers } from "hardhat";

export const ethersProvider = ethers.provider;

export const EmptyWallet = new Wallet(
  ""
).connect(ethersProvider);
