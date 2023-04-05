import { typechain } from "@aurox-gasless-swaps/services";
import { BigNumber, Transaction } from "ethers";
import { z } from "zod";

import {
  contracts,
  INVALID_TO_ADDRESS_FORWARDING_SWAP,
  INSUFFICIENT_GAS_REFUND,
  FEE_FIELD_MISMATCH,
  FROM_FIELD_MISMATCH,
} from "../../../constants";
import {
  PopulatedTransactionSchema,
  sigHashDataValidation,
  addressValidation,
  bigNumberValidation,
  bigNumberValidationAndZeroCheck,
} from "../common";

const iface = typechain.ForwardingSwapProxy__factory.createInterface();

export const proxySwapWithFeeTransactionSchema = PopulatedTransactionSchema({
  data: sigHashDataValidation(iface.getSighash("proxySwapWithFee")),
});

export const forwardingSwapDataSchema = (requiredGasRefund: BigNumber) =>
  z.object({
    // Address validation
    _fromToken: addressValidation,
    _toToken: addressValidation,
    _swapParams: z.object({
      // Validate whether the users destination to address is within the whitelist
      to: z.custom(
        (value) =>
          typeof value === "string" &&
          contracts.ForwardingSwapProxy.isWhitelisted(value),
        {
          message: INVALID_TO_ADDRESS_FORWARDING_SWAP,
        }
      ),
      // Not checking 0 values in this validation, as either field might be populated for the swap
      amount: bigNumberValidation,
      value: bigNumberValidation,
      // Not enforcing a sigHash here as many swap functions will be used
      data: z.string(),
    }),
    _gasRefund: z.custom((gasRefund: any) => requiredGasRefund.lte(gasRefund), {
      message: INSUFFICIENT_GAS_REFUND,
    }),
    _minimumReturnAmount: bigNumberValidation,
  });

/**
 * The maxFeePerGas and maxPriorityFeePerGas must be the same on both requests (when the approvalTx is provided), this increases the chance of flashbots accepting the bundle.
 * We only use this validator when the approvalTx is also provided
 */
export const validateApprovalSwapMatchingFieldsSchema = (
  approvalTx: Transaction
) =>
  z.object({
    maxFeePerGas: bigNumberValidationAndZeroCheck,
    maxPriorityFeePerGas: bigNumberValidationAndZeroCheck,
    // From must be the same on both requests
    from: z.custom(
      (value: any) =>
        typeof value === "string" &&
        value.toLowerCase() === approvalTx.from!.toLowerCase(),
      {
        message: FROM_FIELD_MISMATCH,
      }
    ),
  });
