import { gasCosts } from "@aurox-gasless-swaps/constants";
import { typechain, validation } from "@aurox-gasless-swaps/services";
import { ethers, PopulatedTransaction } from "ethers";

/**
 * @dev Specifically for forwarding swaps
 */
export const tryGetGasEstimate = async (
  tx: ethers.providers.TransactionRequest,
  provider: ethers.providers.BaseProvider,
  type: "approvalTxGasLimit" | "forwardingSwapProxyTxGasLimit"
) => {
  try {
    return await provider.estimateGas(tx);
  } catch (e) {
    if (type === "approvalTxGasLimit") return gasCosts.approvalTxGasLimit;

    return gasCosts.forwardingSwapProxyTxGasLimit;
  }
};
