const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Deploying Manager4 with RNFT3 ===\n");

  const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  const vaultAddress = "0x1E47832eE7dB9cA62A188960ba47521D1127d66a";
  const rnft3Address = "0x2BC514C4b8c4219cFe1AeFA704Cd3423058E6680";

  console.log("Using:");
  console.log("  Vault:", vaultAddress);
  console.log("  RNFT3:", rnft3Address);
  console.log();

  console.log("1. Deploying RevertPayManager with RNFT3...");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(policyRegistry, vaultAddress, rnft3Address);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("   ✓ Manager4:", managerAddress);

  // Check if RNFT3.manager == Manager4
  const RNFT = await hre.ethers.getContractAt("RefundRight", rnft3Address);
  const rnftMgr = await RNFT.manager();

  console.log("\n2. Verification:");
  console.log("   RNFT3.manager:", rnftMgr);
  console.log("   Manager4:", managerAddress);
  console.log("   Match:", rnftMgr === managerAddress);

  if (rnftMgr !== managerAddress) {
    console.log("\n❌ RNFT3.manager != Manager4");
    console.log("   RNFT3 was deployed with Manager3 as its manager.");
    console.log("   We need to deploy a NEW RNFT with Manager4...");

    console.log("\n3. Deploying RefundRight with Manager4...");
    const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
    const rnft2 = await RNFT2.deploy(managerAddress);
    await rnft2.waitForDeployment();
    const rnft2Address = await rnft2.getAddress();
    console.log("   ✓ RNFT4:", rnft2Address);

    console.log("\n4. Deploying RevertPayManager with RNFT4...");
    const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
    const manager2 = await Manager2.deploy(policyRegistry, vaultAddress, rnft2Address);
    await manager2.waitForDeployment();
    const manager2Address = await manager2.getAddress();
    console.log("   ✓ Manager5:", manager2Address);

    // Check vault manager
    const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
    const vaultMgr = await Vault.manager();

    console.log("\n5. Vault.manager:", vaultMgr);
    console.log("   Need to be:", manager2Address);

    if (vaultMgr !== manager2Address) {
      console.log("\n❌ Vault manager is wrong. Vault.setManager() can only be called once.");
      console.log("   We're stuck in the circular dependency loop again!");
      console.log("\n   THE ONLY SOLUTION: Deploy a NEW vault + Manager + RNFT all together.");
      console.log("   But we know this creates the same loop...");
      console.log("\n   REAL SOLUTION: Modify the contracts to use upgradeable proxies");
      console.log("   or add a setRNFT() / setManager() function.");
      console.log("\n   FOR NOW: Let's just test with the contracts we have.");
      console.log("   Use Manager3 and accept that payments will fail until we fix the contracts.");
    }
  } else {
    console.log("\n✅ PERFECT MATCH!");

    // Check vault manager
    const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
    const vaultMgr = await Vault.manager();

    console.log("\n3. Vault.manager:", vaultMgr);
    console.log("   Should be:", managerAddress);

    if (vaultMgr === managerAddress) {
      console.log("\n✅ Vault manager already correct! All set!");

      // Update .env
      console.log("\n4. Updating .env...");
      const envPath = path.join(__dirname, '../../web/.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${managerAddress}`);
      envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
      envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft3Address}`);

      fs.writeFileSync(envPath, envContent);
      console.log("   ✓ Done");

      console.log("\n=== SUCCESS! ===");
      console.log("RefundVault:", vaultAddress);
      console.log("RevertPayManager:", managerAddress);
      console.log("RefundRight:", rnft3Address);
      console.log("\nRestart dev server and try payment!");
    } else {
      console.log("\n⚠️  Vault manager is set to:", vaultMgr);
      console.log("   Can't change it. This configuration won't work.");
    }
  }
}

main().catch(console.error);
