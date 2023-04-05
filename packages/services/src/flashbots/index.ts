import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { ethers } from "ethers";

export class FlashbotsProvider {
  public static FlashbotsProvider: FlashbotsBundleProvider;

  static async getFlashbotsProvider(
    provider: ethers.providers.BaseProvider,
    wallet: ethers.Wallet,
    goerli?: boolean
  ) {
    if (!this.FlashbotsProvider) {
      this.FlashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        wallet,
        goerli ? "https://relay-goerli.flashbots.net" : undefined,
        goerli ? "goerli" : undefined
      );
    }

    return this.FlashbotsProvider;
  }
}
