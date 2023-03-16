// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const marketFeePercentage = 5;
  // const marketToken = "0x2cCD5BA7C938610e59cA0feA4b7f98832967681D"; //celo token

  const JustArtMarket = await hre.ethers.getContractFactory("JustArtMarket");
  console.log("Deploying.......");
  const justArtMarket = await JustArtMarket.deploy(marketFeePercentage);

  await justArtMarket.deployed();

  console.log("Just Art Market deployed to:", justArtMarket.address);
  storeContractData(justArtMarket);
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../lib/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/justArt-address.json",
    JSON.stringify({ addr: contract.address }, undefined, 2)
  );

  const justArtMarketArtifacts = artifacts.readArtifactSync("JustArtMarket");

  fs.writeFileSync(
    contractsDir + "/justArt-abi.json",
    JSON.stringify(justArtMarketArtifacts, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
