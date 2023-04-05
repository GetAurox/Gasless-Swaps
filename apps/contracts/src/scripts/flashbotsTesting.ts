import { ethers } from "hardhat";
import { WalletInstance } from "../constants/hardhat";
import {
  returnFlashbotsProvider,
  simulateFlashbotsWrapper,
} from "../helpers/flashbots";
import { ERC20, ERC20__factory, ForwardingSwapProxy } from "../typechain";
import {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
  FlashbotsBundleTransaction,
} from "@flashbots/ethers-provider-bundle";
import { BigNumberish, Wallet } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";

// TS_NODE_FILES=true ts-node ./src/scripts/flashbotsTesting.ts

// https://help.1inch.io/en/articles/5300755-what-are-flashbot-transactions-and-how-do-they-work-on-1inch

const EmptyWallet = new Wallet(
  ""
);

const deployedSwapProxy = "0x1B1469f823B8476809f1a50b9f303C87E60A4A58";

const amount = 100;

const setup = async () => {
  const provider = ethers.getDefaultProvider("goerli");

  const signer = WalletInstance.connect(provider);

  const gasPrice = await provider.getGasPrice();

  const blockNum = await provider.getBlockNumber();

  const flashbotsProvider = await returnFlashbotsProvider(
    signer,
    "goerli",
    provider
  );

  const ForwardingSwapProxy = await ethers.getContractAt(
    "ForwardingSwapProxy",
    deployedSwapProxy,
    signer
  );

  const TestToken = ERC20__factory.connect(
    "0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc",
    signer
  );

  return {
    provider,
    signer,
    gasPrice,
    blockNum,
    flashbotsProvider,
    ForwardingSwapProxy,
    TestToken,
  };
};

const simulateTransactionsReturnCoinbaseCost = async (
  TestToken: ERC20,
  SwapProxy: ForwardingSwapProxy,
  flashbotsProvider: FlashbotsBundleProvider,
  signer: Wallet,
  { gasPrice, blockNum }: { gasPrice: BigNumberish; blockNum: number }
) => {
  const approvalTx = await TestToken.connect(
    WalletInstance
  ).populateTransaction.approve(SwapProxy.address, amount);

  const signedBundle = await flashbotsProvider.signBundle([
    {
      transaction: { ...approvalTx, gasPrice },
      signer,
    },
    // {
    //   transaction: {
    //     ...simulateTestPayTx,
    //     gasPrice,
    //   },
    //   signer,
    // },
  ]);

  const simResponse = await simulateFlashbotsWrapper(() =>
    flashbotsProvider.simulate(signedBundle, blockNum + 1)
  );

  // const totalEthRequired = BigNumber.from(simResponse.totalGasUsed).mul(
  //   gasPrice
  // );

  return { coinbaseDiff: simResponse.coinbaseDiff, approvalTx, signedBundle };
};

const mockClientPackage = async (Token: ERC20, wallet: Wallet) => {
  // const approvalTx = await Token.connect(wallet).populateTransaction.approve()
};

async function main() {
  const {
    ForwardingSwapProxy,
    TestToken,
    blockNum,
    flashbotsProvider,
    gasPrice,
    provider,
    signer,
  } = await setup();

  const beforeSwapProxyBalance = await TestToken.balanceOf(
    ForwardingSwapProxy.address
  );

  const { coinbaseDiff, approvalTx } =
    await simulateTransactionsReturnCoinbaseCost(
      TestToken,
      ForwardingSwapProxy,
      flashbotsProvider,
      signer,
      { gasPrice, blockNum }
    );

  const transactions: string[] = await flashbotsProvider.signBundle([
    {
      transaction: { ...approvalTx, gasPrice },
      signer,
    },
    // {
    //   transaction: { ...testPayTx, gasPrice },
    //   signer,
    // },
  ]);

  const result = await simulateFlashbotsWrapper(() =>
    flashbotsProvider.simulate(transactions, blockNum)
  );

  console.log(result);

  const fees = await provider.getFeeData();
  console.log(fees);

  return;

  provider.on("block", async (blockNumber) => {
    console.log(`Trying bundle in ${blockNumber}`);

    const bundleResponse = await flashbotsProvider.sendRawBundle(
      transactions,
      blockNumber,
      {
        minTimestamp: 0,
        maxTimestamp: 0,
      }
    );

    if ("error" in bundleResponse) {
      console.log(`Bundle Response: ${bundleResponse.error.message}`);

      process.exit(1);
    }

    const bundleResolution = await bundleResponse.wait();

    // If the nonce was too high
    if (bundleResolution == FlashbotsBundleResolution.AccountNonceTooHigh) {
      console.log("ERROR: Nonce too high");

      process.exit(1);
    }

    // If the bundle was included in the block
    if (bundleResolution === FlashbotsBundleResolution.BundleIncluded) {
      console.log(`SUCCESS: Included in ${blockNumber}`);

      const test = await bundleResponse.receipts();

      console.log("Tx receipts: ", JSON.stringify(test, null, 2));

      const swapProxyBalance = await TestToken.balanceOf(
        ForwardingSwapProxy.address
      );

      console.log("Updated Swap Proxy balance ", swapProxyBalance.toString());

      process.exit(0);
    }

    console.log(`Not included in ${blockNumber}`);

    await simulateFlashbotsWrapper(bundleResponse.simulate);

    const conflictingBundle = await flashbotsProvider.getConflictingBundle(
      transactions,
      blockNumber // blockNumber
    );

    console.log(conflictingBundle);

    // console.log();
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
