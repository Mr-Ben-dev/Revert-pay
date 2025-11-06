const hre = require("hardhat");

async function main() {
  const managerAddress = "0x9ED00020AeAFF3ad6cCe1137dDD19967A8F3b066";
  const expectedVault = "0x11614d661cc9A5A7aF3024699249226Cfad33946";
  const expectedRNFT = "0x2eCf83Df0D55EF11B77f7cb5D53A7D380E27a993";
  const expectedPolicy = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";

  const Manager = await hre.ethers.getContractAt("RevertPayManager", managerAddress);

  const vault = await Manager.vault();
  const rnft = await Manager.rnft();
  const policyRegistry = await Manager.policyRegistry();

  console.log("RevertPayManager configuration:");
  console.log("Vault:", vault);
  console.log("Expected:", expectedVault);
  console.log("Match:", vault.toLowerCase() === expectedVault.toLowerCase());
  console.log();
  console.log("RNFT:", rnft);
  console.log("Expected:", expectedRNFT);
  console.log("Match:", rnft.toLowerCase() === expectedRNFT.toLowerCase());
  console.log();
  console.log("Policy Registry:", policyRegistry);
  console.log("Expected:", expectedPolicy);
  console.log("Match:", policyRegistry.toLowerCase() === expectedPolicy.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
