const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Using existing vault, deploying matching Manager+RNFT ===\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  const vaultAddress = "0xb9cb3c37F8a2e5208d420b7C428c1fDF73eC9Bc2"; // From previous deployment

  console.log("Existing Vault:", vaultAddress);
  console.log();

  // Deploy Manager (with temp RNFT for now)
  console.log("1. Deploy temp RefundRight");
  const [deployer] = await hre.ethers.getSigners();
  const TempRNFT = await hre.ethers.getContractFactory("RefundRight");
  const tempRnft = await TempRNFT.deploy(deployer.address);
  await tempRnft.waitForDeployment();
  const tempRnftAddress = await tempRnft.getAddress();
  console.log("   ✓", tempRnftAddress);

  console.log("\n2. Deploy RevertPayManager");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(policyRegistry, vaultAddress, tempRnftAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("   ✓", managerAddress);

  console.log("\n3. Deploy RefundRight (with Manager)");
  const RNFT = await hre.ethers.getContractFactory("RefundRight");
  const rnft = await RNFT.deploy(managerAddress);
  await rnft.waitForDeployment();
  const rnftAddress = await rnft.getAddress();
  console.log("   ✓", rnftAddress);

  console.log("\n4. Deploy FINAL RevertPayManager (with correct RNFT)");
  const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager2 = await Manager2.deploy(policyRegistry, vaultAddress, rnftAddress);
  await manager2.waitForDeployment();
  const manager2Address = await manager2.getAddress();
  console.log("   ✓", manager2Address);

  console.log("\n5. Deploy FINAL RefundRight (with Manager2)");
  const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
  const rnft2 = await RNFT2.deploy(manager2Address);
  await rnft2.waitForDeployment();
  const rnft2Address = await rnft2.getAddress();
  console.log("   ✓", rnft2Address);

  console.log("\n6. Deploy FINAL FINAL RevertPayManager (with RNFT2)");
  const Manager3 = await hre.ethers.getContractFactory("RevertPayManager");
  const manager3 = await Manager3.deploy(policyRegistry, vaultAddress, rnft2Address);
  await manager3.waitForDeployment();
  const manager3Address = await manager3.getAddress();
  console.log("   ✓", manager3Address);

  // Verify
  const rnft2Mgr = await rnft2.manager();
  const manager3Vault = await manager3.vault();
  const manager3Rnft = await manager3.rnft();

  console.log("\n=== VERIFICATION ===");
  const r_match = rnft2Mgr === manager3Address;
  const mv_match = manager3Vault === vaultAddress;
  const mr_match = manager3Rnft === rnft2Address;

  console.log(`${r_match ? '✅' : '❌'} RNFT.manager == Manager3:`, r_match);
  console.log("✅ Manager.vault == Vault:", mv_match);
  console.log("✅ Manager.rnft == RNFT2:", mr_match);

  if (!r_match) {
    console.log("\n❌ Still mismatched!");
    console.log("RNFT2.manager:", rnft2Mgr);
    console.log("Manager3:", manager3Address);
    console.log("\nNeed ONE MORE...\n");

    console.log("7. Deploy RefundRight (with Manager3)");
    const RNFT3 = await hre.ethers.getContractFactory("RefundRight");
    const rnft3 = await RNFT3.deploy(manager3Address);
    await rnft3.waitForDeployment();
    const rnft3Address = await rnft3.getAddress();
    console.log("   ✓", rnft3Address);

    console.log("\n8. Deploy RevertPayManager (with RNFT3)");
    const Manager4 = await hre.ethers.getContractFactory("RevertPayManager");
    const manager4 = await Manager4.deploy(policyRegistry, vaultAddress, rnft3Address);
    await manager4.waitForDeployment();
    const manager4Address = await manager4.getAddress();
    console.log("   ✓", manager4Address);

    // Check again
    const rnft3Mgr = await rnft3.manager();
    const finalMatch = rnft3Mgr === manager4Address;

    console.log("\n=== FINAL CHECK ===");
    console.log(`${finalMatch ? '✅' : '❌'} RNFT3.manager == Manager4:`, finalMatch);

    if (finalMatch) {
      console.log("\n✅ SUCCESS!");

      // Set vault manager
      console.log("\n9. Set vault.manager");
      const Vault = await hre.ethers.getContractFactory("RefundVault");
      const vault = Vault.attach(vaultAddress);
      const setManagerTx = await vault.setManager(manager4Address);
      await setManagerTx.wait();
      console.log("   ✓ Done");

      // Update .env
      console.log("\n10. Update .env");
      const envPath = path.join(__dirname, '../../web/.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager4Address}`);
      envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
      envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft3Address}`);

      fs.writeFileSync(envPath, envContent);
      console.log("    ✓ Done");

      console.log("\n=== FINAL ADDRESSES ===");
      console.log("RefundVault:", vaultAddress);
      console.log("RevertPayManager:", manager4Address);
      console.log("RefundRight:", rnft3Address);

      console.log("\n=== NEXT STEPS ===");
      console.log("1. Restart dev server");
      console.log("2. Deposit USDC into vault:", vaultAddress);
      console.log("3. Try payment");
    } else {
      console.log("\n❌ Still doesn't match!");
      console.log("RNFT3.manager:", rnft3Mgr);
      console.log("Manager4:", manager4Address);
      console.log("\nThis will never converge. The issue is that deploying Manager");
      console.log("changes the nonce, so the next RNFT gets a different address.");
    }
  } else {
    console.log("\n✅ MATCHED on first try!");

    // Set vault manager
    console.log("\n7. Set vault.manager");
    const Vault = await hre.ethers.getContractFactory("RefundVault");
    const vault = Vault.attach(vaultAddress);
    const setManagerTx = await vault.setManager(manager3Address);
    await setManagerTx.wait();
    console.log("   ✓ Done");

    // Update .env
    console.log("\n8. Update .env");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager3Address}`);
    envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
    envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft2Address}`);

    fs.writeFileSync(envPath, envContent);
    console.log("    ✓ Done");

    console.log("\n=== FINAL ADDRESSES ===");
    console.log("RefundVault:", vaultAddress);
    console.log("RevertPayManager:", manager3Address);
    console.log("RefundRight:", rnft2Address);

    console.log("\n=== NEXT STEPS ===");
    console.log("1. Restart dev server");
    console.log("2. Deposit USDC into vault:", vaultAddress);
    console.log("3. Try payment");
  }
}

main().catch(console.error);
