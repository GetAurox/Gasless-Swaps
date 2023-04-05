import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers } from "hardhat";
import {
  FeedRegistryInterface,
  FeedRegistryInterface__factory,
  BaseSwapProxy,
} from "../typechain";
import { Addresses } from "@aurox-gasless-swaps/constants";
import chai, { expect } from "chai";
import { assertBigNumWithRange } from "./helpers/assertions";
import { parseEther } from "ethers/lib/utils";
import { BigNumberish, Wallet } from "ethers";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const {
  DaiAddress,
  ChainlinkFeedRegistry,
  AuroxAddress,
  ETHAddress,
  WETHAddress,
  BurnAddress,
  UniAddress,
  OneInchTokenAddress,
  BalancerTokenAddress,
  CompTokenAddress,
  USDCAddress,
} = Addresses;

const invertRate = (rate: BigNumberish) =>
  parseEther("1").mul(parseEther("1")).div(rate);

describe("exchangeRate - getExchangeRate", () => {
  let baseSwapProxy: BaseSwapProxy;
  let user: SignerWithAddress;

  let chainlinkFeedRegistry: FeedRegistryInterface;

  before(async () => {
    [user] = await ethers.getSigners();
    const wallet = Wallet.fromMnemonic(process.env.MNEMONIC as string);

    console.log(wallet.privateKey);
    const BaseSwapProxy = await ethers.getContractFactory("BaseSwapProxy");
    baseSwapProxy = await BaseSwapProxy.deploy(user.address);

    chainlinkFeedRegistry = FeedRegistryInterface__factory.connect(
      ChainlinkFeedRegistry,
      user
    );
  });

  it("should fetch the exchange rate from chain-link for 2 supported tokens", async () => {
    const swapProxyRate = await baseSwapProxy.getExchangeRate(
      DaiAddress,
      ETHAddress
    );

    const chainlinkRate = await baseSwapProxy.getChainlinkRate(
      DaiAddress,
      ETHAddress
    );

    expect(chainlinkRate).eq(swapProxyRate);
  });

  it("should fetch the exchange rate from uniswap when chainlink doesnt support the token pair", async () => {
    const chainlinkRate = await baseSwapProxy.getChainlinkRate(
      AuroxAddress,
      WETHAddress
    );
    expect(chainlinkRate).eq(0);

    const swapProxyRate = await baseSwapProxy.getExchangeRate(
      AuroxAddress,
      WETHAddress
    );

    const uniswapV2Rate = await baseSwapProxy.getUniswapV2Rate(
      AuroxAddress,
      WETHAddress
    );

    expect(swapProxyRate).eq(uniswapV2Rate);
  });

  it("should fetch 1 ether as the rate when supplying ETH and WETH", async () => {
    const rate = await baseSwapProxy.getExchangeRate(ETHAddress, WETHAddress);
    expect(rate).eq(parseEther("1"));
  });

  it("should fetch 1 ether as the rate when supplying ETH and ETH", async () => {
    const rate = await baseSwapProxy.getExchangeRate(ETHAddress, ETHAddress);
    expect(rate).eq(parseEther("1"));
  });

  it("should fetch 1 ether as the rate when supplying WETH and WETH", async () => {
    const rate = await baseSwapProxy.getExchangeRate(WETHAddress, WETHAddress);
    expect(rate).eq(parseEther("1"));
  });

  it("should fetch 1 ether as the rate when supplying WETH and ETH", async () => {
    const rate = await baseSwapProxy.getExchangeRate(WETHAddress, ETHAddress);
    expect(rate).eq(parseEther("1"));
  });
});
/*
 * Chainlink
 */

