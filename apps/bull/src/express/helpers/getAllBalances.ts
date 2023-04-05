import { ProviderManager } from "../../classes/InfuraProvider";
import { PrivateKeyManager } from "../../classes/PrivateKeyManager";

export interface AddressWithBalance {
  balance: string;
  address: string;
}

export default async () =>
  Promise.all(
    PrivateKeyManager.wallets.map(
      async (wallet): Promise<AddressWithBalance> => {
        const balance = await ProviderManager.provider.getBalance(
          wallet.address
        );

        return {
          address: wallet.address,
          balance: balance.toString(),
        };
      }
    )
  );
