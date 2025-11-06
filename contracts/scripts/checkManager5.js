const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Checking Manager5 + RNFT4 from previous deployment ===\n");

  const vaultAddress = "0x1E47832eE7dB9cA62A188960ba47521D1127d66a";
  const manager5Address = "0x921D38C458B896478CC18eF41c65340A3C0b73A6";
  const rnft4Address = "0xFd20CF931eBd9e725986A24d092F68eE7120f092";

  console.log("Addresses:");
  console.log("  Vault:", vaultAddress);
  console.log("  Manager5:", manager5Address);
  console.log("  RNFT4:", rnft4Address);
  console.log();

  const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
  const Manager = await hre.ethers.getContractAt("RevertPayManager", manager5Address);
  const RNFT = await hre.ethers.getContractAt("RefundRight", rnft4Address);

  const vaultMgr = await Vault.manager();
  const rnftMgr = await RNFT.manager();
  const managerVault = await Manager.vault();
  const managerRnft = await Manager.rnft();

  console.log("Configuration:");
  console.log("  Vault.manager:", vaultMgr);
  console.log("  RNFT4.manager:", rnftMgr);
  console.log("  Manager5.vault:", managerVault);
  console.log("  Manager5.rnft:", managerRnft);
  console.log();

  console.log("Verification:");
  const v_match = vaultMgr === manager5Address;
  const r_match = rnftMgr === manager5Address;
  const mv_match = managerVault === vaultAddress;
  const mr_match = managerRnft === rnft4Address;

  console.log(`  ${v_match ? '✅' : '❌'} Vault.manager == Manager5:`, v_match);
  console.log(`  ${r_match ? '✅' : '❌'} RNFT4.manager == Manager5:`, r_match);
  console.log(`  ${mv_match ? '✅' : '❌'} Manager5.vault == Vault:`, mv_match);
  console.log(`  ${mr_match ? '✅' : '❌'} Manager5.rnft == RNFT4:`, mr_match);

  if (v_match && r_match && mv_match && mr_match) {
    console.log("\n🎉 PERFECT MATCH!");

    // Update .env
    console.log("\nUpdating .env...");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager5Address}`);
    envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
    envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft4Address}`);

    fs.writeFileSync(envPath, envContent);
    console.log("✓ Done");

    console.log("\n=== FINAL CONFIGURATION ===");
    console.log("RefundVault:", vaultAddress);
    console.log("RevertPayManager:", manager5Address);
    console.log("RefundRight:", rnft4Address);

    console.log("\n=== NEXT STEPS ===");
    console.log("1. Restart dev server");
    console.log("2. Try payment - IT WILL WORK!");
  } else {
    console.log("\n❌ No match. Vault.manager is still set to Manager3.");
    console.log("\nThe contracts are stuck in a circular dependency.");
    console.log("To fix this properly, we need to:");
    console.log("1. Add setManager() function to RefundVault (make it changeable)");
    console.log("2. OR add setRNFT() function to RevertPayManager");
    console.log("3. OR use upgradeable proxy pattern");
    console.log("\nFor now, the payment flow is broken and can't be fixed without");
    console.log("modifying the contract code.");
  }
}

main().catch(console.error);
