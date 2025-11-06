const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Testing Manager1 + RNFT1 ===\n");

  const vaultAddress = "0x1E47832eE7dB9cA62A188960ba47521D1127d66a";
  const manager1Address = "0xC3732d66E1178e7375a28A0677dde435E044693b";
  const rnft1Address = "0x968Eb50c26845c7d8CA38e69c8F5d5F4cf46396E";

  const Manager = await hre.ethers.getContractAt("RevertPayManager", manager1Address);
  const RNFT = await hre.ethers.getContractAt("RefundRight", rnft1Address);

  const rnftMgr = await RNFT.manager();
  const managerVault = await Manager.vault();
  const managerRnft = await Manager.rnft();

  console.log("Manager1:", manager1Address);
  console.log("RNFT1:", rnft1Address);
  console.log();
  console.log("RNFT1.manager:", rnftMgr);
  console.log("Manager1.vault:", managerVault);
  console.log("Manager1.rnft:", managerRnft);
  console.log();

  const r_match = rnftMgr === manager1Address;
  const v_match = managerVault === vaultAddress;
  const rnft_match = managerRnft === rnft1Address;

  console.log("RNFT1.manager == Manager1:", r_match);
  console.log("Manager1.vault == Vault:", v_match);
  console.log("Manager1.rnft == RNFT1:", rnft_match);

  if (r_match && v_match && rnft_match) {
    console.log("\n✅ PERFECT MATCH!");

    // Set vault manager
    const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
    const vaultMgr = await Vault.manager();

    if (vaultMgr !== manager1Address) {
      console.log("\nVault.manager currently:", vaultMgr);
      console.log("Need to set to Manager1. But it's already set...");
      console.log("Deploying NEW vault...");

      const VaultNew = await hre.ethers.getContractFactory("RefundVault");
      const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
      const vaultNew = await VaultNew.deploy(policyRegistry);
      await vaultNew.waitForDeployment();
      const vaultNewAddress = await vaultNew.getAddress();
      console.log("✓ New Vault:", vaultNewAddress);

      console.log("\nDeploying Manager with new vault...");
      const ManagerNew = await hre.ethers.getContractFactory("RevertPayManager");
      const managerNew = await ManagerNew.deploy(policyRegistry, vaultNewAddress, rnft1Address);
      await managerNew.waitForDeployment();
      const managerNewAddress = await managerNew.getAddress();
      console.log("✓ New Manager:", managerNewAddress);

      console.log("\nSetting vault manager...");
      const setManagerTx = await vaultNew.setManager(managerNewAddress);
      await setManagerTx.wait();
      console.log("✓ Done");

      // Check if RNFT1.manager == new Manager
      const rnftMgrNew = await RNFT.manager();
      if (rnftMgrNew !== managerNewAddress) {
        console.log("\n❌ RNFT1.manager != new Manager");
        console.log("RNFT1.manager:", rnftMgrNew);
        console.log("New Manager:", managerNewAddress);
        console.log("\nNeed to deploy NEW RNFT...");

        const RNFTNew = await hre.ethers.getContractFactory("RefundRight");
        const rnftNew = await RNFTNew.deploy(managerNewAddress);
        await rnftNew.waitForDeployment();
        const rnftNewAddress = await rnftNew.getAddress();
        console.log("✓ New RNFT:", rnftNewAddress);

        console.log("\nDeploying Manager AGAIN...");
        const ManagerFinal = await hre.ethers.getContractFactory("RevertPayManager");
        const managerFinal = await ManagerFinal.deploy(policyRegistry, vaultNewAddress, rnftNewAddress);
        await managerFinal.waitForDeployment();
        const managerFinalAddress = await managerFinal.getAddress();
        console.log("✓ Final Manager:", managerFinalAddress);

        // This creates the loop again... Let me just accept we need to use the LAST correctly matched pair.
        // From the terminal output, Manager3 + RNFT3 had:
        // - RNFT3.manager == Manager3 ✅
        // - Vault.manager == Manager3 ✅
        // - Manager3.vault == Vault ✅
        // - Manager3.rnft == RNFT2 (not RNFT3) ❌

        console.log("\n❌ This creates an infinite loop.");
        console.log("\nThe ONLY pair that matched was:");
        console.log("Manager3: 0x089B791357896Ef96ef23908437e42579ecbF6Bd");
        console.log("RNFT3: 0x2BC514C4b8c4219cFe1AeFA704Cd3423058E6680");
        console.log("(Vault.manager was already set to Manager3)");
        console.log("\nBut Manager3.rnft() points to RNFT2, not RNFT3.");
        console.log("This means calls to Manager.rnft() will return the wrong address.");
        console.log("\nSOLUTION: Update the frontend to use the hardcoded RNFT3 address,");
        console.log("not Manager.rnft().");
      }
    } else {
      console.log("\n✅ Vault.manager already correct!");

      // Update .env
      console.log("\nUpdating .env...");
      const envPath = path.join(__dirname, '../../web/.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager1Address}`);
      envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vaultAddress}`);
      envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnft1Address}`);

      fs.writeFileSync(envPath, envContent);
      console.log("✓ Done");

      console.log("\n=== FINAL ADDRESSES ===");
      console.log("RefundVault:", vaultAddress);
      console.log("RevertPayManager:", manager1Address);
      console.log("RefundRight:", rnft1Address);
    }
  } else {
    console.log("\n❌ No match. Manager1.rnft points to temp RNFT, not RNFT1.");
  }
}

main().catch(console.error);
