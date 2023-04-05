import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ForwardingSwapProxy } from "../typechain";
import { OneInch } from "@aurox-gasless-swaps/services";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const [deployer] = await ethers.getSigners();

  await hre.deployments.deploy("ForwardingSwapProxy", {
    from: deployer.address,
    args: [deployer.address],
    log: true,
  });

  const forwardingSwapProxy = (await ethers.getContract(
    "ForwardingSwapProxy"
  )) as ForwardingSwapProxy;

  const vault = await ethers.getContract("Vault");

  await forwardingSwapProxy.setVault(vault.address);

  const oneInchContract =
    OneInch.oneInchAddressMapping[hre.network.config.chainId!];

  // TODO: This should be double checked for all deployments

  if (oneInchContract) {
    console.log("Whitelisting: ", oneInchContract);

    await forwardingSwapProxy.addToWhitelist(oneInchContract);
  }
};
export default func;
func.tags = ["testbed", "_forwardingSwapProxy"];
