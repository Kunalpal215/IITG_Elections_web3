require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

// const { ALCHEMY_API_URL, WALLET_PRIVATE_KEY } = process.env;
// console.log(typeof(ALCHEMY_API_URL));
// console.log(typeof(WALLET_PRIVATE_KEY));
module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "goerli",
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545",
      accounts: ["fb96e82b2e2ed6065e9fb8b48408a112f78efeca590b5598964fe47719682b5a"],
      gas: 6721975,
    },
    goerli: {
       url: "https://eth-goerli.alchemyapi.io/v2/QuTOUpiyRj7H7zoNLwIYLhkmNfBBDZQF",
       accounts: ["893cb04d3e004ff968ec6234db2a03e91d1de3d59ebd66cef1a7dbc26c7b502b"]
    }
 },
 paths: {
  sources: "./contracts",
},
};
