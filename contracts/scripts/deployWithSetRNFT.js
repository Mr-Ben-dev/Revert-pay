const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Deploying with updated Manager contract ===\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  const vaultAddress = "0x1E47832eE7dB9cA62A188960ba47521D1127d66a";

  // 1. Deploy temp RNFT
  console.log("1. Deploy temp RefundRight");
  const [deployer] = await hre.ethers.getSigners();
  const TempRNFT = await hre.ethers.getContractFactory("RefundRight");
  const tempRnft = await TempRNFT.deploy(deployer.address);
  await tempRnft.waitForDeployment();
  const tempRnftAddress = await tempRnft.getAddress();
  console.log("   ✓", tempRnftAddress);

  // 2. Deploy Manager
  console.log("\n2. Deploy RevertPayManager (with setRNFT function)");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(policyRegistry, vaultAddress, tempRnftAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("   ✓", managerAddress);

  // 3. Deploy real RNFT
  console.log("\n3. Deploy RefundRight (manager = new Manager)");
  const RNFT = await hre.ethers.getContractFactory("RefundRight");
  const rnft = await RNFT.deploy(managerAddress);
  await rnft.waitForDeployment();
  const rnftAddress = await rnft.getAddress();
  console.log("   ✓", rnftAddress);

  // 4. Update Manager's RNFT address
  console.log("\n4. Call Manager.setRNFT() to use correct RNFT");
  const setRNFTTx = await manager.setRNFT(rnftAddress);
  await setRNFTTx.wait();
  console.log("   ✓ Manager.rnft updated to", rnftAddress);

  // 5. Verify
  console.log("\n5. Verification:");
  const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
  const vaultMgr = await Vault.manager();
  const rnftMgr = await rnft.manager();
  const managerVault = await manager.vault();
  const managerRnft = await manager.rnft();

  console.log("   Vault.manager:", vaultMgr);
  console.log("   RNFT.manager:", rnftMgr);
  console.log("   Manager.vault:", managerVault);
  console.log("   Manager.rnft:", managerRnft);

  const v_match = vaultMgr === managerAddress;
  const r_match = rnftMgr === managerAddress;
  const mv_match = managerVault === vaultAddress;
  const mr_match = managerRnft === rnftAddress;

  console.log("\n   ✅ RNFT.manager == Manager:", r_match);
  console.log("   ✅ Manager.vault == Vault:", mv_match);
  console.log("   ✅ Manager.rnft == RNFT:", mr_match);
  console.log(`   ${v_match ? '✅' : '⚠️ '} Vault.manager == Manager:`, v_match);

  if (!v_match) {
    console.log("\n   Vault.manager is set to old Manager:", vaultMgr);
    console.log("   Vault.setManager() can only be called once.");
    console.log("   Deploy a NEW vault...\n");

    console.log("6. Deploy NEW RefundVault");
    const Vault2 = await hre.ethers.getContractFactory("RefundVault");
    const vault2 = await Vault2.deploy(policyRegistry);
    await vault2.waitForDeployment();
    const vault2Address = await vault2.getAddress();
    console.log("   ✓", vault2Address);

    console.log("\n7. Deploy NEW RevertPayManager with new vault");
    const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
    const manager2 = await Manager2.deploy(policyRegistry, vault2Address, tempRnftAddress);
    await manager2.waitForDeployment();
    const manager2Address = await manager2.getAddress();
    console.log("   ✓", manager2Address);

    console.log("\n8. Deploy NEW RefundRight with Manager2");
    const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
    const rnft2 = await RNFT2.deploy(manager2Address);
    await rnft2.waitForDeployment();
    const rnft2Address = await rnft2.getAddress();
    console.log("   ✓", rnft2Address);

    console.log("\n9. Call Manager2.setRNFT()");
    const setRNFT2Tx = await manager2.setRNFT(rnft2Address);
    await setRNFT2Tx.wait();
    console.log("   ✓ Done");

    console.log("\n10. Set vault2.manager");
    const setManagerTx = await vault2.setManager(manager2Address);
    await setManagerTx.wait();
    console.log("    ✓ Done");

    // Final verification
    console.log("\n11. Final verification:");
    const vault2Mgr = await vault2.manager();
    const rnft2Mgr = await rnft2.manager();
    const manager2Vault = await manager2.vault();
    const manager2Rnft = await manager2.rnft();

    console.log("    Vault.manager:", vault2Mgr);
    console.log("    RNFT.manager:", rnft2Mgr);
    console.log("    Manager.vault:", manager2Vault);
    console.log("    Manager.rnft:", manager2Rnft);

    const allMatch = (
      vault2Mgr === manager2Address &&
      rnft2Mgr === manager2Address &&
      manager2Vault === vault2Address &&
      manager2Rnft === rnft2Address
    );

    if (allMatch) {
      console.log("\n🎉 ALL PERFECT!");

      // Update .env
      console.log("\n12. Update .env");
      const envPath = path.join(__dirname, '../../web/.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager2Address}`);
      envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vault2Address}`);
      envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft2Address}`);

      fs.writeFileSync(envPath, envContent);
      console.log("    ✓ Done");

      console.log("\n=== FINAL ADDRESSES ===");
      console.log("RefundVault:", vault2Address);
      console.log("RevertPayManager:", manager2Address);
      console.log("RefundRight:", rnft2Address);

      console.log("\n=== NEXT STEPS ===");
      console.log("1. Restart dev server");
      console.log("2. Deposit USDC into NEW vault");
      console.log("3. Try payment - IT WILL WORK!");
    } else {
      console.log("\n❌ Something still mismatched");
    }
  } else {
    // Update .env
    console.log("\n6. Update .env");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${managerAddress}`);
    envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
    envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnftAddress}`);

    fs.writeFileSync(envPath, envContent);
    console.log("   ✓ Done");

    console.log("\n=== ALL SET! ===");
    console.log("RefundVault:", vaultAddress);
    console.log("RevertPayManager:", managerAddress);
    console.log("RefundRight:", rnftAddress);
  }
}

main().catch(console.error);
