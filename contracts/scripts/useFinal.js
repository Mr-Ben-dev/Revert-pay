const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Using the ONLY working pair: Manager3 + RNFT3 ===\n");

  const vaultAddress = "0x1E47832eE7dB9cA62A188960ba47521D1127d66a";
  const manager3Address = "0x089B791357896Ef96ef23908437e42579ecbF6Bd";
  const rnft3Address = "0x2BC514C4b8c4219cFe1AeFA704Cd3423058E6680";

  console.log("Addresses:");
  console.log("  Vault:", vaultAddress);
  console.log("  Manager3:", manager3Address);
  console.log("  RNFT3:", rnft3Address);
  console.log();

  // Verify
  const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
  const Manager = await hre.ethers.getContractAt("RevertPayManager", manager3Address);
  const RNFT = await hre.ethers.getContractAt("RefundRight", rnft3Address);

  const vaultMgr = await Vault.manager();
  const rnftMgr = await RNFT.manager();
  const managerVault = await Manager.vault();
  const managerRnft = await Manager.rnft();

  console.log("Verification:");
  console.log("✅ Vault.manager == Manager3:", vaultMgr === manager3Address);
  console.log("✅ RNFT3.manager == Manager3:", rnftMgr === manager3Address);
  console.log("✅ Manager3.vault == Vault:", managerVault === vaultAddress);
  console.log("⚠️  Manager3.rnft:", managerRnft, "(points to RNFT2, not RNFT3)");
  console.log("    We'll use RNFT3 in the frontend instead.");

  if (vaultMgr === manager3Address && rnftMgr === manager3Address && managerVault === vaultAddress) {
    console.log("\n✅ CONFIGURATION VALID!\n");

    // Update .env
    console.log("Updating .env...");
    const envPath = path.join(__dirname, '../../web/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager3Address}`);
    envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
    envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft3Address}`);

    fs.writeFileSync(envPath, envContent);
    console.log("✓ Done");

    console.log("\n=== FINAL CONFIGURATION ===");
    console.log("RefundVault:", vaultAddress);
    console.log("RevertPayManager:", manager3Address);
    console.log("RefundRight:", rnft3Address);

    console.log("\n=== NEXT STEPS ===");
    console.log("1. Restart dev server (stop with Ctrl+C, then run `npm run dev` in web folder)");
    console.log("2. Hard refresh browser (Ctrl+Shift+R)");
    console.log("3. Go to Merchant Dashboard");
    console.log("4. Deposit USDC into the NEW vault:", vaultAddress);
    console.log("5. Generate a payment link");
    console.log("6. Make a payment");
    console.log("\n🎉 Payment should work and mint an rNFT!");
  } else {
    console.log("\n❌ Configuration invalid!");
  }
}

main().catch(console.error);
