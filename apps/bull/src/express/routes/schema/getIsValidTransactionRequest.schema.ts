import { z } from "zod";

export const IsValidTransactionRequestBody = z.object({
  approvalTx: z.string().optional(),
  swapProxyTx: z.string(),
});

export type IsValidTransactionRequestType = z.infer<
  typeof IsValidTransactionRequestBody
>;
