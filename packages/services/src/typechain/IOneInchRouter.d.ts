/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface IOneInchRouterInterface extends ethers.utils.Interface {
  functions: {
    "clipperSwap(address,address,uint256,uint256)": FunctionFragment;
    "swap(address,(address,address,address,address,uint256,uint256,uint256,bytes),bytes)": FunctionFragment;
    "uniswapV3Swap(uint256,uint256,uint256[])": FunctionFragment;
    "unoswap(address,uint256,uint256,bytes32[])": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "clipperSwap",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [
      string,
      {
        srcToken: string;
        dstToken: string;
        srcReceiver: string;
        dstReceiver: string;
        amount: BigNumberish;
        minReturnAmount: BigNumberish;
        flags: BigNumberish;
        permit: BytesLike;
      },
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "uniswapV3Swap",
    values: [BigNumberish, BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "unoswap",
    values: [string, BigNumberish, BigNumberish, BytesLike[]]
  ): string;

  decodeFunctionResult(
    functionFragment: "clipperSwap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "uniswapV3Swap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unoswap", data: BytesLike): Result;

  events: {};
}

export class IOneInchRouter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: IOneInchRouterInterface;

  functions: {
    clipperSwap(
      srcToken: string,
      dstToken: string,
      amount: BigNumberish,
      minReturn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    swap(
      caller: string,
      desc: {
        srcToken: string;
        dstToken: string;
        srcReceiver: string;
        dstReceiver: string;
        amount: BigNumberish;
        minReturnAmount: BigNumberish;
        flags: BigNumberish;
        permit: BytesLike;
      },
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    uniswapV3Swap(
      amount: BigNumberish,
      minReturn: BigNumberish,
      pools: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    unoswap(
      srcToken: string,
      amount: BigNumberish,
      minReturn: BigNumberish,
      pools: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  clipperSwap(
    srcToken: string,
    dstToken: string,
    amount: BigNumberish,
    minReturn: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  swap(
    caller: string,
    desc: {
      srcToken: string;
      dstToken: string;
      srcReceiver: string;
      dstReceiver: string;
      amount: BigNumberish;
      minReturnAmount: BigNumberish;
      flags: BigNumberish;
      permit: BytesLike;
    },
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  uniswapV3Swap(
    amount: BigNumberish,
    minReturn: BigNumberish,
    pools: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  unoswap(
    srcToken: string,
    amount: BigNumberish,
    minReturn: BigNumberish,
    pools: BytesLike[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    clipperSwap(
      srcToken: string,
      dstToken: string,
      amount: BigNumberish,
      minReturn: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    swap(
      caller: string,
      desc: {
        srcToken: string;
        dstToken: string;
        srcReceiver: string;
        dstReceiver: string;
        amount: BigNumberish;
        minReturnAmount: BigNumberish;
        flags: BigNumberish;
        permit: BytesLike;
      },
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & { returnAmount: BigNumber; gasLeft: BigNumber }
    >;

    uniswapV3Swap(
      amount: BigNumberish,
      minReturn: BigNumberish,
      pools: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    unoswap(
      srcToken: string,
      amount: BigNumberish,
      minReturn: BigNumberish,
      pools: BytesLike[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    clipperSwap(
      srcToken: string,
      dstToken: string,
      amount: BigNumberish,
      minReturn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    swap(
      caller: string,
      desc: {
        srcToken: string;
        dstToken: string;
        srcReceiver: string;
        dstReceiver: string;
        amount: BigNumberish;
        minReturnAmount: BigNumberish;
        flags: BigNumberish;
        permit: BytesLike;
      },
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    uniswapV3Swap(
      amount: BigNumberish,
      minReturn: BigNumberish,
      pools: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    unoswap(
      srcToken: string,
      amount: BigNumberish,
      minReturn: BigNumberish,
      pools: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    clipperSwap(
      srcToken: string,
      dstToken: string,
      amount: BigNumberish,
      minReturn: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    swap(
      caller: string,
      desc: {
        srcToken: string;
        dstToken: string;
        srcReceiver: string;
        dstReceiver: string;
        amount: BigNumberish;
        minReturnAmount: BigNumberish;
        flags: BigNumberish;
        permit: BytesLike;
      },
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    uniswapV3Swap(
      amount: BigNumberish,
      minReturn: BigNumberish,
      pools: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    unoswap(
      srcToken: string,
      amount: BigNumberish,
      minReturn: BigNumberish,
      pools: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
