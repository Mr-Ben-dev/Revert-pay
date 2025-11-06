import * as fs from "fs";
import { run } from "hardhat";
import * as path from "path";

async function main() {
  console.log("🔍 Starting contract verification...\n");

  // Read addresses from addresses.json
  const addressesPath = path.join(__dirname, "../../addresses.json");

  if (!fs.existsSync(addressesPath)) {
    console.error(
      "❌ addresses.json not found. Please deploy contracts first."
    );
    process.exit(1);
  }

  const allAddresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

  // Get current network chain ID
  const hre = require("hardhat");
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  const addresses = allAddresses[chainId];

  if (!addresses) {
    console.error(`❌ No addresses found for chain ID ${chainId}`);
    process.exit(1);
  }

  console.log(`Verifying contracts on chain ID: ${chainId}\n`);

  // Verify MockUSDC
  try {
    console.log("📝 Verifying MockUSDC...");
    await run("verify:verify", {
      address: addresses.MOCKUSDC,
      constructorArguments: [],
    });
    console.log("✅ MockUSDC verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ MockUSDC already verified\n");
    } else {
      console.error(`❌ Error verifying MockUSDC: ${error.message}\n`);
    }
  }

  // Verify RefundPolicyRegistry
  try {
    console.log("📝 Verifying RefundPolicyRegistry...");
    await run("verify:verify", {
      address: addresses.POLICY,
      constructorArguments: [],
    });
    console.log("✅ RefundPolicyRegistry verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ RefundPolicyRegistry already verified\n");
    } else {
      console.error(
        `❌ Error verifying RefundPolicyRegistry: ${error.message}\n`
      );
    }
  }

  // Verify RefundVault
  try {
    console.log("📝 Verifying RefundVault...");
    await run("verify:verify", {
      address: addresses.VAULT,
      constructorArguments: [addresses.POLICY],
    });
    console.log("✅ RefundVault verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ RefundVault already verified\n");
    } else {
      console.error(`❌ Error verifying RefundVault: ${error.message}\n`);
    }
  }

  // Verify RefundRight
  try {
    console.log("📝 Verifying RefundRight...");
    await run("verify:verify", {
      address: addresses.RNFT,
      constructorArguments: [addresses.MANAGER],
    });
    console.log("✅ RefundRight verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ RefundRight already verified\n");
    } else {
      console.error(`❌ Error verifying RefundRight: ${error.message}\n`);
    }
  }

  // Verify RevertPayManager
  try {
    console.log("📝 Verifying RevertPayManager...");
    await run("verify:verify", {
      address: addresses.MANAGER,
      constructorArguments: [addresses.POLICY, addresses.VAULT, addresses.RNFT],
    });
    console.log("✅ RevertPayManager verified\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ RevertPayManager already verified\n");
    } else {
      console.error(`❌ Error verifying RevertPayManager: ${error.message}\n`);
    }
  }

  console.log("🎉 Verification complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
