const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Using Manager2 + RNFT2 from last deployment ===\n");

  const vaultAddress = "0x1E47832eE7dB9cA62A188960ba47521D1127d66a";
  const manager2Address = "0x73623A61391b95b32acc71dC1Adb79012BA01ee3";
  const rnft2Address = "0x7d3f1deB8CD59CB38B2e39Bd5d0aCBa0B8Fd2570";

  console.log("Addresses:");
  console.log("  Vault:", vaultAddress);
  console.log("  Manager2:", manager2Address);
  console.log("  RNFT2:", rnft2Address);
  console.log();

  // Verify all connections
  const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
  const Manager = await hre.ethers.getContractAt("RevertPayManager", manager2Address);
  const RNFT = await hre.ethers.getContractAt("RefundRight", rnft2Address);

  const vaultMgr = await Vault.manager();
  const rnftMgr = await RNFT.manager();
  const managerVault = await Manager.vault();
  const managerRnft = await Manager.rnft();

  console.log("Current state:");
  console.log("  Vault.manager:", vaultMgr);
  console.log("  RNFT2.manager:", rnftMgr);
  console.log("  Manager2.vault:", managerVault);
  console.log("  Manager2.rnft:", managerRnft);
  console.log();

  // Check matches
  console.log("Verification:");
  console.log("  RNFT2.manager == Manager2:", rnftMgr === manager2Address);
  console.log("  Manager2.vault == Vault:", managerVault === vaultAddress);
  console.log("  Manager2.rnft == RNFT2:", managerRnft === rnft2Address);

  if (rnftMgr === manager2Address && managerVault === vaultAddress && managerRnft === rnft2Address) {
    console.log("\n✅ RNFT2 and Manager2 match perfectly!");

    // Set vault manager if not already set
    if (vaultMgr === "0x0000000000000000000000000000000000000000") {
      console.log("\n  Setting vault.manager = Manager2...");
      const setManagerTx = await Vault.setManager(manager2Address);
      await setManagerTx.wait();
      console.log("  ✓ Done");
    } else if (vaultMgr === manager2Address) {
      console.log("\n✅ Vault.manager already set correctly!");
    } else {
      console.log("\n❌ Vault.manager set to wrong address:", vaultMgr);
      console.log("   Need to deploy a NEW vault...");
      return;
    }

    // Update .env
    console.log("\nUpdating .env...");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager2Address}`);
    envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
    envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft2Address}`);

    fs.writeFileSync(envPath, envContent);
    console.log("✓ Done");

    console.log("\n=== FINAL ADDRESSES ===");
    console.log("RefundVault:", vaultAddress);
    console.log("RevertPayManager:", manager2Address);
    console.log("RefundRight:", rnft2Address);

    console.log("\n=== NEXT STEPS ===");
    console.log("1. Restart dev server (npm run dev in web folder)");
    console.log("2. Hard refresh browser (Ctrl+Shift+R)");
    console.log("3. Go to Merchant Dashboard");
    console.log("4. Deposit USDC into vault");
    console.log("5. Try payment");
    console.log("\n🎉 IT WILL WORK!");
  } else {
    console.log("\n❌ Mismatch detected!");
    console.log("Need to check which iteration matches...");
  }
}

main().catch(console.error);
