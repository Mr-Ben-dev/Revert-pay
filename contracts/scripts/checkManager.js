const hre = require("hardhat");

async function main() {
  const rnftAddress = "0x8A04D093e439a783D0F67CDd3B56e3aacE8E2297";
  const managerAddress = "0xC3313Edd7E15087c3301141F8eC25A14c47bb08b";

  const RefundRight = await hre.ethers.getContractAt("RefundRight", rnftAddress);

  const currentManager = await RefundRight.manager();
  console.log("Current RefundRight manager:", currentManager);
  console.log("Expected manager (RevertPayManager):", managerAddress);
  console.log("Match:", currentManager.toLowerCase() === managerAddress.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
