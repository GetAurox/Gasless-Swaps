import { ethers } from "hardhat";
import {
  ERC20__factory,
  ForwardingSwapProxy,
  ForwardingSwapProxy__factory,
} from "../typechain";
import { OneInch } from "@aurox-gasless-swaps/services";
import { Addresses } from "@aurox-gasless-swaps/constants";
import { formatEther, parseEther } from "ethers/lib/utils";

import "@nomiclabs/hardhat-ethers"; // Get Module 'hardhat' has no exported member 'ethers' if this is missing
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const usdcPolygon = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const usdcAvalanche = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";

const stmxToken = "0xa62cc35625b0c8dc1faea39d33625bb4c15bd71c";

const fromToken = Addresses.USDTAddress;
const toToken = stmxToken;
const amount = "2001433";

// const formattedSwapParams = {
//   to: "0x1111111254fb6c44bac0bed2854e76f90643097d",
//   data: "0x7c02520000000000000000000000000053222470cdcfb8081c0e3a50fd106f0d69e63f2000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000d4a11d5eeaac28ec3f61d100daf4d40471f1852000000000000000000000000182dbc2be6b75b6a4549b11808080aefd0adad95000000000000000000000000000000000000000000000000000000000131d5b9000000000000000000000000000000000000000000000000003a2c1a0b8711ca00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e30000000000000000000000000000000000000000000000a500008f00005300206ae4071198002dc6c00d4a11d5eeaac28ec3f61d100daf4d40471f1852000000000000000000000000000000000000000000000000003a2c1a0b8711cadac17f958d2ee523a2206206994597c13d831ec74101c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200042e1a7d4d0000000000000000000000000000000000000000000000000000000000000000c0601111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000000000000000131d5b90000000000000000000000000000000000000000000000000000000000cfee7c08",
//   amount: "20043193",
//   value: "0x0",
// };

const checkIsTestingNetwork = async (signer: SignerWithAddress) => {
  console.log("Onblock: ", await signer.provider?.getBlockNumber());

  if (!(await signer.getBalance()).eq(parseEther("10000"))) {
    throw new Error("Not testing network");
  }
};

const main = async () => {
  const [signer] = await ethers.getSigners();

  await checkIsTestingNetwork(signer);

  const forwardingSwapProxy = await new ForwardingSwapProxy__factory(
    signer
  ).deploy(signer.address);

  await forwardingSwapProxy.addToWhitelist(Addresses.OneInchRouterAddress);

  // const forwardingSwapProxy = (await ethers.getContract(
  //   "ForwardingSwapProxy"
  // )) as ForwardingSwapProxy;

  const swapParams = await OneInch.getSwapParams({
    from: signer.address,
    fromTokenAddress: fromToken,
    toTokenAddress: toToken,
    amount,
    chainId: 1,
    destReceiver: forwardingSwapProxy.address,
  });

  await ERC20__factory.connect(Addresses.USDTAddress, signer).approve(
    forwardingSwapProxy.address,
    parseEther("100")
  );

  // await (await signer.sendTransaction(formattedSwapParams)).wait();
  // console.log("Done");

  const { wait, hash } = await forwardingSwapProxy.proxySwapWithFee(
    Addresses.USDTAddress,
    Addresses.ETHAddress,
    swapParams.formattedSwapParams,
    0,
    0
    // { value: formattedSwapParams }
  );

  console.log("hash ", hash);

  await wait(0);

  // const gasEstimate = await forwardingSwapProxy.estimateGas.proxySwapWithFee(
  //   fromToken,
  //   toToken,
  //   swapParams.formattedSwapParams,
  //   0,
  //   0,
  //   { value: amount }
  // );

  // console.log(gasEstimate);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
