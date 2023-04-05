import { Queue } from "bullmq";
import { config } from "dotenv";

config();

const PORT = process.env.REDIS_PORT as string;
const HOST = process.env.REDIS_HOST as string;

export const redisConnection = {
  connection: {
    port: PORT,
    host: HOST,
  },
};

export const PROXIED_SWAP_QUEUE = "PROXIED_SWAP_QUEUE";

// Wrapping this in a function enclosure because it starts the redis server if its exported as a constant
export const getProxySwapQueue = () =>
  new Queue<ProxiedSwapJob>(PROXIED_SWAP_QUEUE, redisConnection);

export interface ProxiedSwapJob {
  approvalTx?: string;
  swapProxyTx: string;
  timeoutInUnix: number;
}
