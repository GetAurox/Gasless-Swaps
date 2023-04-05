import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployments, ethers } from "hardhat";
import { returnDeployedAddresses } from "../helpers/deployment";
import {
  BaseSwapProxy,
  FeedRegistryInterface,
  FeedRegistryInterface__factory,
} from "../typechain";
import { JsonRpcSigner } from "@ethersproject/providers";
import { Addresses } from "@aurox-gasless-swaps/constants";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { BigNumber, BigNumberish } from "ethers";
import { assertBigNumWithRange } from "./helpers/assertions";

const {
  DaiAddress,
  ChainlinkFeedRegistry,
  AuroxAddress,
  USDCAddress,
  WETHAddress,
} = Addresses;

describe("calculatePercentageFeeInETH", () => {
  let baseSwapProxy: BaseSwapProxy;
  let user: SignerWithAddress;
  let impersonatedSigner: JsonRpcSigner;
  let chainlinkFeedRegistry: FeedRegistryInterface;

  before(async () => {
    [user] = await ethers.getSigners();

    const BaseSwapProxy = await ethers.getContractFactory("BaseSwapProxy");
    baseSwapProxy = await BaseSwapProxy.deploy(user.address);

    chainlinkFeedRegistry = FeedRegistryInterface__factory.connect(
      ChainlinkFeedRegistry,
      user
    );
  });

  beforeEach(async () => {
    await baseSwapProxy.setFee("0");
  });

  const amount = parseEther("1000");

  const returnExpectedFee = async (
    feePercentage: string,
    fromToken: string,
    gasRefund: BigNumberish
  ) => {
    const parsedFeePercentage = parseEther(feePercentage);
    //   Set the fee to 5%
    await baseSwapProxy.setFee(parsedFeePercentage);

    const exchangeRate = await baseSwapProxy.getExchangeRate(
      fromToken,
      WETHAddress
    );

    const valueInETH = exchangeRate.mul(amount).div(parseEther("1"));

    const invertedExchangeRate = parseEther("1").div(exchangeRate);

    const expectedFeeTotalInETH = valueInETH
      .sub(gasRefund)
      .mul(parsedFeePercentage)
      .div(parseEther("1"))
      .add(gasRefund);

    return expectedFeeTotalInETH;
  };

  it("should return the correct fee amount in ETH when swapping from DAI", async () => {
    const gasRefund = "0";

    const expectedFeeTotalInETH = await returnExpectedFee(
      "0.05",
      DaiAddress,
      gasRefund
    );

    const { feeTotalInETH } = await baseSwapProxy.calculatePercentageFeeInETH(
      DaiAddress,
      amount,
      gasRefund
    );

    expect(expectedFeeTotalInETH).eq(feeTotalInETH);
  });

  it("should return the correct fee amount in ETH when swapping from URUS", async () => {
    const amount = parseEther("1000");

    const gasRefund = "0";

    const expectedFeeTotalInETH = await returnExpectedFee(
      "0.10",
      AuroxAddress,
      gasRefund
    );

    const { feeTotalInETH } = await baseSwapProxy.calculatePercentageFeeInETH(
      AuroxAddress,
      amount,
      gasRefund
    );

    expect(expectedFeeTotalInETH).eq(feeTotalInETH);
  });

  it("should return the correct fee amount in ETH when swapping from DAI and with a gasRefund", async () => {
    const amount = parseEther("1000");

    const gasRefund = parseEther("0.1");

    const expectedFeeTotalInETH = await returnExpectedFee(
      "0.05",
      DaiAddress,
      gasRefund
    );

    const { feeTotalInETH } = await baseSwapProxy.calculatePercentageFeeInETH(
      DaiAddress,
      amount,
      gasRefund
    );

    expect(expectedFeeTotalInETH).eq(feeTotalInETH);
  });

  it("should return the correct fee amounts when the provided token has 6 decimals", async () => {
    const usdcAmount = parseUnits("1000", 6);
    const gasRefund = "0";
    const feePercentage = "0.05";

    const expectedFeeTotalInETH = await returnExpectedFee(
      feePercentage,
      USDCAddress,
      gasRefund
    );

    const { feeTotalInETH, feeTotalInToken } =
      await baseSwapProxy.calculatePercentageFeeInETH(
        USDCAddress,
        usdcAmount,
        gasRefund
      );

    expect(expectedFeeTotalInETH).eq(feeTotalInETH);

    const expectedFeeInToken = usdcAmount
      .mul(parseEther(feePercentage))
      .div(parseEther("1"));

    assertBigNumWithRange(expectedFeeInToken, feeTotalInToken);
  });
});
