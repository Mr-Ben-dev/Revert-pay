const hre = require("hardhat");

async function main() {
  const rnftAddress = "0x2eCf83Df0D55EF11B77f7cb5D53A7D380E27a993";
  const expectedManager = "0x1EF77736Dbb6eba2ae588be74ACA025Ea41CC93C";

  console.log("Checking RefundRight manager:");
  console.log("  RefundRight:", rnftAddress);
  console.log("  Expected manager:", expectedManager);

  const RNFT = await hre.ethers.getContractAt("RefundRight", rnftAddress);
  const actualManager = await RNFT.manager();

  console.log("\nActual manager:", actualManager);
  console.log("Match:", actualManager === expectedManager);
}

main().catch(console.error);
