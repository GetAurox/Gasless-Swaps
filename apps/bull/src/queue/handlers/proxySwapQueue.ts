import { Processor } from "bullmq";
import { ethers, BigNumber } from "ethers";
import {
  bull,
  flashbots,
  common,
  validation,
} from "@aurox-gasless-swaps/services";
import { gasCosts } from "@aurox-gasless-swaps/constants";
import { parseTransaction } from "ethers/lib/utils";
import {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
} from "@flashbots/ethers-provider-bundle";
import { ProviderManager } from "../../classes/InfuraProvider";
import logger from "../../logger";
import getSponsorTx from "../../express/helpers/getSponsorTx";

const logName = "Proxy Swap Queue";

const TIMEOUT_BUFFER_SECONDS = 20;

const submitFlashbotsBundle = async (
  flashbotsProvider: FlashbotsBundleProvider,
  bundle: string[],
  blockNumber: number
): Promise<boolean> => {
  const bundleResponse = await flashbotsProvider.sendRawBundle(
    bundle,
    blockNumber,
    { minTimestamp: 0, maxTimestamp: 0 }
  );

  if ("error" in bundleResponse) {
    throw new Error(
      `Bundle failed with: ${JSON.stringify(bundleResponse.error, null, 2)}`
    );
  }

  const bundleResolution = await bundleResponse.wait();

  // Throw an error here to halt this proxy swap because it is now invalid from a nonce being too high
  if (bundleResolution === FlashbotsBundleResolution.AccountNonceTooHigh) {
    throw new Error("Account nonce too high");
  }

  if (bundleResolution === FlashbotsBundleResolution.BundleIncluded) {
    return true;
  }

  return false;
};

/**
 * The proxy swap queue is a high-order function that takes in a private key to initialize a HotWallet instance to be used within the queue. This high-order function returns the queue to be used
 * @param privateKey The privateKey to initialize the hot wallet with
 * @returns Returns the queue instance
 */
const proxySwapQueueWithPrivateKey: (
  privateKey: string
) => Processor<bull.ProxiedSwapJob, any, string> = (privateKey: string) => {
  const HotWallet = new ethers.Wallet(privateKey, ProviderManager.provider);

  return async ({ data }) => {
    const parsedSwapProxyTx = parseTransaction(data.swapProxyTx);

    const user = parsedSwapProxyTx.from as string;

    const approvalTx = data.approvalTx
      ? parseTransaction(data.approvalTx)
      : undefined;

    logger.info(`Received new request: ${user}`, {
      name: logName,
      user,
      details: `Received new request`,
    });

    if (approvalTx)
      logger.info(`Approval Tx: ${user}`, {
        name: logName,
        user,
        details: `Approval Tx`,
        approvalTx,
      });

    logger.info(`Swap Proxy Tx: ${user}`, {
      name: logName,
      user,
      details: `Swap Proxy Tx`,
      parsedSwapProxyTx,
    });

    if (data.timeoutInUnix < common.getNowInUnix()) {
      logger.info(`Request timed out: ${user}`, {
        name: logName,
        user,
        details: "Request timed out",
      });
      return;
    }

    const flashbotsProvider =
      await flashbots.FlashbotsProvider.getFlashbotsProvider(
        ProviderManager.provider,
        HotWallet
      );

    const blockNumber = (await ProviderManager.provider.getBlockNumber()) + 1;

    const totals = validation.getRequiredGasRefund(
      approvalTx,
      parsedSwapProxyTx
    );

    let attempts = 0;

    try {
      const sponsorTx = await getSponsorTx(HotWallet, {
        value: totals.totalSponsorTransactionCost,
        to: parsedSwapProxyTx.from as string,
        gasLimit: gasCosts.sponsorTxGasLimit,
        maxFeePerGas: parsedSwapProxyTx.maxFeePerGas as BigNumber,
        maxPriorityFeePerGas:
          parsedSwapProxyTx.maxPriorityFeePerGas as BigNumber,
      });

      const txBundle = [sponsorTx];
      if (data.approvalTx) txBundle.push(data.approvalTx);
      txBundle.push(data.swapProxyTx);

      const simulatedResult = await flashbotsProvider.simulate(
        txBundle,
        "latest"
      );

      logger.info(`Simulated result: ${user}`, {
        name: logName,
        user,
        simulatedResult,
      });

      if ("error" in simulatedResult) {
        logger.error(`Error in simulated result: ${user}`, {
          name: logName,
          user,
          type: "simulatedResult",
          error: simulatedResult.error,
        });

        return;
      } else if (simulatedResult.firstRevert) {
        logger.error(`First Revert in simulated result: ${user}`, {
          name: logName,
          user,
          type: "firstRevert",
          error: simulatedResult.firstRevert,
        });

        return;
      }

      // Storing these in variables so they can be logged more easily
      let accepted: boolean = false;
      let hasTimedOut: boolean = false;

      while (!accepted && !hasTimedOut) {
        const currentBlockNumber = blockNumber + attempts;

        logger.info(`Trying for inclusion in ${currentBlockNumber}: ${user}`, {
          name: logName,
          user,
        });

        accepted = await submitFlashbotsBundle(
          flashbotsProvider,
          txBundle,
          currentBlockNumber
        );

        if (!accepted) {
          logger.info(`Not accepted in ${currentBlockNumber}: ${user}`, {
            name: logName,
            user,
            details: "Not Accepted",
            blockNumber: currentBlockNumber,
            attempts,
          });
        }

        attempts += 1;

        hasTimedOut =
          data.timeoutInUnix < common.getNowInUnix() + TIMEOUT_BUFFER_SECONDS;
      }

      const logInfoTitle = accepted ? "Successfully included" : "Timed out";

      logger.info(`${logInfoTitle}: ${user}`, {
        name: logName,
        user,
        details: "Finished",
        accepted,
        attempts,
        blockNumber: blockNumber + attempts,
        hasTimedOut,
      });
    } catch (error: any) {
      logger.error("Errored: ${user}", { user, error });

      throw error;
    }
  };
};

export default proxySwapQueueWithPrivateKey;
