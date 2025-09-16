const hre = require("hardhat");
// const fs = require('fs');

async function main() {
  const initialFeeBps = 500;
  const Digitalguestbook = await hre.ethers.getContractFactory("DigitalGuestbook")
  const digitalguestbook = await Digitalguestbook.deploy();
  await digitalguestbook.deployed();
  console.log("digitalguestbook deployed to:", digitalguestbook.address);

  // fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))  
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


