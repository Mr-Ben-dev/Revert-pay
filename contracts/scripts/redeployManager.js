const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Redeploying RevertPayManager with correct vault and rNFT addresses...\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  const refundRight = "0x2eCf83Df0D55EF11B77f7cb5D53A7D380E27a993";
  const oldVault = "0x11614d661cc9A5A7aF3024699249226Cfad33946";

  console.log("Using addresses:");
  console.log("- Policy Registry:", policyRegistry);
  console.log("- RefundRight (rNFT):", refundRight);
  console.log("- Old Vault (will be replaced):", oldVault);
  console.log();

  // Deploy new RefundVault first
  console.log("1. Deploying RefundVault...");
  const Vault = await hre.ethers.getContractFactory("RefundVault");
  const vault = await Vault.deploy(policyRegistry);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("   RefundVault deployed to:", vaultAddress);

  // Deploy new RevertPayManager with correct vault and RefundRight
  console.log("\n2. Deploying RevertPayManager...");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(policyRegistry, vaultAddress, refundRight);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("   RevertPayManager deployed to:", managerAddress);

  // Set vault manager to new RevertPayManager
  console.log("\n3. Setting vault manager...");
  const setManagerTx = await vault.setManager(managerAddress);
  await setManagerTx.wait();
  console.log("   Vault manager set to:", managerAddress);

  // Verify configuration
  console.log("\n4. Verifying new configuration...");
  const vaultManager = await vault.manager();
  const managerVault = await manager.vault();
  const managerRnft = await manager.rnft();
  const managerRegistry = await manager.policyRegistry();

  console.log("\n=== Configuration Summary ===");
  console.log("RefundVault:");
  console.log("  Address:", vaultAddress);
  console.log("  Manager:", vaultManager);
  console.log("\nRevertPayManager:");
  console.log("  Address:", managerAddress);
  console.log("  Vault:", managerVault);
  console.log("  RNFT:", managerRnft);
  console.log("  Registry:", managerRegistry);

  // Verify matches
  console.log("\n=== Verification ===");
  console.log("Vault manager matches Manager address:", vaultManager === managerAddress);
  console.log("Manager vault matches Vault address:", managerVault === vaultAddress);
  console.log("Manager RNFT matches RefundRight:", managerRnft === refundRight);
  console.log("Manager Registry matches expected:", managerRegistry === policyRegistry);

  // Update .env file
  console.log("\n5. Updating web/.env file...");
  const envPath = path.join(__dirname, '../../web/.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update addresses
  envContent = envContent.replace(
    /VITE_MANAGER_80002=.*/,
    `VITE_MANAGER_80002=${managerAddress}`
  );
  envContent = envContent.replace(
    /VITE_VAULT_80002=.*/,
    `VITE_VAULT_80002=${vaultAddress}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log("   Updated VITE_MANAGER_80002:", managerAddress);
  console.log("   Updated VITE_VAULT_80002:", vaultAddress);

  console.log("\n✅ Redeployment complete!");
  console.log("\nNext steps:");
  console.log("1. Merchant needs to deposit USDC into the NEW vault:", vaultAddress);
  console.log("2. Then try making a payment again");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
