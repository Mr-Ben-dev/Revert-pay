const hre = require("hardhat");

async function main() {
  const vaultAddress = "0x11614d661cc9A5A7aF3024699249226Cfad33946";
  const managerAddress = "0x9ED00020AeAFF3ad6cCe1137dDD19967A8F3b066";

  const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);

  const currentManager = await Vault.manager();
  console.log("Current vault manager:", currentManager);
  console.log("Expected manager:", managerAddress);
  console.log("Match:", currentManager.toLowerCase() === managerAddress.toLowerCase());

  // Check if manager is set
  const isSet = currentManager !== hre.ethers.ZeroAddress;
  console.log("Manager is set:", isSet);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
