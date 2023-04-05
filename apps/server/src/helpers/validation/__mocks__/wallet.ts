import { ethers, Wallet, BigNumber } from "ethers";
import { parseTransaction } from "ethers/lib/utils";

// Mock private keys generated for testing, improves test speed as its a long-blocking computation to generate these
export const TEST_PRIVATE_KEY =
  "";

export const TEST_PRIVATE_KEY_1 =
  "";

export const MockWallet = new ethers.Wallet(TEST_PRIVATE_KEY);
export const MockWallet1 = new ethers.Wallet(TEST_PRIVATE_KEY_1);

/**
 * This helper simplifies the test procedure by populating and signing the transaction. It also sets from fields to 1 as the populate function tends to return them as 0 which then causes the Zod validation to fail
 * @param populateFunction The function that will populate the transaction
 * @param wallet The wallet to sign
 * @returns Returns the parsed transaction
 */
export const populateSignTxAndParse = async (
  populateFunction: (
    ...params: any
  ) => Promise<ethers.PopulatedTransaction> | ethers.PopulatedTransaction,
  wallet: Wallet
) => {
  const populatedTx = await populateFunction();

  // Some defaults here to help testing
  if (!populatedTx.chainId) populatedTx.chainId = 1;
  if (!populatedTx.maxFeePerGas) populatedTx.maxFeePerGas = BigNumber.from(1);
  if (!populatedTx.maxPriorityFeePerGas)
    populatedTx.maxPriorityFeePerGas = BigNumber.from(1);
  if (!populatedTx.gasLimit) populatedTx.gasLimit = BigNumber.from(1);

  const signedTx = await wallet.signTransaction(populatedTx);

  return parseTransaction(signedTx);
};
