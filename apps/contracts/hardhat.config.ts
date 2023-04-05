import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import { HardhatForkBlockNumber } from "./src/constants/hardhat";

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const accounts = [process.env.MULTICALL_ACCOUNT_PRIVATE_KEY as string];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: { mnemonic: process.env.MNEMONIC },
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${
          process.env.ALCHEMY_API_KEY ?? ""
        }`,
        blockNumber: HardhatForkBlockNumber,
      },
      saveDeployments: true,
    },
    mainnet: {
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: { mnemonic: process.env.MNEMONIC },
      // gas: 21000000,
      // gasPrice: 80000000000,
      saveDeployments: true,
    },
    binance: {
      url: "https://bsc-dataseed.binance.org/",
      accounts,
      saveDeployments: true,
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts,
      saveDeployments: true,
    },
    optimism: {
      url: "https://mainnet.optimism.io",
      accounts,
      saveDeployments: true,
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts,
      saveDeployments: true,
    },
    gnosisChain: {
      url: "https://rpc.gnosischain.com",
      accounts,
      saveDeployments: true,
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts,
      saveDeployments: true,
    },
    fantom: {
      url: "https://rpc.ftm.tools",
      accounts,
      saveDeployments: true,
    },
    klaytn: {
      url: "https://public-node-api.klaytnapi.com/v1/cypress",
      accounts,
      saveDeployments: true,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: { root: "./src" },
};

export default config;
