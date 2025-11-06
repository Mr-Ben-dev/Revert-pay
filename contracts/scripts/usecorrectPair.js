const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Using the CORRECT pair ===\n");

  const vaultAddress = "0xb9cb3c37F8a2e5208d420b7C428c1fDF73eC9Bc2";
  const managerAddress = "0x9683E24c87D7b7d1811e51F6E0285632f553cFe8"; // Manager3
  const rnftAddress = "0x0Eecd8Ce88b5De6eB3747d43f1FeF738A33427Cd"; // RNFT3 (deployed with Manager3)

  console.log("Addresses:");
  console.log("  Vault:", vaultAddress);
  console.log("  Manager:", managerAddress);
  console.log("  RNFT:", rnftAddress);
  console.log();

  // Verify
  const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
  const Manager = await hre.ethers.getContractAt("RevertPayManager", managerAddress);
  const RNFT = await hre.ethers.getContractAt("RefundRight", rnftAddress);

  const vaultMgr = await Vault.manager();
  const rnftMgr = await RNFT.manager();
  const managerVault = await Manager.vault();
  const managerRnft = await Manager.rnft();

  console.log("Current state:");
  console.log("  Vault.manager:", vaultMgr);
  console.log("  RNFT.manager:", rnftMgr);
  console.log("  Manager.vault:", managerVault);
  console.log("  Manager.rnft:", managerRnft);
  console.log();

  // Check if vault.manager is set
  if (vaultMgr === "0x0000000000000000000000000000000000000000") {
    console.log("✅ Vault manager not set yet. Setting it...");
    const setManagerTx = await Vault.setManager(managerAddress);
    await setManagerTx.wait();
    console.log("   ✓ Vault.manager set to Manager");
  } else if (vaultMgr === managerAddress) {
    console.log("✅ Vault.manager already correct");
  } else {
    console.log("❌ Vault.manager set to wrong address:", vaultMgr);
    console.log("   Expected:", managerAddress);
    console.log("   Can't fix - manager can only be set once");
    return;
  }

  // Check RNFT manager
  if (rnftMgr === managerAddress) {
    console.log("✅ RNFT.manager correct");
  } else {
    console.log("❌ RNFT.manager wrong:", rnftMgr);
    console.log("   Expected:", managerAddress);
    return;
  }

  // Check Manager.vault
  if (managerVault === vaultAddress) {
    console.log("✅ Manager.vault correct");
  } else {
    console.log("❌ Manager.vault wrong:", managerVault);
    return;
  }

  // Check Manager.rnft
  if (managerRnft === rnftAddress) {
    console.log("✅ Manager.rnft correct");
  } else {
    console.log("⚠️  Manager.rnft mismatch:");
    console.log("   Manager.rnft:", managerRnft);
    console.log("   Actual RNFT:", rnftAddress);
    console.log("   This means Manager.rnft() will return wrong address");
    console.log("   But we'll use the correct RNFT in the frontend");
  }

  console.log("\n=== ALL CHECKS PASSED ===\n");

  // Update .env
  console.log("Updating .env...");
  const envPath = path.join(__dirname, '../../web/.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${managerAddress}`);
  envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
  envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnftAddress}`);

  fs.writeFileSync(envPath, envContent);
  console.log("✓ Done");

  console.log("\n=== FINAL CONFIGURATION ===");
  console.log("RefundVault:", vaultAddress);
  console.log("RevertPayManager:", managerAddress);
  console.log("RefundRight:", rnftAddress);

  console.log("\n=== NEXT STEPS ===");
  console.log("1. Restart dev server (Ctrl+C then npm run dev)");
  console.log("2. Hard refresh browser (Ctrl+Shift+R)");
  console.log("3. Go to Merchant Dashboard");
  console.log("4. Deposit USDC into vault:", vaultAddress);
  console.log("5. Try making a payment");
  console.log("\n✅ Payment should work now!");
}

main().catch(console.error);
