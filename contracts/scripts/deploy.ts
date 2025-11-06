import * as fs from "fs";
import { ethers } from "hardhat";
import * as path from "path";

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log(`Deploying contracts with account: ${deployer.address}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(
    `Account balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} tokens\n`
  );

  // 1. Deploy MockUSDC (for testing)
  console.log("📝 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log(`✅ MockUSDC deployed to: ${mockUSDCAddress}\n`);

  // 2. Deploy RefundPolicyRegistry
  console.log("📝 Deploying RefundPolicyRegistry...");
  const RefundPolicyRegistry = await ethers.getContractFactory(
    "RefundPolicyRegistry"
  );
  const policyRegistry = await RefundPolicyRegistry.deploy();
  await policyRegistry.waitForDeployment();
  const policyRegistryAddress = await policyRegistry.getAddress();
  console.log(
    `✅ RefundPolicyRegistry deployed to: ${policyRegistryAddress}\n`
  );

  // 3. Deploy RefundVault
  console.log("📝 Deploying RefundVault...");
  const RefundVault = await ethers.getContractFactory("RefundVault");
  const vault = await RefundVault.deploy(policyRegistryAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`✅ RefundVault deployed to: ${vaultAddress}\n`);

  // 4. Deploy RefundRight with deployer as temporary manager
  console.log("📝 Deploying RefundRight (temporary manager)...");
  const RefundRight = await ethers.getContractFactory("RefundRight");
  const rnft = await RefundRight.deploy(deployer.address);
  await rnft.waitForDeployment();
  const rnftAddress = await rnft.getAddress();
  console.log(`✅ RefundRight deployed to: ${rnftAddress}\n`);

  // 5. Deploy RevertPayManager
  console.log("📝 Deploying RevertPayManager...");
  const RevertPayManager = await ethers.getContractFactory("RevertPayManager");
  const manager = await RevertPayManager.deploy(
    policyRegistryAddress,
    vaultAddress,
    rnftAddress
  );
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log(`✅ RevertPayManager deployed to: ${managerAddress}\n`);

  // Note: RefundRight's manager is immutable, we need correct manager
  // Redeploy RefundRight with the correct manager
  console.log("📝 Redeploying RefundRight with correct manager...");
  const rnftFinal = await RefundRight.deploy(managerAddress);
  await rnftFinal.waitForDeployment();
  const rnftFinalAddress = await rnftFinal.getAddress();
  console.log(`✅ RefundRight redeployed to: ${rnftFinalAddress}\n`);

  // 6. Deploy final RevertPayManager with all correct addresses
  console.log(
    "📝 Deploying final RevertPayManager with correct RefundRight..."
  );
  const managerFinal = await RevertPayManager.deploy(
    policyRegistryAddress,
    vaultAddress,
    rnftFinalAddress
  );
  await managerFinal.waitForDeployment();
  const managerFinalAddress = await managerFinal.getAddress();
  console.log(
    `✅ Final RevertPayManager deployed to: ${managerFinalAddress}\n`
  );

  // 7. Set manager in RefundVault
  console.log("🔧 Setting manager in RefundVault...");
  const setVaultManagerTx = await vault.setManager(managerFinalAddress);
  await setVaultManagerTx.wait();
  console.log(`✅ Manager set in RefundVault\n`);

  // Final addresses
  const addresses = {
    MANAGER: managerFinalAddress,
    POLICY: policyRegistryAddress,
    VAULT: vaultAddress,
    RNFT: rnftFinalAddress,
    MOCKUSDC: mockUSDCAddress,
  };

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log(`RefundPolicyRegistry: ${addresses.POLICY}`);
  console.log(`RefundVault:          ${addresses.VAULT}`);
  console.log(`RefundRight:          ${addresses.RNFT}`);
  console.log(`RevertPayManager:     ${addresses.MANAGER}`);
  console.log(`MockUSDC:             ${addresses.MOCKUSDC}`);
  console.log("========================\n");

  // 8. Write addresses to root addresses.json
  const rootDir = path.join(__dirname, "../..");
  const addressesPath = path.join(rootDir, "addresses.json");

  let existingAddresses: any = {};
  if (fs.existsSync(addressesPath)) {
    existingAddresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  }

  existingAddresses[chainId] = addresses;

  fs.writeFileSync(addressesPath, JSON.stringify(existingAddresses, null, 2));
  console.log(`✅ Addresses written to ${addressesPath}\n`);

  console.log("🎉 Deployment complete!\n");

  return addresses;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
