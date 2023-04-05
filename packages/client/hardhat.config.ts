import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      // accounts: { mnemonic: process.env.MNEMONIC },
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${
          process.env.ALCHEMY_API_KEY ?? ""
        }`,
        blockNumber: 14664909,
      },
    },
  },
  paths: { root: "./src" },
};

export default config;
