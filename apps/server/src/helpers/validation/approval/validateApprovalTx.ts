import { typechain } from "@aurox-gasless-swaps/services";
import { Transaction } from "ethers";
import { z, ZodError } from "zod";

import { contracts, INVALID_SPENDER } from "../../../constants";
import {
  ValidatedApprovalTx,
  ValidationResponse,
} from "../../../types/validation";
import {
  bigNumberValidationAndZeroCheck,
  PopulatedTransactionSchema,
  sigHashDataValidation,
} from "../common";

const iface = typechain.ERC20__factory.createInterface();

const approvalTransactionSchema = PopulatedTransactionSchema({
  data: sigHashDataValidation(iface.getSighash("approve")),
});

const approvalDataSchema = z.object({
  // Using a custom validator here instead of literal to allow for consistent response types
  spender: z.custom(
    (spender) =>
      typeof spender === "string" &&
      spender.toLowerCase() ===
        contracts.addresses.forwardingSwapProxy.toLowerCase(),
    {
      message: INVALID_SPENDER,
    }
  ),
  amount: bigNumberValidationAndZeroCheck,
});

export default (
  approvalTx: Transaction
): ValidationResponse<ValidatedApprovalTx> => {
  try {
    approvalTransactionSchema.parse(approvalTx);

    const { spender, amount } = iface.decodeFunctionData(
      "approve",
      approvalTx.data
    );

    approvalDataSchema.parse({ spender, amount });

    return {
      response: {
        to: approvalTx.to as string,
        transaction: approvalTx,
        params: {
          spender,
          amount,
        },
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { error };
    }

    throw new Error("Something else went wrong");
  }
};
