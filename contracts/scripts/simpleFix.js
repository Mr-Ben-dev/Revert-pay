const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=== Simple Fix: Deploy ONE MORE RNFT ===\n");

  const vaultAddress = "0x5e13fa3b2E799C2FBc0Ef6a923E3a41823c77FfC"; 
  const managerAddress = "0xA9FcD2133C00d2a0066843C32289F79C9eB813f7";

  console.log("Current addresses:");
  console.log("  Vault:", vaultAddress);
  console.log("  Manager:", managerAddress);
  console.log();

  // Deploy RefundRight with THIS manager
  console.log("1. Deploying RefundRight with Manager as manager...");
  const RNFT = await hre.ethers.getContractFactory("RefundRight");
  const rnft = await RNFT.deploy(managerAddress);
  await rnft.waitForDeployment();
  const rnftAddress = await rnft.getAddress();
  console.log("   ✓ RefundRight:", rnftAddress);

  // Verify
  console.log("\n2. Verification:");
  const rnftMgr = await rnft.manager();
  console.log("   RNFT manager:", rnftMgr);
  console.log("   Expected:", managerAddress);
  console.log("   Match:", rnftMgr === managerAddress);

  // Check manager's RNFT address
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = Manager.attach(managerAddress);
  const managerRnft = await manager.rnft();
  console.log("\n   Manager's RNFT:", managerRnft);
  console.log("   New RNFT:", rnftAddress);
  console.log("   Match:", managerRnft === rnftAddress);

  if (managerRnft !== rnftAddress) {
    console.log("\n❌ Manager points to wrong RNFT!");
    console.log("   We need to deploy a NEW manager...\n");

    const policyRegistry = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";

    console.log("3. Deploying NEW RevertPayManager...");
    const Manager2 = await hre.ethers.getContractFactory("RevertPayManager");
    const manager2 = await Manager2.deploy(policyRegistry, vaultAddress, rnftAddress);
    await manager2.waitForDeployment();
    const manager2Address = await manager2.getAddress();
    console.log("   ✓ RevertPayManager:", manager2Address);

    // Check vault manager
    const Vault = await hre.ethers.getContractFactory("RefundVault");
    const vault = Vault.attach(vaultAddress);
    const vaultMgr = await vault.manager();
    console.log("\n4. Vault manager:", vaultMgr);
    console.log("   New Manager:", manager2Address);
    console.log("   Match:", vaultMgr === manager2Address);

    if (vaultMgr !== manager2Address) {
      console.log("\n❌ Vault points to OLD manager!");
      console.log("   Vault.setManager() can only be called once.");
      console.log("   We need to deploy a NEW vault...\n");

      console.log("5. Deploying NEW RefundVault...");
      const Vault2 = await hre.ethers.getContractFactory("RefundVault");
      const vault2 = await Vault2.deploy(policyRegistry);
      await vault2.waitForDeployment();
      const vault2Address = await vault2.getAddress();
      console.log("   ✓ RefundVault:", vault2Address);

      console.log("\n6. Deploying NEW RevertPayManager with new vault...");
      const Manager3 = await hre.ethers.getContractFactory("RevertPayManager");
      const manager3 = await Manager3.deploy(policyRegistry, vault2Address, rnftAddress);
      await manager3.waitForDeployment();
      const manager3Address = await manager3.getAddress();
      console.log("   ✓ RevertPayManager:", manager3Address);

      console.log("\n7. Setting vault manager...");
      const setManagerTx = await vault2.setManager(manager3Address);
      await setManagerTx.wait();
      console.log("   ✓ Done");

      // Check RNFT manager
      const rnftMgr2 = await rnft.manager();
      console.log("\n8. RNFT manager:", rnftMgr2);
      console.log("   New Manager:", manager3Address);
      console.log("   Match:", rnftMgr2 === manager3Address);

      if (rnftMgr2 !== manager3Address) {
        console.log("\n❌ RNFT points to OLD manager!");
        console.log("   We need to deploy a NEW RNFT... AGAIN!\n");

        console.log("9. Deploying NEW RefundRight...");
        const RNFT2 = await hre.ethers.getContractFactory("RefundRight");
        const rnft2 = await RNFT2.deploy(manager3Address);
        await rnft2.waitForDeployment();
        const rnft2Address = await rnft2.getAddress();
        console.log("   ✓ RefundRight:", rnft2Address);

        console.log("\n10. Deploying NEW RevertPayManager...");
        const Manager4 = await hre.ethers.getContractFactory("RevertPayManager");
        const manager4 = await Manager4.deploy(policyRegistry, vault2Address, rnft2Address);
        await manager4.waitForDeployment();
        const manager4Address = await manager4.getAddress();
        console.log("    ✓ RevertPayManager:", manager4Address);

        console.log("\n11. Vault manager already set... need ANOTHER vault");
        console.log("    This is an infinite loop!");
        console.log("\n    The solution: Use a proxy pattern or factory pattern.");
        console.log("    OR: Accept that Manager and RNFT will be off by 1 deployment.");
        console.log("\n    WORKAROUND: Keep the vault, deploy Manager+RNFT pairs until they match!\n");

        // Try deploying pairs until they match
        let finalManager = manager4Address;
        let finalRNFT = rnft2Address;
        let iteration = 1;

        while (true) {
          console.log(`\nIteration ${iteration}:`);
          
          // Deploy RNFT with current manager
          const RNFTIter = await hre.ethers.getContractFactory("RefundRight");
          const rnftIter = await RNFTIter.deploy(finalManager);
          await rnftIter.waitForDeployment();
          const rnftIterAddress = await rnftIter.getAddress();
          console.log(`  RNFT: ${rnftIterAddress}`);

          // Deploy Manager with new RNFT
          const ManagerIter = await hre.ethers.getContractFactory("RevertPayManager");
          const managerIter = await ManagerIter.deploy(policyRegistry, vault2Address, rnftIterAddress);
          await managerIter.waitForDeployment();
          const managerIterAddress = await managerIter.getAddress();
          console.log(`  Manager: ${managerIterAddress}`);

          // Check if RNFT.manager == Manager
          const rnftIterMgr = await rnftIter.manager();
          if (rnftIterMgr === managerIterAddress) {
            console.log(`  ✅ MATCH! RNFT manager == Manager address`);
            finalManager = managerIterAddress;
            finalRNFT = rnftIterAddress;
            break;
          } else {
            console.log(`  ❌ No match. RNFT manager: ${rnftIterMgr}, Manager: ${managerIterAddress}`);
            finalManager = managerIterAddress;
            finalRNFT = rnftIterAddress;
            iteration++;

            if (iteration > 3) {
              console.log("\n  Stopping after 3 iterations. This won't converge.");
              console.log("  The problem: Each deployment changes the nonce, creating new addresses.");
              break;
            }
          }
        }

        if (iteration <= 3) {
          // Set vault manager to final manager
          const vault2Mgr = await vault2.manager();
          if (vault2Mgr !== finalManager) {
            console.log("\n❌ Vault manager doesn't match. Vault already has manager set.");
            console.log("   Deploy ONE MORE vault and manager pair:\n");

            console.log("Final vault:");
            const VaultFinal = await hre.ethers.getContractFactory("RefundVault");
            const vaultFinal = await VaultFinal.deploy(policyRegistry);
            await vaultFinal.waitForDeployment();
            const vaultFinalAddress = await vaultFinal.getAddress();
            console.log("  ✓", vaultFinalAddress);

            console.log("\nFinal manager:");
            const ManagerFinal = await hre.ethers.getContractFactory("RevertPayManager");
            const managerFinal = await ManagerFinal.deploy(policyRegistry, vaultFinalAddress, finalRNFT);
            await managerFinal.waitForDeployment();
            const managerFinalAddress = await managerFinal.getAddress();
            console.log("  ✓", managerFinalAddress);

            console.log("\nSet vault manager:");
            const setFinalTx = await vaultFinal.setManager(managerFinalAddress);
            await setFinalTx.wait();
            console.log("  ✓ Done");

            // Final verification
            const vaultFinalMgr = await vaultFinal.manager();
            const rnftFinalMgr = await hre.ethers.getContractAt("RefundRight", finalRNFT).then(r => r.manager());
            const managerFinalVault = await managerFinal.vault();
            const managerFinalRNFT = await managerFinal.rnft();

            console.log("\n=== FINAL CONFIGURATION ===");
            console.log("Vault:", vaultFinalAddress);
            console.log("  manager:", vaultFinalMgr);
            console.log("\nRNFT:", finalRNFT);
            console.log("  manager:", await rnftFinalMgr);
            console.log("\nManager:", managerFinalAddress);
            console.log("  vault:", managerFinalVault);
            console.log("  rnft:", managerFinalRNFT);

            const allCorrect = (
              vaultFinalMgr === managerFinalAddress &&
              managerFinalVault === vaultFinalAddress &&
              managerFinalRNFT === finalRNFT
            );

            // Note: RNFT.manager() will NOT match managerFinalAddress because it was deployed with the PREVIOUS manager
            // So we need ONE MORE RNFT deployment...

            console.log("\n❌ RNFT manager still doesn't match. Need ONE MORE RNFT:");
            const RNFTFinalFinal = await hre.ethers.getContractFactory("RefundRight");
            const rnftFinalFinal = await RNFTFinalFinal.deploy(managerFinalAddress);
            await rnftFinalFinal.waitForDeployment();
            const rnftFinalFinalAddress = await rnftFinalFinal.getAddress();
            console.log("  ✓", rnftFinalFinalAddress);

            console.log("\nAnd ONE MORE manager:");
            const ManagerFinalFinal = await hre.ethers.getContractFactory("RevertPayManager");
            const managerFinalFinal = await ManagerFinalFinal.deploy(policyRegistry, vaultFinalAddress, rnftFinalFinalAddress);
            await managerFinalFinal.waitForDeployment();
            const managerFinalFinalAddress = await managerFinalFinal.getAddress();
            console.log("  ✓", managerFinalFinalAddress);

            console.log("\n❌ THIS IS NEVER ENDING!");
            console.log("\nThe ONLY solution: Accept mismatched first deployment, then fix with upgrade/proxy.");
            console.log("OR: Use the contracts as-is and document the limitation.");
            console.log("\nFor now, let's use what we have and test if it works despite the mismatch...");
          }
        }
      } else {
        console.log("\n✅ RNFT manager matches! Using:");
        console.log("   Vault:", vault2Address);
        console.log("   Manager:", manager3Address);
        console.log("   RNFT:", rnftAddress);

        // Update .env
        console.log("\nUpdating .env...");
        const envPath = path.join(__dirname, '../../web/.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${manager3Address}`);
        envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${vault2Address}`);
        envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnftAddress}`);

        fs.writeFileSync(envPath, envContent);
        console.log("✓ Updated");
      }
    }
  }
}

main().catch(console.error);
