import axios from "axios";
import { ContractTransaction, ethers } from "ethers";
import { config } from "dotenv";
// import { ERC20 } from "../typechain/ERC20";
import { ERC20, ERC20__factory } from "../typechain";

config();

export const txAwaitWrapper = async (
  txFunction: Promise<ContractTransaction>
) => {
  const { wait } = await txFunction;

  const tx = await wait();

  return tx;
};

export const cryptoCompareAPI = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/v2",
});

cryptoCompareAPI.interceptors.request.use((request) => {
  if (!request.params) request.params = {};

  request.params.api_key = process.env.CRYPTO_COMPARE_API_KEY;

  return request;
});

// ! Deprecated
export const getPrice = async (
  fromToken: ERC20 | string,
  toToken: ERC20 | string,
  timestamp: number,
  provider: ethers.providers.Provider
) => {
  if (typeof fromToken === "string") {
    fromToken = ERC20__factory.connect(fromToken, provider);
  }

  if (typeof toToken === "string") {
    toToken = ERC20__factory.connect(toToken, provider);
  }

  const fromTokenSymbol = await fromToken.symbol();
  const toTokenSymbol = await toToken.symbol();

  const {
    data: { Data },
  } = await cryptoCompareAPI.get("/histohour", {
    // Limit to the amount of hours in a fortnight, as we will be caching the whole fortnight to reduce queries over time
    params: {
      fsym: fromTokenSymbol,
      tsym: toTokenSymbol,
      limit: 10,
      toTs: timestamp,
    },
  });

  // return Data.Data.close.toString(),

  // const formattedResponses = formatAssetConversionRateResponses(
  //   Data.Data,
  //   asset
  // );

  // return formattedResponses;
};
