import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { UniswapSwapProxy } from "../typechain";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const [deployer] = await ethers.getSigners();

  await hre.deployments.deploy("UniswapSwapProxy", {
    from: deployer.address,
    args: [deployer.address],
    log: true,
  });

  const uniswapSwapProxy = (await ethers.getContract(
    "UniswapSwapProxy"
  )) as UniswapSwapProxy;

  const vault = await ethers.getContract("Vault");

  await uniswapSwapProxy.setVault(vault.address);
};
export default func;
func.tags = ["testbed", "_uniswapSwapProxy"];
