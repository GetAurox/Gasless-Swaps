import { ethers } from "ethers";
import { ProviderManager } from "./InfuraProvider";

/**
 * Using a PrivateKeyManager singleton to reduce the amount of wallet instances that need to be instantiated for the private keys. Ideally re-using wallet instances where possible to reduce memory usage
 */
export class PrivateKeyManager {
  static #privateKeys: string[] | null = null;
  static #wallets: ethers.Wallet[] | null = null;

  static get privateKeys(): string[] {
    if (!this.#privateKeys) {
      const privateKeyEnvVariable = process.env.PRIVATE_KEYS;
      if (!privateKeyEnvVariable)
        throw new Error("Missing PRIVATE_KEYS env variable");

      this.#privateKeys = privateKeyEnvVariable.split(",");
    }

    return this.#privateKeys;
  }

  static get wallets(): ethers.Wallet[] {
    if (!this.#wallets) {
      this.#wallets = this.privateKeys.map(
        (key) => new ethers.Wallet(key, ProviderManager.provider)
      );
    }

    return this.#wallets;
  }
}
