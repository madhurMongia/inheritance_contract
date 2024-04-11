import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();
const private_key = process.env.OWNER_PRIVATE_KEY || '';
const config = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: 'https://ethereum-sepolia-rpc.publicnode.com',
      accounts: [`${private_key}`]
    },
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false, 
    externalArtifacts: ['externalArtifacts/*.json'], 
    dontOverrideCompile: false 
    },
};

export default config;

