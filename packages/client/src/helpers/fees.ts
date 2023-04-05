import { ethers, BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

const PRIORITY_FEE = ethers.utils.parseUnits("2", "gwei");

export const getGasFees = async (
  provider: ethers.providers.BaseProvider
): Promise<{ maxFeePerGas: BigNumber; maxPriorityFeePerGas: BigNumber }> => {
  const { baseFeePerGas } = await provider.getBlock("latest");
  const maxPriorityFeePerGas = PRIORITY_FEE;

  if (!baseFeePerGas) {
    throw new Error("Failed to get the baseFeePerGas");
  }

  // Overriding the ethers calculation of: Max Fee = (2 * Base Fee) + Max Priority Fee. Instead multiplying the Base Fee by 1.5, this is to reduce the amount of ETH that needs to be sent to the user
  const maxFeePerGas = baseFeePerGas
    .add(baseFeePerGas.div(4))
    .add(maxPriorityFeePerGas);

  console.log("Base fee: ", formatUnits(baseFeePerGas.toString(), "gwei"));
  console.log("Max fee per gas", formatUnits(maxFeePerGas.toString(), "gwei"));
  console.log(
    "Using priority fee: ",
    formatUnits(maxPriorityFeePerGas.toString(), "gwei")
  );

  return { maxFeePerGas, maxPriorityFeePerGas };
};
