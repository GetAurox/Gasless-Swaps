/* eslint-disable camelcase */
import { ethers, Transaction } from "ethers";
import { parseTransaction, Result } from "ethers/lib/utils";

import { ERC20__factory } from "../typechain";

const ERC20Interface = ERC20__factory.createInterface();

export const decodeTx = <T extends Result>(
  tx: Transaction,
  iface: ethers.utils.Interface,
  expectedMethodName?: string
): T => {
  const sigHash = tx.data.slice(0, 10);

  const functionName = iface.getFunction(sigHash);

  if (expectedMethodName && functionName.name !== expectedMethodName)
    throw new Error(`Returned ${functionName.name} doesn
    t match ${expectedMethodName}`);

  return iface.decodeFunctionData(functionName, tx.data) as T;

  // const sigHash = txData.slice(0, 10);

  // const functionName = iface.getFunction(sigHash);

  // if (expectedMethodName && functionName.name !== expectedMethodName)
  //   throw new Error(`Returned ${functionName.name} doesn
  //   t match ${expectedMethodName}`);

  // return iface.decodeFunctionData(functionName, txData) as T;
};
