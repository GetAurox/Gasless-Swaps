import { BigNumber, ethers } from "ethers";
import { z, ZodType, ZodTypeDef } from "zod";

import {
  INVALID_CHAINID,
  INVALID_METHOD_NAME,
  INVALID_TRANSACTION_TYPE,
} from "../../constants";

export const addressValidation = z.custom((value: any) =>
  ethers.utils.isAddress(value)
);

export const bigNumberValidation = z.custom(
  (value) => value instanceof BigNumber
);

export const bigNumberValidationAndZeroCheck = z.custom(
  (value) => value instanceof BigNumber && value.gt(0)
);

export const sigHashDataValidation = (expectedSigHash: string) =>
  z.custom(
    (data) => typeof data === "string" && data.slice(0, 10) === expectedSigHash,
    { message: INVALID_METHOD_NAME }
  );

/**
 * This zod schema validates provided transactions. There are some specific enforcements here; chainId = 1 and type 2 transactions only.
 * This also supports providing custom data validation, which is useful when validating approval transactions and swap transactions, to ensure the right sigHash is used
 */
export const PopulatedTransactionSchema = ({
  data,
}: {
  data: ZodType<unknown, ZodTypeDef, unknown>;
}) =>
  z.object({
    to: addressValidation,
    from: addressValidation,
    data,
    gasLimit: bigNumberValidationAndZeroCheck,
    nonce: z.number(),
    // TODO: Add validation for this
    maxFeePerGas: bigNumberValidationAndZeroCheck,
    maxPriorityFeePerGas: bigNumberValidationAndZeroCheck,
    r: z.string(),
    s: z.string(),
    v: z.number(),
    chainId: z.custom((chainId) => chainId === 1, {
      message: INVALID_CHAINID,
    }),
    type: z.custom((type) => type === 2, {
      message: INVALID_TRANSACTION_TYPE,
    }),
    value: bigNumberValidation.optional(),
  });
