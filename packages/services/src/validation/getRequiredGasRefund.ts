import { gasCosts } from "@aurox-gasless-swaps/constants";
import { BigNumber } from "ethers";

interface TxCostRequiredParams {
  maxFeePerGas?: BigNumber;
  gasLimit?: BigNumber;
}

const returnTxCost = <T extends TxCostRequiredParams>(
  transaction: T | undefined
) => {
  if (!transaction) return BigNumber.from(0);

  if (!transaction.maxFeePerGas || !transaction.gasLimit) {
    console.log(transaction);
    throw new Error("Missing max fee per gas field");
  }

  // Because the maxFeePerGas value includes the priority fee we only need to use this value to calculate the total tx cost
  return transaction.maxFeePerGas.mul(transaction.gasLimit);
};

/**
 * This function takes in an approvalTx and swapProxyTx and returns the total gas cost required to execute the transactions
 * @dev approvalTx can be undefined, because not all calls to execute the proxy swap will include an approval transaction because they may already be approved
 * @param approvalTx The approvalTx to get the gas total for
 * @param swapProxyTx Swap proxy tx to get total gas costs for
 * @returns Returns the total gas costs for each independent transaction and also the total cost of the transactions combined
 */
export const getRequiredGasRefund = (
  approvalTx: TxCostRequiredParams | undefined,
  swapProxyTx: TxCostRequiredParams
) => {
  const approvalTxCost = returnTxCost(approvalTx);
  const swapProxyTxCost = returnTxCost(swapProxyTx);

  const totalSponsorTransactionCost = approvalTxCost.add(swapProxyTxCost);
  const sponsorTxCost = gasCosts.sponsorTxGasLimit.mul(
    swapProxyTx.maxFeePerGas as BigNumber
  );
  const totalGasRefund = sponsorTxCost.add(totalSponsorTransactionCost);

  return {
    approvalTxCost,
    swapProxyTxCost,
    sponsorTxCost,
    totalSponsorTransactionCost,
    totalGasRefund,
  };
};
