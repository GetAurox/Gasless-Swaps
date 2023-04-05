import { deployment } from "@aurox-gasless-swaps/contracts";
import { ethers, Wallet } from "ethers";

// TODO: Infura API KEY
export const ethersProvider = new ethers.providers.InfuraProvider(
  "mainnet",
  process.env.INFURA_API_KEY
);

export const contracts = deployment.returnDeployedContracts(
  "mainnet",
  ethersProvider
);
