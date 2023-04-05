import { ContractTransaction } from "ethers";
import { ERC20, ERC20__factory } from "../../typechain";
import { BigNumAssertionOptions, assertBigNumWithRange } from "./assertions";
import { Addresses } from "@aurox-gasless-swaps/constants";
import { ethers } from "hardhat";

export const getBalance = (Token: ERC20, address: string) => {
  if (Token.address.toLowerCase() === Addresses.ETHAddress.toLowerCase()) {
    return ethers.provider.getBalance(address);
  }

  return Token.balanceOf(address);
};

export const getChangeInBalance = async (
  Token: ERC20,
  address: string,
  tx: () => Promise<ContractTransaction>
) => {
  const beforeBalance = await getBalance(Token, address);

  const result = await (await tx()).wait();

  const afterBalance = await getBalance(Token, address);

  const changeInBalance = afterBalance.sub(beforeBalance);

  return { beforeBalance, afterBalance, changeInBalance, result };
};

export const assertBeforeAndAfterBalance = async (
  Token: ERC20 | string,
  {
    address,
    expectedValue,
    options,
  }: {
    address: string;
    expectedValue: string;
    options?: BigNumAssertionOptions;
  },
  affects: () => any | Promise<any>
) => {
  if (typeof Token === "string")
    Token = ERC20__factory.connect(Token, ethers.provider);

  const { beforeBalance, afterBalance, changeInBalance, result } =
    await getChangeInBalance(Token, address, affects);

  assertBigNumWithRange(expectedValue, changeInBalance, options);

  return { beforeBalance, afterBalance, changeInBalance, result };
};

export class TokenExtension {
  public Token: ERC20;

  constructor(_Token: ERC20) {
    this.Token = _Token;
  }

  getChangeInBalance = async (
    address: string,
    tx: () => Promise<ContractTransaction>
  ) => getChangeInBalance(this.Token, address, tx);

  assertBeforeAndAfterBalance = async (
    Token: ERC20,
    fields: {
      address: string;
      expectedValue: string;
      options?: BigNumAssertionOptions;
    },
    affects: () => any | Promise<any>
  ) => assertBeforeAndAfterBalance(Token, fields, affects);
}
