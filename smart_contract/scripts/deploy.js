const hre = require("hardhat");

async function main() {
  const VotingPlatform = await hre.ethers.getContractFactory("ElectionPortal");
  const votingPlatform = await VotingPlatform.deploy(); // you can pass the arguments in the parenthesis for the contract constructor

  await votingPlatform.deployed();

  console.log("Greeter deployed to:", votingPlatform.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
