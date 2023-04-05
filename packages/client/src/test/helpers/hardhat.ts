import { JsonRpcSigner } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { network, ethers } from "hardhat";

export const impersonateAndReturnAccount = async (
  impersonateAddress: string,
  signer: SignerWithAddress
): Promise<JsonRpcSigner> => {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [impersonateAddress],
  });

  await signer.sendTransaction({
    to: impersonateAddress,
    value: ethers.utils.parseEther("5"),
  });

  return ethers.provider.getSigner(impersonateAddress);
};
