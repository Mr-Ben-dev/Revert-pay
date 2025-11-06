import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";

const {
  ALCHEMY_API_KEY,
  WALLET_PRIVATE_KEY,
  ETHERSCAN_API_KEY, // works for Polygonscan too
} = process.env;

const amoyRpc = `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const polygonRpc = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    amoy: {
      url: amoyRpc,
      chainId: 80002,
      accounts: WALLET_PRIVATE_KEY ? [WALLET_PRIVATE_KEY] : [],
    },
    polygon: {
      url: polygonRpc,
      chainId: 137,
      accounts: WALLET_PRIVATE_KEY ? [WALLET_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      polygon: ETHERSCAN_API_KEY || "",
      polygonAmoy: ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};

export default config;
