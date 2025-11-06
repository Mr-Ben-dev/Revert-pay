const hre = require("hardhat");

async function main() {
  const rnft3Address = "0x2BC514C4b8c4219cFe1AeFA704Cd3423058E6680";
  const manager3Address = "0x089B791357896Ef96ef23908437e42579ecbF6Bd";

  const RNFT = await hre.ethers.getContractAt("RefundRight", rnft3Address);
  const actualManager = await RNFT.manager();

  console.log("RNFT3:", rnft3Address);
  console.log("Expected manager:", manager3Address);
  console.log("Actual manager:", actualManager);
  console.log("Match:", actualManager === manager3Address);
}

main().catch(console.error);
