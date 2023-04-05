import { Addresses, isAddressETH } from "@aurox-gasless-swaps/constants";
import axios from "axios";
import { BigNumber } from "ethers";

import { DecodedSwapParamsUnion, decodeSwapParams } from "./decodeParams";

export interface RequestSwapParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  from: string;
  chainId?: number;
  destReceiver: string;
}

export interface TokenDetails {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI: string;
  isCustom: boolean;
}

export interface OneInchSwapResult {
  fromToken: TokenDetails;
  toToken: TokenDetails;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas?: number;
    gasLimit: string;
    gasPrice: string;
  };
}

export interface FormattedOneInchSwapResult extends OneInchSwapResult {
  formattedSwapParams: {
    to: string;
    amount: string;
    value: string;
    data: string;
  };
}

export const OneInchAxiosInstance = axios.create({
  baseURL: "https://api.1inch.io/v4.0",
});

export const getSwapParams = async ({
  from,
  fromTokenAddress,
  toTokenAddress,
  amount,
  chainId = 1,
  destReceiver,
}: RequestSwapParams): Promise<FormattedOneInchSwapResult> => {
  try {
    const { data }: { data: OneInchSwapResult } =
      await OneInchAxiosInstance.get(`/${chainId}/swap`, {
        params: {
          fromTokenAddress,
          toTokenAddress,
          fromAddress: from,
          amount,
          slippage: 20,
          disableEstimate: true,
          allowPartialFill: false,
          destReceiver,
          // destReceiver: destReceiver ?? from,
        },
      });

    delete data.tx.gas;

    const formattedSwapParams: FormattedOneInchSwapResult["formattedSwapParams"] =
      {
        to: data.tx.to,
        amount,
        data: data.tx.data,
        value: isAddressETH(fromTokenAddress) ? amount : "0",
      };

    return {
      ...data,
      tx: {
        ...data.tx,
        // This needs to be a HEX string to work
        gasPrice: BigNumber.from(data.tx.gasPrice).toHexString(),
        value: BigNumber.from(data.tx.value).toHexString(),
      },
      formattedSwapParams,
    };
  } catch (e) {
    console.log(e);
    throw new Error(e as any);
  }
};
