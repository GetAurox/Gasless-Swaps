import { z } from "zod";

export const GaslessSwapBody = z.object({
  approvalTx: z.string().optional(),
  swapProxyTx: z.string(),
  timeoutInUnix: z.number(),
});

export type GaslessType = z.infer<typeof GaslessSwapBody>;
