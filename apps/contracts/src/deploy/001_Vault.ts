import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const [deployer] = await ethers.getSigners();

  await hre.deployments.deploy("Vault", {
    from: deployer.address,
    args: [deployer.address],
    log: true,
  });
};
export default func;
func.tags = ["testbed", "_vault"];
