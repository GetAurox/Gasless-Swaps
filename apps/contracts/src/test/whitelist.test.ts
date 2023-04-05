import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Whitelist } from "../typechain/Whitelist";
import { Addresses } from "@aurox-gasless-swaps/constants";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { DEFAULT_ADMIN } from "../constants/roles";

chai.use(chaiAsPromised);

const { OneInchRouterAddress, BurnAddress } = Addresses;

const getRevertAccessControlString = (user: string) =>
  `AccessControl: account ${user.toLowerCase()} is missing role ${DEFAULT_ADMIN}`;

describe("Whitelist", () => {
  let deployer: SignerWithAddress;
  let testUsers: SignerWithAddress[];
  let whitelist: Whitelist;

  beforeEach(async () => {
    [deployer, ...testUsers] = await ethers.getSigners();

    const whitelistFactory = await ethers.getContractFactory("Whitelist");
    whitelist = await whitelistFactory.deploy(deployer.address);
  });

  it("tests that an owner can add to the whitelist", async () => {
    await whitelist.addToWhitelist(OneInchRouterAddress);

    expect(await whitelist.isWhitelisted(OneInchRouterAddress)).to.eq(true);
  });

  it("tests that an owner can remove from the whitelist", async () => {
    await whitelist.addToWhitelist(OneInchRouterAddress);

    expect(await whitelist.isWhitelisted(OneInchRouterAddress)).to.eq(true);

    await whitelist.removeFromWhitelist(OneInchRouterAddress);
    expect(await whitelist.isWhitelisted(OneInchRouterAddress)).to.eq(false);
  });

  it("tests that removing an address from the whitelist that doesn't exist within the whitelist fails", async () => {
    await expect(
      whitelist.removeFromWhitelist(OneInchRouterAddress)
    ).to.rejectedWith("Address is missing from the whitelist");
  });

  it("tests that trying to add the 0x address to the whitelist fails", async () => {
    await expect(whitelist.addToWhitelist(BurnAddress)).to.rejectedWith(
      "Can't add the 0x address to the whitelist"
    );
  });

  it("tests that when a user who isn't the admin tries to add to the whitelist it fails", async () => {
    await expect(
      whitelist.connect(testUsers[0]).addToWhitelist(BurnAddress)
    ).to.rejectedWith(getRevertAccessControlString(testUsers[0].address));
  });

  it("tests that when a user who isn't the admin tries to remove from the whitelist it fails", async () => {
    await expect(
      whitelist.connect(testUsers[0]).removeFromWhitelist(BurnAddress)
    ).to.rejectedWith(getRevertAccessControlString(testUsers[0].address));
  });
});
