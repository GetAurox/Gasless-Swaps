import { typechain } from "@aurox-gasless-swaps/services";

import { ForwardingSwapProxyArgs } from "../types/validation";

const iface = typechain.ForwardingSwapProxy__factory.createInterface();

/**
 * This method decodes a forwarding swap proxy data object. It strictly destructures the returned object because by default it returns the response as a weird array object that isn't compatible with much
 */
export const decodeForwardingSwapProxyFunctionData = (
  data: string
): ForwardingSwapProxyArgs => {
  const {
    _fromToken,
    _toToken,
    _swapParams,
    _gasRefund,
    _minimumReturnAmount,
  } = iface.decodeFunctionData("proxySwapWithFee", data);

  return {
    _fromToken,
    _toToken,
    _swapParams: {
      to: _swapParams.to,
      amount: _swapParams.amount,
      value: _swapParams.value,
      data: _swapParams.data,
    },
    _gasRefund,
    _minimumReturnAmount,
  };
};
