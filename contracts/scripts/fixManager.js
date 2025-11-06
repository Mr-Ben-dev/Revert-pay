const hre = require("hardhat");

async function main() {
  const rnftAddress = "0x8A04D093e439a783D0F67CDd3B56e3aacE8E2297";
  const managerAddress = "0xC3313Edd7E15087c3301141F8eC25A14c47bb08b";

  console.log("Setting RefundRight manager to:", managerAddress);

  const RefundRight = await hre.ethers.getContractAt("RefundRight", rnftAddress);

  const tx = await RefundRight.setManager(managerAddress);
  console.log("Transaction sent:", tx.hash);

  await tx.wait();
  console.log("✓ Manager updated successfully!");

  const newManager = await RefundRight.manager();
  console.log("New manager:", newManager);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
