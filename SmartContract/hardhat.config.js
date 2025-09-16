
require ('@nomiclabs/hardhat-waffle');
require('dotenv').config();

task("accounts","Prints the list of the accounts",async (taskArgs , hre )=>{
  const accounts = await hre.ethers.getSigners();

  for(const account of accounts){
    console.log(account.address);
  }
})
module.exports = {
  solidity: "0.8.10",

  defaultNetwork: "eSpace",
  networks:{
    hardhat:{},
    eSpace: {
      url: "https://evmtestnet.confluxrpc.com	",
      gasPrice: 225000000000,
      chainId: 71,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  }
};