import { Wallet } from "ethers";
import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

export const HardhatForkBlockNumber = 15318954;

export const WalletInstance = Wallet.fromMnemonic(
  process.env.MNEMONIC as string
);
