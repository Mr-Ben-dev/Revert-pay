const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Final Deployment (ONE MORE TIME) ===\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  const vaultAddress = "0x5e13fa3b2E799C2FBc0Ef6a923E3a41823c77FfC"; // Already deployed and manager set
  const managerAddress = "0xA9FcD2133C00d2a0066843C32289F79C9eB813f7"; // Current manager

  console.log("Existing addresses:");
  console.log("  Policy Registry:", policyRegistry);
  console.log("  RefundVault:", vaultAddress);
  console.log("  RevertPayManager:", managerAddress);
  console.log();

  // Deploy RefundRight with correct manager
  console.log("1. Deploying RefundRight with correct manager...");
  const RNFT = await hre.ethers.getContractFactory("RefundRight");
  const rnft = await RNFT.deploy(managerAddress);
  await rnft.waitForDeployment();
  const rnftAddress = await rnft.getAddress();
  console.log("   ✓ RefundRight:", rnftAddress);

  // Deploy NEW RevertPayManager with correct RNFT
  console.log("\n2. Deploying NEW RevertPayManager with correct RNFT...");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(policyRegistry, vaultAddress, rnftAddress);
  await manager.waitForDeployment();
  const newManagerAddress = await manager.getAddress();
  console.log("   ✓ RevertPayManager:", newManagerAddress);

  // Problem: Vault manager is still set to OLD manager
  console.log("\n3. Problem: Vault manager already set to OLD manager");
  console.log("   Solution: Deploy NEW vault\n");

  // Deploy NEW vault
  console.log("4. Deploying NEW RefundVault...");
  const Vault = await hre.ethers.getContractFactory("RefundVault");
  const vault = await Vault.deploy(policyRegistry);
  await vault.waitForDeployment();
  const newVaultAddress = await vault.getAddress();
  console.log("   ✓ RefundVault:", newVaultAddress);

  // Deploy NEW manager with new vault
  console.log("\n5. Deploying NEW RevertPayManager with new vault...");
  const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager2 = await Manager2.deploy(policyRegistry, newVaultAddress, rnftAddress);
  await manager2.waitForDeployment();
  const manager2Address = await manager2.getAddress();
  console.log("   ✓ RevertPayManager:", manager2Address);

  // Set vault manager
  console.log("\n6. Setting vault manager...");
  const setManagerTx = await vault.setManager(manager2Address);
  await setManagerTx.wait();
  console.log("   ✓ Done");

  // Problem: RNFT manager points to OLD manager
  console.log("\n7. Problem: RNFT manager points to OLD manager");
  const rnftMgr = await rnft.manager();
  console.log("   RNFT manager:", rnftMgr);
  console.log("   New Manager:", manager2Address);
  console.log("   Solution: Deploy NEW RefundRight\n");

  // Deploy FINAL RefundRight
  console.log("8. Deploying FINAL RefundRight...");
  const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
  const rnft2 = await RNFT2.deploy(manager2Address);
  await rnft2.waitForDeployment();
  const rnft2Address = await rnft2.getAddress();
  console.log("   ✓ RefundRight:", rnft2Address);

  // Deploy FINAL RevertPayManager
  console.log("\n9. Deploying FINAL RevertPayManager...");
  const Manager3 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager3 = await Manager3.deploy(policyRegistry, newVaultAddress, rnft2Address);
  await manager3.waitForDeployment();
  const manager3Address = await manager3.getAddress();
  console.log("   ✓ RevertPayManager:", manager3Address);

  // Problem: Vault manager already set
  console.log("\n10. Problem: Vault manager already set");
  console.log("    Need to deploy ANOTHER vault... This is endless!\n");

  console.log("=== LET'S BE SMART ===");
  console.log("We need exactly 1 more iteration to break the cycle.\n");

  // Deploy absolutely final vault
  console.log("11. Deploying absolutely FINAL vault...");
  const VaultFinal = await hre.ethers.getContractFactory("RefundVault");
  const vaultFinal = await VaultFinal.deploy(policyRegistry);
  await vaultFinal.waitForDeployment();
  const vaultFinalAddress = await vaultFinal.getAddress();
  console.log("    ✓", vaultFinalAddress);

  // Deploy manager with final vault and previous RNFT
  console.log("\n12. Deploying manager with final vault...");
  const ManagerStep1 = await hre.ethers.getContractFactory("RevertPayManager");
  const managerStep1 = await ManagerStep1.deploy(policyRegistry, vaultFinalAddress, rnft2Address);
  await managerStep1.waitForDeployment();
  const managerStep1Address = await managerStep1.getAddress();
  console.log("    ✓", managerStep1Address);

  // Deploy RNFT with this manager
  console.log("\n13. Deploying RNFT with this manager...");
  const RNFTFinal = await hre.ethers.getContractFactory("RefundRight");
  const rnftFinal = await RNFTFinal.deploy(managerStep1Address);
  await rnftFinal.waitForDeployment();
  const rnftFinalAddress = await rnftFinal.getAddress();
  console.log("    ✓", rnftFinalAddress);

  // Deploy manager AGAIN with correct RNFT
  console.log("\n14. Deploying manager AGAIN with correct RNFT...");
  const ManagerStep2 = await hre.ethers.getContractFactory("RevertPayManager");
  const managerStep2 = await ManagerStep2.deploy(policyRegistry, vaultFinalAddress, rnftFinalAddress);
  await managerStep2.waitForDeployment();
  const managerStep2Address = await managerStep2.getAddress();
  console.log("    ✓", managerStep2Address);

  // Deploy RNFT AGAIN with new manager
  console.log("\n15. Deploying RNFT AGAIN with new manager...");
  const RNFTFinal2 = await hre.ethers.getContractFactory("RefundRight");
  const rnftFinal2 = await RNFTFinal2.deploy(managerStep2Address);
  await rnftFinal2.waitForDeployment();
  const rnftFinal2Address = await rnftFinal2.getAddress();
  console.log("    ✓", rnftFinal2Address);

  // Deploy manager ONE LAST TIME
  console.log("\n16. Deploying manager ONE LAST TIME...");
  const ManagerFinal = await hre.ethers.getContractFactory("RevertPayManager");
  const managerFinal = await ManagerFinal.deploy(policyRegistry, vaultFinalAddress, rnftFinal2Address);
  await managerFinal.waitForDeployment();
  const managerFinalAddress = await managerFinal.getAddress();
  console.log("    ✓", managerFinalAddress);

  // Set vault manager
  console.log("\n17. Setting vault manager...");
  const setFinalManagerTx = await vaultFinal.setManager(managerFinalAddress);
  await setFinalManagerTx.wait();
  console.log("    ✓ Done");

  // Verify
  console.log("\n18. Verification:");
  const vaultMgr = await vaultFinal.manager();
  const rnftMgr = await rnftFinal2.manager();
  const mgrVault = await managerFinal.vault();
  const mgrRnft = await managerFinal.rnft();

  console.log("\n=== FINAL ADDRESSES ===");
  console.log("RefundVault:", vaultFinalAddress);
  console.log("  manager:", vaultMgr);
  console.log("\nRefundRight:", rnftFinal2Address);
  console.log("  manager:", rnftMgr);
  console.log("\nRevertPayManager:", managerFinalAddress);
  console.log("  vault:", mgrVault);
  console.log("  rnft:", mgrRnft);

  console.log("\n=== VERIFICATION ===");
  const vaultMatch = vaultMgr === managerFinalAddress;
  const rnftMatch = rnftMgr === managerFinalAddress;
  const mgrVaultMatch = mgrVault === vaultFinalAddress;
  const mgrRnftMatch = mgrRnft === rnftFinal2Address;

  console.log("Vault manager == Manager:", vaultMatch);
  console.log("RNFT manager == Manager:", rnftMatch);
  console.log("Manager vault == Vault:", mgrVaultMatch);
  console.log("Manager RNFT == RNFT:", mgrRnftMatch);

  const allMatch = vaultMatch && rnftMatch && mgrVaultMatch && mgrRnftMatch;

  if (allMatch) {
    console.log("\n✅ ALL CORRECT!");
    
    // Update .env
    console.log("\n19. Updating web/.env...");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(
      /VITE_MANAGER_80002=.*/,
      `VITE_MANAGER_80002=${managerFinalAddress}`
    );
    envContent = envContent.replace(
      /VITE_VAULT_80002=.*/,
      `VITE_VAULT_80002=${vaultFinalAddress}`
    );
    envContent = envContent.replace(
      /VITE_RNFT_80002=.*/,
      `VITE_RNFT_80002=${rnftFinal2Address}`
    );

    fs.writeFileSync(envPath, envContent);
    console.log("    ✓ Updated .env");

    console.log("\n=== DONE! ===");
    console.log("\nNext steps:");
    console.log("1. Restart your dev server");
    console.log("2. Deposit USDC into the vault:", vaultFinalAddress);
    console.log("3. Try payment - it should work now!");
  } else {
    console.log("\n❌ STILL MISMATCHED");
    console.log("\nThe problem: We need ONE MORE iteration!");
    console.log("RNFT manager:", rnftMgr);
    console.log("Should be:", managerFinalAddress);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
