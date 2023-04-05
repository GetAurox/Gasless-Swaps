import * as Addresses from "./addresses";
import * as chainIds from "./chainIds";
import * as gasCosts from "./gasCosts";

export * as responses from "./responses";

const isAddressETH = (address: string) =>
  address.toLowerCase() === Addresses.ETHAddress.toLowerCase();

export { Addresses, isAddressETH, gasCosts, chainIds };
