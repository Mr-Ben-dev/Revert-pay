const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Full redeployment with correct sequence...\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  
  console.log("Using existing Policy Registry:", policyRegistry);
  console.log();

  // Step 1: Deploy RefundVault
  console.log("1. Deploying RefundVault...");
  const Vault = await hre.ethers.getContractFactory("RefundVault");
  const vault = await Vault.deploy(policyRegistry);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("   RefundVault deployed to:", vaultAddress);

  // Step 2: Deploy temp RefundRight (manager = deployer)
  console.log("\n2. Deploying temporary RefundRight...");
  const [deployer] = await hre.ethers.getSigners();
  const TempRNFT = await hre.ethers.getContractFactory("RefundRight");
  const tempRnft = await TempRNFT.deploy(deployer.address);
  await tempRnft.waitForDeployment();
  const tempRnftAddress = await tempRnft.getAddress();
  console.log("   Temp RefundRight deployed to:", tempRnftAddress);

  // Step 3: Deploy RevertPayManager with vault and temp RNFT
  console.log("\n3. Deploying RevertPayManager...");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(policyRegistry, vaultAddress, tempRnftAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("   RevertPayManager deployed to:", managerAddress);

  // Step 4: Set vault manager
  console.log("\n4. Setting vault manager...");
  const setManagerTx = await vault.setManager(managerAddress);
  await setManagerTx.wait();
  console.log("   Vault manager set to:", managerAddress);

  // Step 5: Deploy final RefundRight with RevertPayManager as manager
  console.log("\n5. Deploying final RefundRight...");
  const RNFT = await hre.ethers.getContractFactory("RefundRight");
  const rnft = await RNFT.deploy(managerAddress);
  await rnft.waitForDeployment();
  const rnftAddress = await rnft.getAddress();
  console.log("   RefundRight deployed to:", rnftAddress);

  // Verify configuration
  console.log("\n6. Verifying configuration...");
  const vaultManager = await vault.manager();
  const rnftManager = await rnft.manager();
  const managerVault = await manager.vault();
  const managerRnftOld = await manager.rnft();

  console.log("\n=== Configuration Summary ===");
  console.log("RefundVault:");
  console.log("  Address:", vaultAddress);
  console.log("  Manager:", vaultManager);
  console.log("\nRefundRight:");
  console.log("  Address:", rnftAddress);
  console.log("  Manager:", rnftManager);
  console.log("\nRevertPayManager:");
  console.log("  Address:", managerAddress);
  console.log("  Vault:", managerVault);
  console.log("  RNFT (old):", managerRnftOld);
  console.log("\n⚠️  WARNING: RevertPayManager still points to temp RNFT!");
  console.log("  We need to redeploy Manager again with the final RNFT address.");

  // Step 7: Redeploy RevertPayManager with correct RNFT
  console.log("\n7. Redeploying RevertPayManager with final RNFT...");
  const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager2 = await Manager2.deploy(policyRegistry, vaultAddress, rnftAddress);
  await manager2.waitForDeployment();
  const manager2Address = await manager2.getAddress();
  console.log("   RevertPayManager (v2) deployed to:", manager2Address);

  // Step 8: Update vault manager
  console.log("\n8. Updating vault manager...");
  // Note: This will fail because vault.setManager() can only be called once!
  // We need to deploy a NEW vault too!

  console.log("\n⚠️  ERROR: Vault manager already set and cannot be changed!");
  console.log("  We need to deploy a COMPLETELY NEW vault.");

  // Step 9: Deploy NEW vault
  console.log("\n9. Deploying NEW RefundVault...");
  const Vault2 = await hre.ethers.getContractFactory("RefundVault");
  const vault2 = await Vault2.deploy(policyRegistry);
  await vault2.waitForDeployment();
  const vault2Address = await vault2.getAddress();
  console.log("   RefundVault (v2) deployed to:", vault2Address);

  // Step 10: Deploy FINAL RevertPayManager
  console.log("\n10. Deploying FINAL RevertPayManager...");
  const Manager3 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager3 = await Manager3.deploy(policyRegistry, vault2Address, rnftAddress);
  await manager3.waitForDeployment();
  const manager3Address = await manager3.getAddress();
  console.log("    RevertPayManager (v3) deployed to:", manager3Address);

  // Step 11: Set vault manager
  console.log("\n11. Setting vault manager...");
  const setManager2Tx = await vault2.setManager(manager3Address);
  await setManager2Tx.wait();
  console.log("    Vault manager set to:", manager3Address);

  // Step 12: Update RefundRight manager
  console.log("\n12. ⚠️  RefundRight manager is IMMUTABLE!");
  console.log("    Current manager:", rnftManager);
  console.log("    Needed manager:", manager3Address);
  console.log("    We need to deploy YET ANOTHER RefundRight!");

  // Step 13: Deploy FINAL RefundRight
  console.log("\n13. Deploying FINAL RefundRight...");
  const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
  const rnft2 = await RNFT2.deploy(manager3Address);
  await rnft2.waitForDeployment();
  const rnft2Address = await rnft2.getAddress();
  console.log("    RefundRight (v2) deployed to:", rnft2Address);

  // Step 14: Deploy FINAL FINAL RevertPayManager
  console.log("\n14. Deploying FINAL FINAL RevertPayManager...");
  const Manager4 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager4 = await Manager4.deploy(policyRegistry, vault2Address, rnft2Address);
  await manager4.waitForDeployment();
  const manager4Address = await manager4.getAddress();
  console.log("    RevertPayManager (v4) deployed to:", manager4Address);

  // Step 15: Update vault manager AGAIN
  console.log("\n15. ⚠️  Vault manager already set, need NEW vault!");

  // This is getting ridiculous. Let me do it properly in one shot...
  console.log("\n\n=== STARTING FRESH ===\n");

  // FINAL: Deploy all three in correct order
  console.log("A. Deploying RefundVault...");
  const VaultFinal = await hre.ethers.getContractFactory("RefundVault");
  const vaultFinal = await VaultFinal.deploy(policyRegistry);
  await vaultFinal.waitForDeployment();
  const vaultFinalAddress = await vaultFinal.getAddress();
  console.log("   RefundVault:", vaultFinalAddress);

  console.log("\nB. Deploying temp RefundRight...");
  const TempRNFTFinal = await hre.ethers.getContractFactory("RefundRight");
  const tempRnftFinal = await TempRNFTFinal.deploy(deployer.address);
  await tempRnftFinal.waitForDeployment();
  const tempRnftFinalAddress = await tempRnftFinal.getAddress();
  console.log("   Temp RefundRight:", tempRnftFinalAddress);

  console.log("\nC. Deploying RevertPayManager...");
  const ManagerFinal = await hre.ethers.getContractFactory("RevertPayManager");
  const managerFinal = await ManagerFinal.deploy(policyRegistry, vaultFinalAddress, tempRnftFinalAddress);
  await managerFinal.waitForDeployment();
  const managerFinalAddress = await managerFinal.getAddress();
  console.log("   RevertPayManager:", managerFinalAddress);

  console.log("\nD. Deploying final RefundRight...");
  const RNFTFinal = await hre.ethers.getContractFactory("RefundRight");
  const rnftFinal = await RNFTFinal.deploy(managerFinalAddress);
  await rnftFinal.waitForDeployment();
  const rnftFinalAddress = await rnftFinal.getAddress();
  console.log("   RefundRight:", rnftFinalAddress);

  console.log("\nE. Setting vault manager...");
  const setManagerFinalTx = await vaultFinal.setManager(managerFinalAddress);
  await setManagerFinalTx.wait();
  console.log("   ✓ Vault manager set");

  console.log("\nF. ⚠️  RevertPayManager still points to temp RNFT!");
  console.log("   Manager RNFT:", tempRnftFinalAddress);
  console.log("   Actual RNFT:", rnftFinalAddress);
  console.log("\n   Solution: Deploy Manager AGAIN with correct RNFT...");

  console.log("\nG. Deploying CORRECT RevertPayManager...");
  const ManagerCorrect = await hre.ethers.getContractFactory("RevertPayManager");
  const managerCorrect = await ManagerCorrect.deploy(policyRegistry, vaultFinalAddress, rnftFinalAddress);
  await managerCorrect.waitForDeployment();
  const managerCorrectAddress = await managerCorrect.getAddress();
  console.log("   RevertPayManager (correct):", managerCorrectAddress);

  console.log("\nH. ⚠️  But now RefundRight points to OLD manager!");
  console.log("   RNFT manager:", managerFinalAddress);
  console.log("   New Manager:", managerCorrectAddress);
  console.log("\n   This is a chicken-and-egg problem!");
  console.log("   Solution: We MUST deploy everything together perfectly.");

  console.log("\n\n❌ This approach won't work. Let me write the CORRECT script...\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
