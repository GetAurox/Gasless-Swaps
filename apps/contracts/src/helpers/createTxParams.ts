import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { AuroxToken } from "../test/helpers/contracts";

export const createTxParams = async (
  approvalAmount: number,
  signer: SignerWithAddress
) => {
  const txCount = await ethers.provider.getTransactionCount(
    signer.getAddress()
  );

  const approvalTx = await AuroxToken.connect(
    signer
  ).populateTransaction.approve(AuroxToken.address, approvalAmount);

  const tx = {
    ...approvalTx,
    nonce: txCount,
    gasPrice: 679470473,
  };

  console.log(tx);

  const signed = await signer.signTransaction(tx);

  return signed;
};
