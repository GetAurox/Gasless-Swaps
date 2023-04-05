import { BigNumberish, Wallet } from "ethers";

export default async (
  wallet: Wallet,
  tx: {
    value: BigNumberish;
    to: string;
    gasLimit: BigNumberish;
    maxFeePerGas: BigNumberish;
    maxPriorityFeePerGas: BigNumberish;
  }
) => {
  const hotWalletNonce = await wallet.getTransactionCount();

  return wallet.signTransaction({
    ...tx,
    nonce: hotWalletNonce,
    chainId: 1,
    type: 2,
  });
};
