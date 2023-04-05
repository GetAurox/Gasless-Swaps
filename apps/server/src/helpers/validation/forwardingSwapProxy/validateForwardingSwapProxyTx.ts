import { Addresses } from "@aurox-gasless-swaps/constants";
import { validation, typechain } from "@aurox-gasless-swaps/services";
import { Transaction } from "ethers";
import { ZodError } from "zod";

import {
  contracts,
  ethersProvider,
  FROM_TOKEN_MISMATCH,
  INSUFFICIENT_APPROVAL_BALANCE,
  INSUFFICIENT_ETH_PROVIDED,
  INSUFFICIENT_FROM_TOKEN_BALANCE,
} from "../../../constants";
import {
  ValidatedApprovalTx,
  ValidatedForwardingSwapProxyTx,
  ValidationResponse,
} from "../../../types/validation";
import { decodeForwardingSwapProxyFunctionData } from "../../decode";

import {
  forwardingSwapDataSchema,
  proxySwapWithFeeTransactionSchema,
  validateApprovalSwapMatchingFieldsSchema,
} from "./validators";

export default async (
  swapProxyTx: Transaction,
  validatedApprovalTx: ValidatedApprovalTx | undefined
): Promise<ValidationResponse<ValidatedForwardingSwapProxyTx>> => {
  try {
    // Validate the transaction fields
    proxySwapWithFeeTransactionSchema.parse(swapProxyTx);

    const swapProxyParams = decodeForwardingSwapProxyFunctionData(
      swapProxyTx.data
    );

    const total = validation.getRequiredGasRefund(
      validatedApprovalTx?.transaction,
      swapProxyTx
    );

    // Validate the swap request parameters
    await forwardingSwapDataSchema(total.totalGasRefund).parseAsync(
      swapProxyParams
    );

    // Ensure if an approval transaction is provided that fields match
    if (validatedApprovalTx) {
      validateApprovalSwapMatchingFieldsSchema(
        validatedApprovalTx.transaction
      ).parse(swapProxyTx);

      // Approval transaction destination to address and the _fromToken specified by the params must match. Otherwise the user is potentially trying to sneak in an approval transaction for something else
      if (swapProxyParams._fromToken !== validatedApprovalTx.to) {
        // Keeping the validation consistent by using ZodErrors throughout
        throw new ZodError([
          {
            code: "custom",
            message: FROM_TOKEN_MISMATCH,
            path: ["_fromToken"],
          },
        ]);
      }
    }

    const fromToken = typechain.ERC20__factory.connect(
      swapProxyParams._fromToken,
      ethersProvider
    );

    // If the user isn't swapping with ETH, validate that the user will have enough approval balance to execute the swap
    if (swapProxyParams._fromToken !== Addresses.ETHAddress) {
      // If an approval tx is provided, use the amount from this as the approval balance, otherwise fetch it from the contract
      const approvalBalance = validatedApprovalTx
        ? validatedApprovalTx.params.amount
        : await fromToken.allowance(
          swapProxyTx.from as string,
          contracts.addresses.forwardingSwapProxy
        );

      if (approvalBalance.lt(swapProxyParams._swapParams.amount)) {
        throw new ZodError([
          {
            code: "custom",
            message: INSUFFICIENT_APPROVAL_BALANCE,
            path: ["amount"],
          },
        ]);
      }

      // Ensure the user has enough fromToken balance to execute the swap
      const balance = await fromToken.balanceOf(swapProxyTx.from as string);

      if (balance.lt(swapProxyParams._swapParams.amount)) {
        throw new ZodError([
          {
            code: "custom",
            message: INSUFFICIENT_FROM_TOKEN_BALANCE,
            path: ["amount"],
          },
        ]);
      }
    } else {
      // Validate the user attached enough ETH to the transaction to pay for the provided value amount
      if (swapProxyTx.value.lt(swapProxyParams._swapParams.value)) {
        throw new ZodError([
          {
            code: "custom",
            message: INSUFFICIENT_ETH_PROVIDED,
            path: ["value"],
          },
        ]);
      }

      // Then ensure they have enough ETH balance to cover the transaction
      const balance = await ethersProvider.getBalance(
        swapProxyTx.from as string
      );

      if (balance.lt(swapProxyTx.value)) {
        throw new ZodError([
          {
            code: "custom",
            message: INSUFFICIENT_FROM_TOKEN_BALANCE,
            path: ["amount"],
          },
        ]);
      }
    }

    return {
      response: {
        to: swapProxyTx.to as string,
        transaction: swapProxyTx,
        params: swapProxyParams,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { error };
    }

    throw new Error("Something else went wrong");
  }
};
