import { responses } from "@aurox-gasless-swaps/constants";
import { bull, common } from "@aurox-gasless-swaps/services";
import { server } from "@aurox-gasless-swaps/types";
import { Job } from "bullmq";
import { parseTransaction } from "ethers/lib/utils";
import { Request, Response } from "express";

import { bullExpressServer } from "../constants/axios";
import { MAX_TIMEOUT_SECONDS } from "../constants/common";
import validateApprovalTx from "../helpers/validation/approval/validateApprovalTx";
import validateForwardingSwapProxyTx from "../helpers/validation/forwardingSwapProxy/validateForwardingSwapProxyTx";
import logger from "../logger";

import { GaslessType } from "./schema/gaslessSwap.schema";

const proxySwapQueue = bull.getProxySwapQueue();

const safeAddJob = async (request: GaslessType) => {
  const job = await proxySwapQueue.add(bull.PROXIED_SWAP_QUEUE, request);

  if (!job.id) throw new Error("job not added to queue");

  // Casting this to any, something appears to be wrong with the bull types when importing bull from the shared package @aurox-gasless-swaps/services
  const fetchedJob = await Job.fromId(proxySwapQueue as any, job.id);

  if (!fetchedJob) throw new Error("Failed to fetch created job");
};

export default async (req: Request<{}, {}, GaslessType>, res: Response) => {
  try {
    const { approvalTx, swapProxyTx, timeoutInUnix } = req.body;

    const now = common.getNowInUnix();

    if (timeoutInUnix < now) {
      return res
        .status(400)
        .send("Request timed out; timeoutInUnix must be greater than now");
    }

    if (now - timeoutInUnix > MAX_TIMEOUT_SECONDS) {
      return res
        .status(400)
        .send(`Specified timeout cannot exceed ${MAX_TIMEOUT_SECONDS}`);
    }

    const response = await bullExpressServer.get<boolean>(
      "can-job-be-processed"
    );

    if (!response.data) {
      return res.status(503).send(responses.SERVICE_UNAVAILABLE_WALLETS_EMPTY);
    }

    const validatedApprovalTx = approvalTx
      ? validateApprovalTx(parseTransaction(approvalTx))
      : undefined;

    if (validatedApprovalTx && "error" in validatedApprovalTx) {
      return res.status(400).json(validatedApprovalTx.error);
    }

    const validatedForwardingSwapProxyTx = await validateForwardingSwapProxyTx(
      parseTransaction(swapProxyTx),
      validatedApprovalTx?.response
    );

    if ("error" in validatedForwardingSwapProxyTx) {
      return res.status(400).json(validatedForwardingSwapProxyTx.error);
    }

    const { data: isValidTransactionResponse } =
      await bullExpressServer.post<server.IsValidTransactionResponse>(
        "is-valid-transaction-request",
        { approvalTx: req.body.approvalTx, swapProxyTx: req.body.swapProxyTx }
      );

    if (!isValidTransactionResponse.status) {
      return res.status(400).send(isValidTransactionResponse.error);
    }

    await safeAddJob(req.body);

    return res.status(200).json();
  } catch (err) {
    logger.error(err);
    return res.status(400).json(err).send();
  }
};
