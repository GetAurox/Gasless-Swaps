import {
  FlashbotsBundleProvider,
  SimulationResponse,
  TransactionSimulation,
} from "@flashbots/ethers-provider-bundle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { providers, Wallet } from "ethers";
import { ethers } from "hardhat";
import { JsonRpcSigner } from "@ethersproject/providers";

export class FlashBotsError {
  static SimulationError(message: string) {
    throw new Error(`Sim Error: ${message}`);
  }

  static FirstRevertError(revert: TransactionSimulation) {
    throw new Error(`First Revert Error: ${JSON.stringify(revert, null, 2)}`);
  }
}

export const simulateFlashbotsWrapper = async (
  simulate: () => Promise<SimulationResponse>
) => {
  const simResponse = await simulate();

  if (process.env.LOG) console.log(simResponse);

  if ("error" in simResponse) {
    throw FlashBotsError.SimulationError(simResponse.error.message);
  }

  if (simResponse.firstRevert) {
    throw FlashBotsError.FirstRevertError(simResponse.firstRevert);
  }

  // if (simResponse.coinbaseDiff.gt(0)) {
  //   console.error(`Coinbase Diff: ${simResponse.coinbaseDiff.toString()}`);
  // }

  return simResponse;
};

export const returnFlashbotsProvider = (
  signer: SignerWithAddress | Wallet | JsonRpcSigner,
  network?: "goerli",
  overrideProvider?: providers.BaseProvider
) =>
  FlashbotsBundleProvider.create(
    overrideProvider ?? ethers.provider,
    signer,
    network ? "https://relay-goerli.flashbots.net" : undefined,
    network ? "goerli" : undefined
  );

//   https://www.npmjs.com/package/@flashbots/ethers-provider-bundle
//   'https://relay-goerli.flashbots.net/',
//   'goerli'
