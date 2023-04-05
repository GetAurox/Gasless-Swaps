import { Request, Response } from "express";
import getAllBalances, { AddressWithBalance } from "../helpers/getAllBalances";

export default async (_: Request, res: Response<AddressWithBalance[]>) => {
  const allBalances = await getAllBalances();

  return res.send(allBalances);
};
