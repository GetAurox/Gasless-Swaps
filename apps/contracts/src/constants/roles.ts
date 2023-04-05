import { ethers } from "ethers";

export const formatRole = (role: string) =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(role));

export const DEFAULT_ADMIN = ethers.utils.hexZeroPad("0x0", 32);

export const HOT_WALLET = formatRole("HOT_WALLET");

export const HOT_WALLET_ADMIN = formatRole("HOT_WALLET_ADMIN");
