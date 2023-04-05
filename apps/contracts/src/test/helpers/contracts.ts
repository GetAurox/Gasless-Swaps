import { ethers } from "hardhat";
import { Addresses } from "@aurox-gasless-swaps/constants";
import { ERC20__factory, ISwapRouter__factory } from "../../typechain";

const {
  AuroxAddress,
  UniswapRouterAddress,
  UniAddress,
  WETHAddress,
  DaiAddress,
  USDCAddress,
} = Addresses;

export const AuroxToken = ERC20__factory.connect(AuroxAddress, ethers.provider);

export const WETHToken = ERC20__factory.connect(WETHAddress, ethers.provider);

export const UniToken = ERC20__factory.connect(UniAddress, ethers.provider);

export const DaiToken = ERC20__factory.connect(DaiAddress, ethers.provider);

export const USDCToken = ERC20__factory.connect(USDCAddress, ethers.provider);

export const UniswapRouter = ISwapRouter__factory.connect(
  UniswapRouterAddress,
  ethers.provider
);
