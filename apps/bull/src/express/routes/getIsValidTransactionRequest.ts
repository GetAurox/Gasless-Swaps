import { Request, Response } from "express";
import { BigNumber, Wallet } from "ethers";
import { gasCosts, responses } from "@aurox-gasless-swaps/constants";
import { server } from "@aurox-gasless-swaps/types";

import { ProviderManager } from "../../classes/InfuraProvider";
import { PrivateKeyManager } from "../../classes/PrivateKeyManager";
import getSponsorTx from "../helpers/getSponsorTx";
import { IsValidTransactionRequestType } from "./schema/getIsValidTransactionRequest.schema";
import { common, flashbots, validation } from "@aurox-gasless-swaps/services";
import { parseTransaction } from "ethers/lib/utils";
import { SimulationResponse } from "@flashbots/ethers-provider-bundle";

const getValidWallet = async (): Promise<Wallet | undefined> => {
  for (const wallet of PrivateKeyManager.wallets) {
    const balance = await ProviderManager.provider.getBalance(wallet.address);

    if (balance.gte(gasCosts.maximumSponsorAmount)) {
      return wallet;
    }
  }
};

const getRevertMessageFromSimulation = (
  simulatedResult: SimulationResponse
): string | null => {
  if ("error" in simulatedResult) {
    return common.stripAscii(simulatedResult.error.message);
  } else if (
    simulatedResult.firstRevert &&
    "error" in simulatedResult.firstRevert
  ) {
    if (simulatedResult.firstRevert.revert) {
      return common.stripAscii(simulatedResult.firstRevert.revert);
    }
    // This is poorly typed as the revert field does sometimes exist on simulated result items
    const foundRevertMessage: any = simulatedResult.results.find(
      (simulated: any) => simulated.revert
    );

    if (foundRevertMessage) {
      return common.stripAscii(foundRevertMessage.revert);
    }

    return `Transaction simulation failed: ${JSON.stringify(simulatedResult)}`;
  }

  return null;
};

export default async (
  req: Request<{}, {}, IsValidTransactionRequestType>,
  res: Response<server.IsValidTransactionResponse>
) => {
  const validWallet = await getValidWallet();
  if (!validWallet)
    return res.send({
      status: false,
      error: responses.SERVICE_UNAVAILABLE_WALLETS_EMPTY,
    });

  const approvalTx = req.body.approvalTx
    ? parseTransaction(req.body.approvalTx)
    : undefined;

  const swapProxyTx = parseTransaction(req.body.swapProxyTx);

  const totals = validation.getRequiredGasRefund(approvalTx, swapProxyTx);

  const sponsorTx = await getSponsorTx(validWallet, {
    value: totals.totalSponsorTransactionCost,
    to: swapProxyTx.from as string,
    gasLimit: gasCosts.sponsorTxGasLimit,
    maxFeePerGas: swapProxyTx.maxFeePerGas as BigNumber,
    maxPriorityFeePerGas: swapProxyTx.maxPriorityFeePerGas as BigNumber,
  });

  const txBundle = [sponsorTx];
  if (req.body.approvalTx) txBundle.push(req.body.approvalTx);
  txBundle.push(req.body.swapProxyTx);

  const flashbotsProvider =
    await flashbots.FlashbotsProvider.getFlashbotsProvider(
      ProviderManager.provider,
      validWallet
    );

  const simulatedResult = await flashbotsProvider.simulate(txBundle, "latest");

  const error = getRevertMessageFromSimulation(simulatedResult);

  if (error) {
    // Using 200 status codes here, this allows the express server to avoid wrapping the call in a try-catch and it can differentiate between bad transaction requests and server errors (that throw an error)
    return res.status(200).send({
      status: false,
      error,
    });
  }

  return res.send({ status: true });
};
