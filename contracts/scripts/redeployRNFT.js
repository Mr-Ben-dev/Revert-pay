const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const vaultAddress = "0xCef4d4911B224E858F3c15f0C82cF098e8Ad103c";
  const policyAddress = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";

  console.log("1. Deploying temporary RefundRight...");
  const RefundRight = await hre.ethers.getContractFactory("RefundRight");
  const [deployer] = await hre.ethers.getSigners();
  const tempRnft = await RefundRight.deploy(deployer.address); // Use deployer as temp manager
  await tempRnft.waitForDeployment();
  const tempRnftAddress = await tempRnft.getAddress();
  console.log("✓ Temp RefundRight:", tempRnftAddress);

  console.log("\n2. Deploying RevertPayManager...");
  const Manager = await hre.ethers.getContractFactory("RevertPayManager");
  const manager = await Manager.deploy(
    policyAddress,
    vaultAddress,
    tempRnftAddress
  );
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("✓ RevertPayManager:", managerAddress);

  console.log("\n3. Deploying final RefundRight with correct manager...");
  const finalRnft = await RefundRight.deploy(managerAddress);
  await finalRnft.waitForDeployment();
  const rnftAddress = await finalRnft.getAddress();
  console.log("✓ RefundRight:", rnftAddress);

  console.log("\n4. Deploying new RefundVault...");
  const RefundVault = await hre.ethers.getContractFactory("RefundVault");
  const vault = await RefundVault.deploy(policyAddress);
  await vault.waitForDeployment();
  const newVaultAddress = await vault.getAddress();
  console.log("✓ RefundVault:", newVaultAddress);

  console.log("\n5. Setting new vault manager...");
  const vaultTx = await vault.setManager(managerAddress);
  await vaultTx.wait();
  console.log("✓ Vault manager set");

  // Update .env file
  const envPath = path.join(__dirname, "../../web/.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  
  envContent = envContent.replace(/VITE_RNFT_80002=.*/, `VITE_RNFT_80002=${rnftAddress}`);
  envContent = envContent.replace(/VITE_MANAGER_80002=.*/, `VITE_MANAGER_80002=${managerAddress}`);
  envContent = envContent.replace(/VITE_VAULT_80002=.*/, `VITE_VAULT_80002=${newVaultAddress}`);
  
  fs.writeFileSync(envPath, envContent);
  console.log("✓ Updated web/.env");

  console.log("\n=== Deployment Complete ===");
  console.log("RefundRight:", rnftAddress);
  console.log("RevertPayManager:", managerAddress);
  console.log("RefundVault:", newVaultAddress);
  console.log("\nIMPORTANT: You need to deposit funds into the NEW vault!");
  console.log("The old vault still has your 600 USDC but uses the old manager.");
  console.log("Please deposit funds into the new vault to enable payments.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
