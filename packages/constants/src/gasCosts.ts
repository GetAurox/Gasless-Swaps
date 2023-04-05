import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

// Gas cost estimates taken from test cases running the hardhat-gas-reporter plugin

// This is a bland sendTransaction to send ETH and uses this much gas
export const sponsorTxGasLimit = BigNumber.from(21000);

// NOTE: These estimates are so big because each call is made to a new ERC20 contract and initial state changes from 0 -> anything costs more gas
// Min            Max            Avg
// 46286  ·       59963  ·       48338
// 20 calls
export const approvalTxGasLimit = BigNumber.from(65000);

// Min            Max            Avg
// 174569  ·      492768  ·      274854
// 12 calls
export const forwardingSwapProxyTxGasLimit = BigNumber.from(550000);

// The maximum that a user requesting a sponsored transaction can receive
export const maximumSponsorAmount = parseEther("0.04");
