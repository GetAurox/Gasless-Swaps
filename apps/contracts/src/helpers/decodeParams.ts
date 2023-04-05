import { BigNumber } from "ethers";
import { IOneInchRouter__factory } from "../typechain";

const allowedFunctionNames = ["unoswap", "swap"] as const;

type AllowedFunctionNames = typeof allowedFunctionNames[number];

interface SwapParams {
  caller: string;
  desc: {
    srcToken: string;
    dstToken: string;
    srcReceiver: string;
    dstReceiver: string;
    amount: BigNumber;
    minReturnAmount: BigNumber;
    flags: BigNumber;
    permit: string;
  };
  data: string;
}

interface UnoswapParams {
  srcToken: string;
  amount: string;
  minReturn: string;
  pools: string[];
}

// function uniswapV3Swap(
//   uint256 amount,
//   uint256 minReturn,
//   uint256[] calldata pools
// ) external returns (uint256 returnAmount);

// function clipperSwap(
//   address srcToken,
//   address dstToken,
//   uint256 amount,
//   uint256 minReturn

/** Raw Types */
interface RawDecodedData<T extends AllowedFunctionNames, V extends any> {
  functionName: T;
  decodedData: V;
}

type UnoswapRawDecoded = RawDecodedData<"unoswap", UnoswapParams>;
type SwapRawDecoded = RawDecodedData<
  "swap",
  [SwapParams["caller"], SwapParams["desc"], SwapParams["data"]]
>;

/** Formatted Types */
interface FormattedDecodedData<T extends AllowedFunctionNames, V extends any> {
  functionName: T;
  params: V;
}

type UnoSwapDecoded = FormattedDecodedData<"unoswap", UnoswapParams>;
type SwapDecoded = FormattedDecodedData<"swap", SwapParams>;

export type DecodedSwapParamsUnion = UnoSwapDecoded | SwapDecoded;

export const decodeSwapParams = (data: string): DecodedSwapParamsUnion => {
  const iface = IOneInchRouter__factory.createInterface();

  const sigHash = data.slice(0, 10);

  const returnedFunction = iface.getFunction(sigHash) as {
    name: AllowedFunctionNames;
  };

  if (!allowedFunctionNames.includes(returnedFunction.name)) {
    throw new Error(
      `Returned function name: ${returnedFunction.name} not supported`
    );
  }

  const decodedData = iface.decodeFunctionData(
    returnedFunction.name,
    data
    // Casting to any here so that it fits the forced raw union type below
  ) as any;

  console.log(returnedFunction);

  console.log(decodedData);

  // Creating this middle-man object so that the params are typed within the below if statements
  const rawDecodedUnion: SwapRawDecoded | UnoswapRawDecoded = {
    functionName: returnedFunction.name,
    decodedData,
  };

  if (rawDecodedUnion.functionName === "unoswap") {
    return {
      functionName: "unoswap",
      params: {
        srcToken: rawDecodedUnion.decodedData.srcToken,
        amount: rawDecodedUnion.decodedData.amount,
        minReturn: rawDecodedUnion.decodedData.minReturn,
        pools: rawDecodedUnion.decodedData.pools,
      },
    };
  }

  if (rawDecodedUnion.functionName === "swap") {
    const paramData = rawDecodedUnion.decodedData[1];

    return {
      functionName: "swap",
      params: {
        caller: rawDecodedUnion.decodedData[0],
        // Unwrapped paramData here, this is because the returned raw decoded data includes the params as an array as well
        desc: {
          amount: paramData.amount,
          dstReceiver: paramData.dstReceiver,
          dstToken: paramData.dstToken,
          flags: paramData.flags,
          minReturnAmount: paramData.minReturnAmount,
          permit: paramData.permit,
          srcReceiver: paramData.srcReceiver,
          srcToken: paramData.srcToken,
        },
        data: rawDecodedUnion.decodedData[2],
      },
    };
  }

  throw new Error(`Unhandled function name ${returnedFunction.name}`);
};

// ! Unoswap
// 0x2e95b6c8000000000000000000000000c6dddb5bc6e61e0841c54f3e723ae1f3a807260b000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000587b336c765cc0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000180000000000000003b6d0340ebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977cfee7c08

// ! Swap
// 0x7c025200000000000000000000000000220bda5c8994804ac96ebe4df184d25e5c2196d400000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000180000000000000000000000000c6dddb5bc6e61e0841c54f3e723ae1f3a807260b000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000ebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977000000000000000000000000526293d322bbbee365b2ed3c423ed7008f314310000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000587b336c765cc00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a4b757fed6000000000000000000000000ebd54ad6c1d4b079bdc20ecf36dd29d1d76c9977000000000000000000000000c6dddb5bc6e61e0841c54f3e723ae1f3a807260b000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000002dc6c01111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cfee7c08
