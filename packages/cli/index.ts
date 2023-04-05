import { proxySwapWithFeeUniswap } from "@aurox-gasless-swaps/client";
import { Addresses } from "@aurox-gasless-swaps/constants";
import { flashbots, typechain } from "@aurox-gasless-swaps/services";
import { Command } from "commander";
import { config } from "dotenv";
import { ethers } from "ethers";

const { USDCAddress, AuroxAddress } = Addresses;

config();

const provider = new ethers.providers.InfuraProvider(
  "mainnet",
  process.env.INFURA_API_KEY
);

const program = new Command();

program
  .name("gasless-swap-cli")
  .description("CLI to test gasless swapping")
  .version("1.0.0");

program
  .command("swap")
  .description("Tries to execute a swap with the provided arguments")
  .argument("<private key>", "private key")
  .argument("<fromToken>", "fromToken")
  .argument("<toToken>", "toToken")
  .argument("<amount>", "amount")
  .action(async (privateKey, fromToken, toToken, amount) => {
    const wallet = new ethers.Wallet(privateKey);
    const response = await proxySwapWithFeeUniswap(wallet, provider, {
      amount,
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
    });

    if ("error" in response) throw new Error(JSON.stringify(response.error));
  });

program.command("lazy-swap").action(async () => {
  const fromTokenAddress = Addresses.ETHAddress;
  const toTokenAddress = Addresses.UniAddress;

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string);

  const response = await proxySwapWithFeeUniswap(wallet, provider, {
    // amount: (await fromToken.balanceOf(wallet.address)).toString(),
    amount: ethers.utils.parseEther("0.02").toString(),
    fromTokenAddress,
    toTokenAddress,
  });

  if ("error" in response) throw new Error(JSON.stringify(response.error));
});

program.parse();
