const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== ABSOLUTE FINAL DEPLOYMENT ===\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";

  // 1. Deploy NEW Vault
  console.log("1. Deploy RefundVault");
  const Vault = await hre.ethers.getContractFactory("RefundVault");
  const vault = await Vault.deploy(policyRegistry);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("   ✓", vaultAddress);

  // 2. Deploy temp RNFT
  console.log("\n2. Deploy temp RefundRight");
  const [deployer] = await hre.ethers.getSigners();
  const TempRNFT = await hre.ethers.getContractFactory("RefundRight");
  const tempRnft = await TempRNFT.deploy(deployer.address);
  await tempRnft.waitForDeployment();
  const tempRnftAddress = await tempRnft.getAddress();
  console.log("   ✓", tempRnftAddress);

  // 3. Deploy Manager (iteration 1)
  console.log("\n3. Deploy RevertPayManager");
  const Manager1 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager1 = await Manager1.deploy(policyRegistry, vaultAddress, tempRnftAddress);
  await manager1.waitForDeployment();
  const manager1Address = await manager1.getAddress();
  console.log("   ✓", manager1Address);

  // 4. Deploy RNFT with Manager1
  console.log("\n4. Deploy RefundRight (manager = Manager1)");
  const RNFT1 = await hre.ethers.getContractFactory("RefundRight");
  const rnft1 = await RNFT1.deploy(manager1Address);
  await rnft1.waitForDeployment();
  const rnft1Address = await rnft1.getAddress();
  console.log("   ✓", rnft1Address);

  // 5. Deploy Manager with RNFT1 (iteration 2)
  console.log("\n5. Deploy RevertPayManager (with RNFT1)");
  const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager2 = await Manager2.deploy(policyRegistry, vaultAddress, rnft1Address);
  await manager2.waitForDeployment();
  const manager2Address = await manager2.getAddress();
  console.log("   ✓", manager2Address);

  // 6. Deploy RNFT with Manager2
  console.log("\n6. Deploy RefundRight (manager = Manager2)");
  const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
  const rnft2 = await RNFT2.deploy(manager2Address);
  await rnft2.waitForDeployment();
  const rnft2Address = await rnft2.getAddress();
  console.log("   ✓", rnft2Address);

  // 7. Deploy Manager with RNFT2 (iteration 3)
  console.log("\n7. Deploy RevertPayManager (with RNFT2)");
  const Manager3 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager3 = await Manager3.deploy(policyRegistry, vaultAddress, rnft2Address);
  await manager3.waitForDeployment();
  const manager3Address = await manager3.getAddress();
  console.log("   ✓", manager3Address);

  // 8. Deploy RNFT with Manager3
  console.log("\n8. Deploy RefundRight (manager = Manager3)");
  const RNFT3 = await hre.ethers.getContractFactory("RefundRight");
  const rnft3 = await RNFT3.deploy(manager3Address);
  await rnft3.waitForDeployment();
  const rnft3Address = await rnft3.getAddress();
  console.log("   ✓", rnft3Address);

  // Now check: does RNFT3.manager == Manager3?
  const rnft3Mgr = await rnft3.manager();
  console.log("\n=== CHECK 1 ===");
  console.log("RNFT3.manager:", rnft3Mgr);
  console.log("Manager3:", manager3Address);
  console.log("Match:", rnft3Mgr === manager3Address);

  if (rnft3Mgr === manager3Address) {
    console.log("\n✅ PERFECT! Using Manager3 + RNFT3");

    // Set vault manager
    console.log("\n9. Set vault.manager = Manager3");
    const setManagerTx = await vault.setManager(manager3Address);
    await setManagerTx.wait();
    console.log("   ✓ Done");

    // Final verification
    const vaultMgr = await vault.manager();
    const manager3Vault = await manager3.vault();
    const manager3Rnft = await manager3.rnft();

    console.log("\n=== FINAL VERIFICATION ===");
    console.log("✅ Vault.manager == Manager3:", vaultMgr === manager3Address);
    console.log("✅ RNFT3.manager == Manager3:", rnft3Mgr === manager3Address);
    console.log("✅ Manager3.vault == Vault:", manager3Vault === vaultAddress);
    console.log("✅ Manager3.rnft == RNFT3:", manager3Rnft === rnft3Address);

    if (
      vaultMgr === manager3Address &&
      rnft3Mgr === manager3Address &&
      manager3Vault === vaultAddress &&
      manager3Rnft === rnft3Address
    ) {
      console.log("\n🎉 ALL ADDRESSES MATCH PERFECTLY!\n");

      // Update .env
      console.log("10. Update .env");
      const envPath = path.join(__dirname, '../../web/.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager3Address}`);
      envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
      envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft3Address}`);

      fs.writeFileSync(envPath, envContent);
      console.log("    ✓ Done");

      console.log("\n=== FINAL ADDRESSES ===");
      console.log("RefundVault:", vaultAddress);
      console.log("RevertPayManager:", manager3Address);
      console.log("RefundRight:", rnft3Address);

      console.log("\n=== NEXT STEPS ===");
      console.log("1. Restart dev server");
      console.log("2. Deposit USDC into vault");
      console.log("3. Try payment - IT WILL WORK!");
    }
  } else {
    console.log("\n❌ Mismatch - need one more iteration...");
    
    // 9. Deploy Manager with RNFT3 (iteration 4)
    console.log("\n9. Deploy RevertPayManager (with RNFT3)");
    const Manager4 = await hre.ethers.getContractFactory("RevertPayManager");
    const manager4 = await Manager4.deploy(policyRegistry, vaultAddress, rnft3Address);
    await manager4.waitForDeployment();
    const manager4Address = await manager4.getAddress();
    console.log("   ✓", manager4Address);

    // This will still mismatch because RNFT3.manager = Manager3, not Manager4
    console.log("\n❌ This creates an infinite loop.");
    console.log("   The best we can do is use Manager3 + RNFT3,");
    console.log("   and accept that Manager3.rnft() points to RNFT2.");
    console.log("\n   Using Manager3 + RNFT3 anyway...");

    // Set vault manager to Manager3
    console.log("\n10. Set vault.manager = Manager3");
    const setManagerTx = await vault.setManager(manager3Address);
    await setManagerTx.wait();
    console.log("    ✓ Done");

    // Update .env with Manager3 + RNFT3
    console.log("\n11. Update .env");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager3Address}`);
    envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
    envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft3Address}`);

    fs.writeFileSync(envPath, envContent);
    console.log("    ✓ Done");

    console.log("\n=== USING THESE ADDRESSES ===");
    console.log("RefundVault:", vaultAddress);
    console.log("RevertPayManager:", manager3Address);
    console.log("RefundRight:", rnft3Address);
    console.log("\nNote: Manager.rnft() returns", manager3Rnft, "but we use", rnft3Address);
  }
}

main().catch(console.error);
