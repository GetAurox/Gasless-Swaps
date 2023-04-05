import { BigNumber } from "ethers";
import { Request, Response } from "express";
import { bull } from "@aurox-gasless-swaps/services";
import { gasCosts } from "@aurox-gasless-swaps/constants";
import reduce from "lodash/reduce";

import getAllBalances from "../helpers/getAllBalances";
import { proxySwapWorkers } from "../../queue";
import logger from "../../logger";

const proxySwapQueue = bull.getProxySwapQueue();

const logName = "Worker Management";

/**
 * This route is to be called by a user whenever they request a proxy swap. It determines whether the swap is feasible right now based on the balances in the controlled wallets
 * It also handles the stop-start of the workers, if they run out of funds or if they have been previously paused and re-funded.
 */
export default async (_: Request, res: Response<boolean>) => {
  const allWalletBalances = await getAllBalances();

  // TODO: Double check these statuses
  const numJobsWaitingForProcessing = await proxySwapQueue.getJobCountByTypes(
    "wait",
    "delayed",
    "waiting",
    "waiting-children"
  );

  // This calculates the total number of jobs that all available wallets can process. It also handles the stop-start of workers so that the bull worker management can be hands-off
  const numJobsWalletsCanProcess = reduce(
    allWalletBalances,
    (totalJobs, walletBalance) => {
      // Number of jobs this given wallet can process
      const availableJobs = BigNumber.from(walletBalance.balance)
        .div(gasCosts.maximumSponsorAmount)
        .toNumber();

      const worker = proxySwapWorkers[walletBalance.address];

      const isWorkerPaused = worker.isPaused();

      if (availableJobs === 0 && !isWorkerPaused) {
        logger.info("Pausing worker", {
          name: logName,
          workerAddress: walletBalance.address,
          details: "Pausing",
        });
        worker.pause();
      }

      if (availableJobs > 0 && isWorkerPaused) {
        logger.info("Resuming worker", {
          name: logName,
          workerAddress: walletBalance.address,
          details: "Resuming",
        });
        worker.resume();
      }

      return totalJobs + availableJobs;
    },
    0
  );

  const canProcessExtraJob =
    numJobsWalletsCanProcess > numJobsWaitingForProcessing;

  return res.send(canProcessExtraJob);
};