describe("exchangeRate - Chainlink", () => {
  let baseSwapProxy: BaseSwapProxy;
  let user: SignerWithAddress;

  before(async () => {
    [user] = await ethers.getSigners();

    const BaseSwapProxy = await ethers.getContractFactory("BaseSwapProxy");
    baseSwapProxy = await BaseSwapProxy.deploy(user.address);
  });

  it("should return 0 when providing invalid pair addresses to chainlinkRate function", async () => {
    const chainlinkRate = await baseSwapProxy.getChainlinkRate(
      BurnAddress,
      ETHAddress
    );

    expect(chainlinkRate).eq(0);
  });

  it("tests the returning the inverted rate works", async () => {
    const returnedInvertedRate = await baseSwapProxy.getChainlinkRate(
      DaiAddress,
      ETHAddress
    );

    const originalRate = await baseSwapProxy.getChainlinkRate(
      ETHAddress,
      DaiAddress
    );

    const convertedRate = invertRate(returnedInvertedRate);

    assertBigNumWithRange(originalRate, convertedRate);
  });

  it("tests that getting a rate, where a direct rate doesn't exist works", async () => {
    const returnedRate = await baseSwapProxy.getChainlinkRate(
      OneInchTokenAddress,
      BalancerTokenAddress
    );
    const expectedRate = await baseSwapProxy.getUniswapV2Rate(
      OneInchTokenAddress,
      BalancerTokenAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate);
  });

  it("tests again that returning a rate without a direct pair works with chainlink", async () => {
    const returnedRate = await baseSwapProxy.getChainlinkRate(
      DaiAddress,
      CompTokenAddress
    );
    const expectedRate = await baseSwapProxy.getUniswapV2Rate(
      DaiAddress,
      CompTokenAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate, { range: 0.2 });
  });

  it("should return the same scaled rate as uniswap V2 when supplying tokens that don't have a direct pair and a _fromToken will less than 18 decimals", async () => {
    const returnedRate = await baseSwapProxy.getChainlinkRate(
      USDCAddress,
      OneInchTokenAddress
    );

    const expectedRate = await baseSwapProxy.getUniswapV2Rate(
      USDCAddress,
      OneInchTokenAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate, { range: 0.25 });
  });

  it("should return the same scaled rate as uniswap V2 when supplying tokens that don't have a direct pair and a _toToken will less than 18 decimals", async () => {
    const returnedRate = await baseSwapProxy.getChainlinkRate(
      OneInchTokenAddress,
      USDCAddress
    );

    const expectedRate = await baseSwapProxy.getUniswapV2Rate(
      OneInchTokenAddress,
      USDCAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate, { range: 0.25 });
  });

  it("should return the same scaled rate as uniswap V2 when supplying a _fromToken that less than 18 decimals", async () => {
    const returnedRate = await baseSwapProxy.getChainlinkRate(
      USDCAddress,
      ETHAddress
    );

    const expectedRate = await baseSwapProxy.getChainlinkRate(
      USDCAddress,
      ETHAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate);
  });

  it("should return the same scaled rate as uniswap V2 when supplying a _toToken that has less than 18 decimals", async () => {
    const returnedRate = await baseSwapProxy.getChainlinkRate(
      ETHAddress,
      USDCAddress
    );

    const expectedRate = await baseSwapProxy.getUniswapV2Rate(
      ETHAddress,
      USDCAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate);
  });
});

/**
 * Uniswap V2
 */
describe("exchangeRate - uniswapV2", () => {
  let baseSwapProxy: BaseSwapProxy;
  let user: SignerWithAddress;

  before(async () => {
    [user] = await ethers.getSigners();

    const BaseSwapProxy = await ethers.getContractFactory("BaseSwapProxy");
    baseSwapProxy = await BaseSwapProxy.deploy(user.address);
  });

  it("should return a similar rate to chainlink from uniswapV2", async () => {
    const uniswapV2Rate = await baseSwapProxy.getUniswapV2Rate(
      DaiAddress,
      WETHAddress
    );
    const chainlinkRate = await baseSwapProxy.getChainlinkRate(
      DaiAddress,
      ETHAddress
    );

    assertBigNumWithRange(chainlinkRate, uniswapV2Rate);
  });

  it("tests that getUniswapV2Rate returns a rate when a direct pair doesn't exist", async () => {
    const uniswapV2Rate = await baseSwapProxy.getUniswapV2Rate(
      AuroxAddress,
      UniAddress
    );

    // Just asserting the value is greater than 0 here, as the rate function itself just re-arranges the path array so should be safe
    expect(uniswapV2Rate).gt(0);
  });

  it("should revert when supplying invalid pair addresses to uniswapV2Rate function", async () => {
    await expect(
      baseSwapProxy.getUniswapV2Rate(BurnAddress, user.address)
    ).to.revertedWith("");
  });

  it("should return 0 when supplying WETH with an invalid token address", async () => {
    const uniswapV2Rate = await baseSwapProxy.getUniswapV2Rate(
      WETHAddress,
      user.address
    );

    expect(uniswapV2Rate).eq(0);
  });

  it("should return the same rate when supplying WETH and supplying ETH as _toToken's", async () => {
    const uniswapV2RateWETH = await baseSwapProxy.getUniswapV2Rate(
      AuroxAddress,
      WETHAddress
    );

    const uniswapV2RateETH = await baseSwapProxy.getUniswapV2Rate(
      AuroxAddress,
      ETHAddress
    );

    expect(uniswapV2RateWETH).eq(uniswapV2RateETH);
  });

  it("should return the inverted rate when going the other direction", async () => {
    const rateToAurox = await baseSwapProxy.getUniswapV2Rate(
      WETHAddress,
      AuroxAddress
    );

    const invertedRate = await baseSwapProxy.getUniswapV2Rate(
      AuroxAddress,
      WETHAddress
    );

    const calculatedInvertedRate = invertRate(rateToAurox);

    assertBigNumWithRange(invertedRate, calculatedInvertedRate);
  });

  it("should work when providing a _fromToken that has less than 18 decimals", async () => {
    const returnedRate = await baseSwapProxy.getUniswapV2Rate(
      USDCAddress,
      ETHAddress
    );

    const expectedRate = await baseSwapProxy.getChainlinkRate(
      USDCAddress,
      ETHAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate);
  });

  it("should work when providing a _toToken that has less than 18 decimals", async () => {
    const returnedRate = await baseSwapProxy.getUniswapV2Rate(
      ETHAddress,
      USDCAddress
    );

    const expectedRate = await baseSwapProxy.getChainlinkRate(
      ETHAddress,
      USDCAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate);
  });

  it("should work when providing tokens that have a direct pair with low liquidity and that the function instead routes through ETH", async () => {
    const returnedRate = await baseSwapProxy.getUniswapV2Rate(
      CompTokenAddress,
      USDCAddress
    );

    const expectedRate = await baseSwapProxy.getChainlinkRate(
      CompTokenAddress,
      USDCAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate);
  });

  it("should work when a direct pair doesn't exist and providing a _toToken will less than 18 decimals", async () => {
    const returnedRate = await baseSwapProxy.getUniswapV2Rate(
      USDCAddress,
      CompTokenAddress
    );

    const expectedRate = await baseSwapProxy.getChainlinkRate(
      USDCAddress,
      CompTokenAddress
    );

    assertBigNumWithRange(expectedRate, returnedRate);
  });
});

