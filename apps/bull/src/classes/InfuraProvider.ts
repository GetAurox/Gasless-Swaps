import { ethers } from "ethers";

/**
 * Creating a provider manager singleton here so that all RPC requests funnel through the same provider. This is important as we are using the Batch RPC provider and all requests will be bundled
 */
export class ProviderManager {
  static #provider: ethers.providers.JsonRpcBatchProvider | null = null;

  static get provider() {
    if (!this.#provider) {
      if (!process.env.INFURA_API_KEY)
        throw new Error("Missing INFURA_API_KEY from .env");

      this.#provider = new ethers.providers.JsonRpcBatchProvider(
        `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
      );
    }
    return this.#provider;
  }
}
