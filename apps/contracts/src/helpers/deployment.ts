import { ethers, Signer } from "ethers";
import fs from "fs";
import path from "path";
import {
  ForwardingSwapProxy,
  ForwardingSwapProxy__factory,
  Vault,
  Vault__factory,
} from "../typechain";

export interface DeploymentFile {
  forwardingSwapProxy: string;
  vault: string;
}

type SupportedNetworks = "mainnet";

const returnContractAddress = (
  networkName: SupportedNetworks,
  contractName: "ForwardingSwapProxy" | "Vault"
) => {
  const file = fs
    .readFileSync(
      path.join(__dirname, `../deployments/${networkName}/${contractName}.json`)
    )
    .toString();

  const parsedFile = JSON.parse(file) as { address: string };

  return parsedFile.address;
};

export const returnDeployedAddresses = (
  networkName: SupportedNetworks
): { forwardingSwapProxy: string; vault: string } => ({
  forwardingSwapProxy: returnContractAddress(
    networkName,
    "ForwardingSwapProxy"
  ),
  vault: returnContractAddress(networkName, "Vault"),
});

interface DeployedContracts {
  Vault: Vault;
  ForwardingSwapProxy: ForwardingSwapProxy;
}

export const returnDeployedContracts = (
  networkName: SupportedNetworks,
  signerOrProvider: Signer | ethers.providers.Provider
) => {
  const addresses = returnDeployedAddresses(networkName);

  const Vault = Vault__factory.connect(addresses.vault, signerOrProvider);
  const ForwardingSwapProxy = ForwardingSwapProxy__factory.connect(
    addresses.forwardingSwapProxy,
    signerOrProvider
  );

  return { Vault, ForwardingSwapProxy, addresses };
};

export class DeploymentSingleton {
  static #deployedAddresses: DeploymentFile;
  static #contracts: DeployedContracts;

  // static getDeployedAddresses(networkName: string): DeploymentFile {
  //   if (!this.#deployedAddresses) {
  //     this.#deployedAddresses = returnDeployedAddresses(networkName);
  //   }

  //   return this.#deployedAddresses;
  // }

  static getDeployedContracts(
    networkName: SupportedNetworks,
    signerOrProvider: Signer | ethers.providers.Provider
  ) {
    if (!this.#contracts) {
      const { Vault, ForwardingSwapProxy, addresses } = returnDeployedContracts(
        networkName,
        signerOrProvider
      );

      if (!this.#deployedAddresses) {
        this.#deployedAddresses = addresses;
      }

      this.#contracts = { Vault, ForwardingSwapProxy };
    }

    return this.#contracts;
  }
}
