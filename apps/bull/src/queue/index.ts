import { Worker, WORKER_SUFFIX } from "bullmq";
import { bull } from "@aurox-gasless-swaps/services";
import reduce from "lodash/reduce";
import proxySwapQueueWithPrivateKey from "./handlers/proxySwapQueue";
import { PrivateKeyManager } from "../classes/PrivateKeyManager";
import { ethers } from "ethers";

console.log(
  `connecting to redis at ${bull.redisConnection.connection.host}:${bull.redisConnection.connection.port}`
);

export const proxySwapWorkers = reduce<ethers.Wallet, Record<string, Worker>>(
  PrivateKeyManager.wallets,
  (workers, wallet) => {
    workers[wallet.address] = new Worker(
      bull.PROXIED_SWAP_QUEUE,
      proxySwapQueueWithPrivateKey(wallet.privateKey),
      bull.redisConnection
    );

    return workers;
  },
  {}
);
