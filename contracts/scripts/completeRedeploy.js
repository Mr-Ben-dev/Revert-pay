const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Complete Redeployment ===\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  const mockUSDC = "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87";
  
  console.log("Existing contracts:");
  console.log("  Policy Registry:", policyRegistry);
  console.log("  MockUSDC:", mockUSDC);
  console.log();

  //  1. Deploy RefundVault
  console.log("1. Deploying RefundVault...");
  const Vault = await hre.ethers.getContractFactory("RefundVault");
  const vault = await Vault.deploy(policyRegistry);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("   ✓ RefundVault:", vaultAddress);

  // 2. Deploy temporary RefundRight (manager = deployer)
  console.log("\n2. Deploying temporary RefundRight...");
  const [deployer] = await hre.ethers.getSigners();
  const TempRNFT = await hre.ethers.getContractFactory("RefundRight");
  const tempRnft = await TempRNFT.deploy(deployer.address);
  await tempRnft.waitForDeployment();
  const tempRnftAddress = await tempRnft.getAddress();
  console.log("   ✓ Temp RefundRight:", tempRnftAddress);

  // 3. Deploy RevertPayManager (with vault and temp RNFT)
  console.log("\n3. Deploying RevertPayManager...");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(policyRegistry, vaultAddress, tempRnftAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("   ✓ RevertPayManager:", managerAddress);

  // 4. Set vault manager
  console.log("\n4. Setting vault manager...");
  const setManagerTx = await vault.setManager(managerAddress);
  await setManagerTx.wait();
  console.log("   ✓ Vault manager set to RevertPayManager");

  // 5. Deploy final RefundRight (manager = RevertPayManager)
  console.log("\n5. Deploying final RefundRight...");
  const RNFT = await hre.ethers.getContractFactory("RefundRight");
  const rnft = await RNFT.deploy(managerAddress);
  await rnft.waitForDeployment();
  const rnftAddress = await rnft.getAddress();
  console.log("   ✓ Final RefundRight:", rnftAddress);

  // Now we have a problem: RevertPayManager points to tempRnft, but we need it to point to rnft
  // And RefundRight points to managerAddress, which is correct
  // But Manager.rnft() returns tempRnftAddress, not rnftAddress
  
  // The ONLY solution: Deploy a NEW RefundVault and RevertPayManager
  
  console.log("\n6. Problem: RevertPayManager points to temp RNFT");
  console.log("   Solution: Deploy NEW vault and manager\n");

  // 7. Deploy NEW RefundVault
  console.log("7. Deploying NEW RefundVault...");
  const Vault2 = await hre.ethers.getContractFactory("RefundVault");
  const vault2 = await Vault2.deploy(policyRegistry);
  await vault2.waitForDeployment();
  const vault2Address = await vault2.getAddress();
  console.log("   ✓ RefundVault (v2):", vault2Address);

  // 8. Deploy NEW RevertPayManager with correct vault and RNFT
  console.log("\n8. Deploying NEW RevertPayManager with correct RNFT...");
  const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager2 = await Manager2.deploy(policyRegistry, vault2Address, rnftAddress);
  await manager2.waitForDeployment();
  const manager2Address = await manager2.getAddress();
  console.log("   ✓ RevertPayManager (v2):", manager2Address);

  // 9. Set vault2 manager
  console.log("\n9. Setting vault manager...");
  const setManager2Tx = await vault2.setManager(manager2Address);
  await setManager2Tx.wait();
  console.log("   ✓ Vault manager set to RevertPayManager (v2)");

  // 10. Problem: RefundRight manager is OLD manager, not NEW manager
  console.log("\n10. Problem: RefundRight manager is OLD manager");
  const rnftManager = await rnft.manager();
  console.log("    RNFT manager:", rnftManager);
  console.log("    New Manager:", manager2Address);
  console.log("    Solution: Deploy NEW RefundRight\n");

  // 11. Deploy FINAL RefundRight with NEW manager
  console.log("11. Deploying FINAL RefundRight...");
  const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
  const rnft2 = await RNFT2.deploy(manager2Address);
  await rnft2.waitForDeployment();
  const rnft2Address = await rnft2.getAddress();
  console.log("    ✓ RefundRight (v2):", rnft2Address);

  // 12. Deploy FINAL RevertPayManager
  console.log("\n12. Deploying FINAL RevertPayManager...");
  const Manager3 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager3 = await Manager3.deploy(policyRegistry, vault2Address, rnft2Address);
  await manager3.waitForDeployment();
  const manager3Address = await manager3.getAddress();
  console.log("    ✓ RevertPayManager (v3):", manager3Address);

  // 13. Update vault manager - WAIT this won't work, manager already set!
  console.log("\n13. Problem: Vault manager already set, need NEW vault");
  console.log("    Solution: Deploy ANOTHER vault\n");

  // OK this is getting ridiculous. Let me just do a 2-iteration approach:

  console.log("14. CLEAN SLATE - Final attempt\n");

  // Deploy vault
  console.log("    a. Deploying RefundVault...");
  const VaultFinal = await hre.ethers.getContractFactory("RefundVault");
  const vaultFinal = await VaultFinal.deploy(policyRegistry);
  await vaultFinal.waitForDeployment();
  const vaultFinalAddress = await vaultFinal.getAddress();
  console.log("       ✓", vaultFinalAddress);

  // Deploy temp RNFT
  console.log("    b. Deploying temp RefundRight...");
  const TempRNFTFinal = await hre.ethers.getContractFactory("RefundRight");
  const tempRnftFinal = await TempRNFTFinal.deploy(deployer.address);
  await tempRnftFinal.waitForDeployment();
  const tempRnftFinalAddress = await tempRnftFinal.getAddress();
  console.log("       ✓", tempRnftFinalAddress);

  // Deploy manager
  console.log("    c. Deploying RevertPayManager...");
  const ManagerFinal1 = await hre.ethers.getContractFactory("RevertPayManager");
  const managerFinal1 = await ManagerFinal1.deploy(policyRegistry, vaultFinalAddress, tempRnftFinalAddress);
  await managerFinal1.waitForDeployment();
  const managerFinal1Address = await managerFinal1.getAddress();
  console.log("       ✓", managerFinal1Address);

  // Deploy final RNFT with manager
  console.log("    d. Deploying final RefundRight...");
  const RNFTFinal = await hre.ethers.getContractFactory("RefundRight");
  const rnftFinal = await RNFTFinal.deploy(managerFinal1Address);
  await rnftFinal.waitForDeployment();
  const rnftFinalAddress = await rnftFinal.getAddress();
  console.log("       ✓", rnftFinalAddress);

  // Redeploy manager with correct RNFT
  console.log("    e. Redeploying RevertPayManager with correct RNFT...");
  const ManagerFinal2 = await hre.ethers.getContractFactory("RevertPayManager");
  const managerFinal2 = await ManagerFinal2.deploy(policyRegistry, vaultFinalAddress, rnftFinalAddress);
  await managerFinal2.waitForDeployment();
  const managerFinal2Address = await managerFinal2.getAddress();
  console.log("       ✓", managerFinal2Address);

  // Redeploy RNFT with correct manager
  console.log("    f. Redeploying RefundRight with correct manager...");
  const RNFTFinal2 = await hre.ethers.getContractFactory("RefundRight");
  const rnftFinal2 = await RNFTFinal2.deploy(managerFinal2Address);
  await rnftFinal2.waitForDeployment();
  const rnftFinal2Address = await rnftFinal2.getAddress();
  console.log("       ✓", rnftFinal2Address);

  // Redeploy manager AGAIN
  console.log("    g. Redeploying RevertPayManager AGAIN...");
  const ManagerFinal3 = await hre.ethers.getContractFactory("RevertPayManager");
  const managerFinal3 = await ManagerFinal3.deploy(policyRegistry, vaultFinalAddress, rnftFinal2Address);
  await managerFinal3.waitForDeployment();
  const managerFinal3Address = await managerFinal3.getAddress();
  console.log("       ✓", managerFinal3Address);

  // Set vault manager
  console.log("    h. Setting vault manager...");
  const setManagerFinalTx = await vaultFinal.setManager(managerFinal3Address);
  await setManagerFinalTx.wait();
  console.log("       ✓ Done");

  // Verify
  console.log("\n15. Final Verification:");
  const vaultMgr = await vaultFinal.manager();
  const rnftMgr = await rnftFinal2.manager();
  const mgrVault = await managerFinal3.vault();
  const mgrRnft = await managerFinal3.rnft();

  console.log("\n=== FINAL ADDRESSES ===");
  console.log("RefundVault:", vaultFinalAddress);
  console.log("  manager:", vaultMgr);
  console.log("\nRefundRight:", rnftFinal2Address);
  console.log("  manager:", rnftMgr);
  console.log("\nRevertPayManager:", managerFinal3Address);
  console.log("  vault:", mgrVault);
  console.log("  rnft:", mgrRnft);

  console.log("\n=== VERIFICATION ===");
  console.log("Vault manager == Manager:", vaultMgr === managerFinal3Address);
  console.log("RNFT manager == Manager:", rnftMgr === managerFinal3Address);
  console.log("Manager vault == Vault:", mgrVault === vaultFinalAddress);
  console.log("Manager RNFT == RNFT:", mgrRnft === rnftFinal2Address);

  const allMatch = (
    vaultMgr === managerFinal3Address &&
    rnftMgr === managerFinal3Address &&
    mgrVault === vaultFinalAddress &&
    mgrRnft === rnftFinal2Address
  );

  if (allMatch) {
    console.log("\n✅ ALL CORRECT!");
    
    // Update .env
    console.log("\n16. Updating web/.env...");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(
      /VITE_MANAGER_80002=.*/,
      `VITE_MANAGER_80002=${managerFinal3Address}`
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

    console.log("\n=== NEXT STEPS ===");
    console.log("1. Restart dev server (the .env was updated)");
    console.log("2. Deposit USDC into the NEW vault:", vaultFinalAddress);
    console.log("3. Try payment again");
  } else {
    console.log("\n❌ MISMATCH - something went wrong");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
