const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== CORRECT Deployment Sequence ===\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  const mockUSDC = "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87";

  // Step 1: Deploy Vault
  console.log("1. Deploy RefundVault");
  const Vault = await hre.ethers.getContractFactory("RefundVault");
  const vault = await Vault.deploy(policyRegistry);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("   ✓", vaultAddress);

  // Step 2: Deploy temp RNFT (just so Manager constructor doesn't fail)
  console.log("\n2. Deploy temp RefundRight (manager = deployer)");
  const [deployer] = await hre.ethers.getSigners();
  const TempRNFT = await hre.ethers.getContractFactory("RefundRight");
  const tempRnft = await TempRNFT.deploy(deployer.address);
  await tempRnft.waitForDeployment();
  const tempRnftAddress = await tempRnft.getAddress();
  console.log("   ✓", tempRnftAddress);

  // Step 3: Deploy Manager
  console.log("\n3. Deploy RevertPayManager");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(policyRegistry, vaultAddress, tempRnftAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("   ✓", managerAddress);

  // Step 4: Deploy real RNFT with Manager as manager
  console.log("\n4. Deploy real RefundRight (manager = RevertPayManager)");
  const RNFT = await hre.ethers.getContractFactory("RefundRight");
  const rnft = await RNFT.deploy(managerAddress);
  await rnft.waitForDeployment();
  const rnftAddress = await rnft.getAddress();
  console.log("   ✓", rnftAddress);

  // Step 5: Set vault manager
  console.log("\n5. Set vault.manager = RevertPayManager");
  const setManagerTx = await vault.setManager(managerAddress);
  await setManagerTx.wait();
  console.log("   ✓ Done");

  // Now the problem: Manager.rnft() points to tempRnft, not rnft
  // Solution: Don't use Manager.rnft() - use the actual rnft address in the frontend!
  // OR: Deploy everything again but smarter

  console.log("\n=== Current State ===");
  console.log("✅ Vault.manager =", await vault.manager());
  console.log("✅ RNFT.manager =", await rnft.manager());
  console.log("✅ Manager.vault =", await manager.vault());
  console.log("❌ Manager.rnft =", await manager.rnft(), "(points to temp RNFT)");
  console.log("✅ Real RNFT =", rnftAddress);

  console.log("\n=== THE ISSUE ===");
  console.log("Manager contract has `rnft` hardcoded in constructor.");
  console.log("We can't change it after deployment.");
  console.log("\n=== THE FIX ===");
  console.log("Option 1: Use the real RNFT address in frontend, ignore Manager.rnft()");
  console.log("Option 2: Add setRNFT() function to Manager (requires contract change)");
  console.log("Option 3: Deploy Manager again with correct RNFT\n");

  console.log("Going with Option 3...\n");

  // Step 6: Deploy Manager AGAIN with correct RNFT
  console.log("6. Deploy RevertPayManager AGAIN (with correct RNFT)");
  const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager2 = await Manager2.deploy(policyRegistry, vaultAddress, rnftAddress);
  await manager2.waitForDeployment();
  const manager2Address = await manager2.getAddress();
  console.log("   ✓", manager2Address);

  // Problem: Vault.manager is already set to old Manager
  // But RNFT.manager points to old Manager too!

  console.log("\n=== New Problem ===");
  console.log("Vault.manager =", await vault.manager(), "(can't change - already set)");
  console.log("RNFT.manager =", await rnft.manager(), "(can't change - immutable)");
  console.log("New Manager =", manager2Address);

  console.log("\n=== The REAL Fix ===");
  console.log("We need to deploy ALL THREE together in a way that works.\n");
  console.log("The trick: Accept that we need TWO rounds of deployments:");
  console.log("Round 1: Vault + Manager1 (with temp RNFT) + Set vault.manager");
  console.log("Round 2: RNFT (with Manager1) + Manager2 (with RNFT) + [Can't set vault.manager again]");
  console.log("\nSo we need a NEW vault for round 2!\n");

  console.log("7. Deploy NEW RefundVault");
  const Vault2 = await hre.ethers.getContractFactory("RefundVault");
  const vault2 = await Vault2.deploy(policyRegistry);
  await vault2.waitForDeployment();
  const vault2Address = await vault2.getAddress();
  console.log("   ✓", vault2Address);

  console.log("\n8. Deploy NEW RevertPayManager");
  const Manager3 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager3 = await Manager3.deploy(policyRegistry, vault2Address, rnftAddress);
  await manager3.waitForDeployment();
  const manager3Address = await manager3.getAddress();
  console.log("   ✓", manager3Address);

  console.log("\n9. Deploy NEW RefundRight");
  const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
  const rnft2 = await RNFT2.deploy(manager3Address);
  await rnft2.waitForDeployment();
  const rnft2Address = await rnft2.getAddress();
  console.log("   ✓", rnft2Address);

  console.log("\n10. Deploy FINAL RevertPayManager");
  const Manager4 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager4 = await Manager4.deploy(policyRegistry, vault2Address, rnft2Address);
  await manager4.waitForDeployment();
  const manager4Address = await manager4.getAddress();
  console.log("    ✓", manager4Address);

  console.log("\n11. Set vault2.manager");
  const setManager2Tx = await vault2.setManager(manager4Address);
  await setManager2Tx.wait();
  console.log("    ✓ Done");

  // Verify
  const vault2Mgr = await vault2.manager();
  const rnft2Mgr = await rnft2.manager();
  const manager4Vault = await manager4.vault();
  const manager4Rnft = await manager4.rnft();

  console.log("\n=== FINAL VERIFICATION ===");
  const v_match = vault2Mgr === manager4Address;
  const r_match = rnft2Mgr === manager4Address;
  const mv_match = manager4Vault === vault2Address;
  const mr_match = manager4Rnft === rnft2Address;

  console.log("✅ Vault.manager == Manager4:", v_match);
  console.log(`${r_match ? '✅' : '❌'} RNFT.manager == Manager4:`, r_match);
  console.log("✅ Manager.vault == Vault2:", mv_match);
  console.log("✅ Manager.rnft == RNFT2:", mr_match);

  if (v_match && r_match && mv_match && mr_match) {
    console.log("\n🎉 ALL ADDRESSES MATCH!\n");

    // Update .env
    console.log("12. Updating .env");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager4Address}`);
    envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vault2Address}`);
    envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft2Address}`);

    fs.writeFileSync(envPath, envContent);
    console.log("    ✓ Done");

    console.log("\n=== FINAL ADDRESSES ===");
    console.log("RefundVault:", vault2Address);
    console.log("RevertPayManager:", manager4Address);
    console.log("RefundRight:", rnft2Address);

    console.log("\n=== NEXT STEPS ===");
    console.log("1. Restart dev server");
    console.log("2. Deposit USDC into NEW vault");
    console.log("3. Try payment");
  } else {
    console.log("\n❌ MISMATCH - RNFT.manager points to Manager3, not Manager4");
    console.log("Need ONE MORE iteration...");
  }
}

main().catch(console.error);
