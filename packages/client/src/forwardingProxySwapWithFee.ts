/* eslint-disable camelcase */
import { Addresses, gasCosts } from "@aurox-gasless-swaps/constants";
import { deployment } from "@aurox-gasless-swaps/contracts";
import {
  common,
  OneInch,
  typechain,
  validation,
} from "@aurox-gasless-swaps/services";
import { config } from "dotenv";
import { BigNumber, ethers, PopulatedTransaction, Wallet } from "ethers";
import { formatEther, formatUnits, parseEther } from "ethers/lib/utils";

import { BackendAxiosInstance } from "./constants/BackendAxios";
import { MAX_UINT256 } from "./constants/common";
import { getGasFees } from "./helpers/fees";
import { tryGetGasEstimate } from "./helpers/gasLimits";

const { ERC20__factory } = typechain;
config();

export enum ErrorType {
  NotEnoughSwapTokenBalance = "NotEnoughSwapTokenBalance",
}

interface SwapReq {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
}

type Error = { error: { type: ErrorType; log: string } };

interface Response {
  txHash: string;
}

const getBalance = async (
  user: string,
  fromToken: typechain.ERC20,
  provider: ethers.providers.Provider
) => {
  if (fromToken.address === Addresses.ETHAddress) {
    return provider.getBalance(user);
  }

  return fromToken.balanceOf(user);
};

const getSwapProxyTxWithGasLimit = async (
  ForwardingSwapProxy: typechain.ForwardingSwapProxy,
  provider: ethers.providers.Provider,
  wallet: Wallet,
  reqSwapParams: OneInch.RequestSwapParams,
  formattedSwapParams: OneInch.FormattedOneInchSwapResult["formattedSwapParams"],
  gasRefund: BigNumber,
  minimumReturnAmount: BigNumber,
  { chainId, ...options }: ethers.PayableOverrides & { chainId: number }
): Promise<ethers.PopulatedTransaction> => {
  const swapProxyTx = await ForwardingSwapProxy.connect(
    wallet
  ).populateTransaction.proxySwapWithFee(
    reqSwapParams.fromTokenAddress,
    reqSwapParams.toTokenAddress,
    formattedSwapParams,
    gasRefund,
    minimumReturnAmount,
    options
  );

  swapProxyTx.chainId = chainId;

  let gasEstimate: BigNumber;
  try {
    gasEstimate = await provider.estimateGas(swapProxyTx);
    // Add 25% buffer to the gasEstimate for safety
    gasEstimate = gasEstimate.add(gasEstimate.div(4));
  } catch (e) {
    gasEstimate = gasCosts.forwardingSwapProxyTxGasLimit;
  }

  return {
    ...swapProxyTx,
    gasLimit: gasEstimate,
  };
};

// Fixed cost for the Sponsor Transaction
export const proxySwapWithFeeUniswap = async (
  wallet: Wallet,
  provider: ethers.providers.BaseProvider,
  reqSwapParams: SwapReq,
  options?: { slippage: number }
): Promise<Response | Error> => {
  if (BigNumber.from(reqSwapParams.amount).lte(0))
    throw new Error("Amount must be greater than 0");

  const Contracts = deployment.DeploymentSingleton.getDeployedContracts(
    "mainnet",
    provider
  );

  const fromToken = ERC20__factory.connect(
    reqSwapParams.fromTokenAddress,
    provider
  );

  const fromTokenBalance = await getBalance(
    wallet.address,
    fromToken,
    provider
  );

  const usersBalanceDiff = BigNumber.from(reqSwapParams.amount).sub(
    fromTokenBalance
  );

  //   If the user doesn't have enough token balance to cover the swap
  if (usersBalanceDiff.gt(0)) {
    return {
      error: {
        type: ErrorType.NotEnoughSwapTokenBalance,
        log: `Requested swap to ${
          fromToken.address
        }, user is missing ${usersBalanceDiff.toString()} tokens`,
      },
    };
  }

  const walletNonce = await provider.getTransactionCount(wallet.address);

  const gasFees = await getGasFees(provider);

  let approvalTx: PopulatedTransaction | undefined;

  if (fromToken.address.toLowerCase() !== Addresses.ETHAddress.toLowerCase()) {
    const allowance = await fromToken.allowance(
      wallet.address,
      Contracts.ForwardingSwapProxy.address
    );
    if (allowance.lt(reqSwapParams.amount)) {
      approvalTx = (await fromToken.populateTransaction.approve(
        Contracts.ForwardingSwapProxy.address,
        MAX_UINT256,
        {
          nonce: walletNonce,
          maxFeePerGas: gasFees.maxFeePerGas,
          maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
          type: 2,
        }
      )) as ethers.PopulatedTransaction;

      approvalTx.chainId = 1;

      const approvalGasLimit = await tryGetGasEstimate(
        { ...approvalTx, from: wallet.address },
        provider,
        "approvalTxGasLimit"
      );

      approvalTx.gasLimit = approvalGasLimit;
    }
  }

  const { formattedSwapParams } = await OneInch.getSwapParams({
    from: wallet.address,
    ...reqSwapParams,
  });

  const valueWithSlippage = BigNumber.from(reqSwapParams.amount)
    .mul(
      // 10% Slippage by default, unless overridden by options
      parseEther((options?.slippage ?? 0.1).toString())
    )
    .div(parseEther("1"));

  const fakeSwapProxyTx = await getSwapProxyTxWithGasLimit(
    Contracts.ForwardingSwapProxy as any,
    provider,
    wallet,
    { from: wallet.address, ...reqSwapParams },
    formattedSwapParams,
    // Using a dummy value here
    BigNumber.from(50),
    valueWithSlippage,
    {
      maxFeePerGas: gasFees.maxFeePerGas,
      maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
      type: 2,
      chainId: 1,
      value: formattedSwapParams.value,
    }
  );

  const total = validation.getRequiredGasRefund(approvalTx, fakeSwapProxyTx);

  console.log(
    "Total cost in ETH: ",
    formatEther(total.totalSponsorTransactionCost)
  );

  const swapProxyTx = await Contracts.ForwardingSwapProxy.connect(
    wallet
  ).populateTransaction.proxySwapWithFee(
    reqSwapParams.fromTokenAddress,
    reqSwapParams.toTokenAddress,
    formattedSwapParams,
    total.totalGasRefund,
    0,
    {
      gasLimit: fakeSwapProxyTx.gasLimit,
      maxFeePerGas: gasFees.maxFeePerGas,
      maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
      nonce: approvalTx ? walletNonce + 1 : walletNonce,
      value: formattedSwapParams.value,
      type: 2,
    }
  );
  swapProxyTx.chainId = 1;

  try {
    const response = await BackendAxiosInstance.post("/gasless-swap", {
      from: wallet.address,
      approvalTx: approvalTx
        ? await wallet.signTransaction(approvalTx)
        : undefined,
      swapProxyTx: await wallet.signTransaction(swapProxyTx),
      // Plus 2.5 minutes
      timeoutInUnix: common.getNowInUnix() + 150,
    });

    console.log("Sent successfully!");
  } catch (error: any) {
    console.log("Error: \t", error.response.data);
  }

  return { txHash: "" };
};
