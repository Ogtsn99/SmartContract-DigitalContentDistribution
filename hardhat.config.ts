import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@symfoni/hardhat-react";
import "hardhat-typechain";
import "@typechain/ethers-v5";
require('dotenv').config();
const env = process.env;

require('@openzeppelin/hardhat-upgrades');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  react: {
    providerPriority: ["web3modal", "hardhat"],
  },
  networks: {
    hardhat: {
      inject: true, // optional. If true, it will EXPOSE your mnemonic in your frontend code. Then it would be available as an "in-page browser wallet" / signer which can sign without confirmation.
      accounts: {
        mnemonic: "test test test test test test test test test test test junk", // test test test test test test test test test test test junk
        accountsBalance: "10000000000000000000000",
      },
      initialBaseFeePerGas: 0,
      gasPrice: 0,
    },
    mumbai: {
      chainId: 80001,
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_MUMBAI}`,
      accounts: [`0x${env.MUMBAI_PRIVATE_KEY}`, `0x${env.MUMBAI_PRIVATE_KEY2}`],
      gas: 2100000,
      gasPrice: 8000000000,
    }
    // hardhat: {
    //   accounts: [
    //     {
    //       balance: "10000000000000000000000",
    //       privateKey:
    //         "0xe87d780e4c31c953a68aef2763df56599c9cfe73df4740fc24c2d0f5acd21bae",
    //     },
    //   ],
    // },
  },
  // ディレクトリの構成を変えようとしたらhardhat-reactに怒られた。
  // paths: {
  //   deployments: "./artifacts/deployments"
  // },
  // typechain: {
  //   "outDir": "./typechain",
  //   "target": "ethers-v5"
  // },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
    ],
  },
};

export default config;