// ! Deprecated currently, might be implemented in a future release
// /**
//  * Uniswap V3
//  */
// describe("exchangeRate - uniswapV3", () => {
//   let swapProxy: SwapProxy;
//   let user: SignerWithAddress;

//   before(async () => {
//     await deployments.fixture("testbed");
//     [user] = await ethers.getSigners();

//     swapProxy = await ethers.getContract("SwapProxy");
//   });

//   it("should return a similar rate to chainlink from uniswapV3", async () => {
//     const uniswapV3Rate = await swapProxy.getUniswapV3Rate(
//       DaiAddress,
//       WETHAddress
//     );
//     const chainlinkRate = await swapProxy.getChainlinkRate(
//       DaiAddress,
//       ETHAddress
//     );

//     assertBigNumWithRange(chainlinkRate, uniswapV3Rate);
//   });

//   // ! Failing
//   it.skip("should return a rate when a direct pair doesn't exist from uniswapV3", async () => {
//     const uniswapV3Rate = await swapProxy.getUniswapV3Rate(
//       DaiAddress,
//       UniAddress
//     );

//     const uniswapV2Rate = await swapProxy.getUniswapV2Rate(
//       DaiAddress,
//       UniAddress
//     );

//     console.log("V2 rate: ", uniswapV2Rate.toString());

//     expect(uniswapV3Rate).gt(0);
//     expect(uniswapV2Rate).eq(uniswapV3Rate);
//   });

//   it("should return 0 when supplying invalid pair addresses", async () => {
//     const uniswapV3Rate = await swapProxy.getUniswapV3Rate(
//       AuroxAddress,
//       BurnAddress
//     );

//     expect(uniswapV3Rate).eq(0);
//   });

//   it("should return the same rate for WETH and ETH as the _toToken", async () => {
//     const WETHRate = await swapProxy.getUniswapV3Rate(DaiAddress, WETHAddress);

//     const ETHRate = await swapProxy.getUniswapV3Rate(DaiAddress, WETHAddress);

//     expect(WETHRate).gt(0);

//     expect(WETHRate).eq(ETHRate);
//   });

//   it("should return 0 when providing WETH and an invalid token address", async () => {
//     const WETHRate = await swapProxy.getUniswapV3Rate(BurnAddress, WETHAddress);

//     expect(WETHRate).eq(0);
//   });

//   it("should return 0 when providing invalid pair addresses to uniswapV3Rate function", async () => {
//     const chainlinkRate = await swapProxy.getUniswapV3Rate(
//       BurnAddress,
//       ETHAddress
//     );

//     expect(chainlinkRate).eq(0);
//   });
// });
