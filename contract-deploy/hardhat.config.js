require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_URL_SEPOLIA,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
      mainnet: {
      url: process.env.ALCHEMY_API_URL_MAINNET,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  }
};
