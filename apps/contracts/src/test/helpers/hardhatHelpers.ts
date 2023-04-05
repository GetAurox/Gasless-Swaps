import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { HardhatForkBlockNumber } from "../../constants/hardhat";
import { JsonRpcSigner } from "@ethersproject/providers";

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

export const resetFork = async () => {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${
            process.env.ALCHEMY_API_KEY ?? ""
          }`,
          blockNumber: HardhatForkBlockNumber,
        },
      },
    ],
  });
};
