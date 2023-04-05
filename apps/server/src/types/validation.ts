import { BigNumber, Transaction } from "ethers";
import { ZodError } from "zod";

export type ValidationResponse<T> = { error: ZodError } | { response: T };

export type ValidatedApprovalTx = ParsedTx<{
  spender: string;
  amount: BigNumber;
}>;

export interface ForwardingSwapProxyArgs {
  _fromToken: string;
  _toToken: string;
  _swapParams: {
    to: string;
    amount: BigNumber;
    value: BigNumber;
    data: string;
  };
  _gasRefund: BigNumber;
  _minimumReturnAmount: BigNumber;
}

export type ValidatedForwardingSwapProxyTx = ParsedTx<ForwardingSwapProxyArgs>;

export interface ParsedTx<T> {
  to: string;
  params: T;
  transaction: Transaction;
}
