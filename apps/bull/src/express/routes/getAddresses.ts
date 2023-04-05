import { Request, Response } from "express";
import { PrivateKeyManager } from "../../classes/PrivateKeyManager";

export default async (_: Request, res: Response<string[]>) =>
  res.send(PrivateKeyManager.wallets.map((wallet) => wallet.address));
