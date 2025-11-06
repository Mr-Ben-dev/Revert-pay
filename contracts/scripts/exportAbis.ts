import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("📦 Exporting ABIs...\n");

  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const outputDir = path.join(__dirname, "../../web/src/shared/abis");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Contracts to export
  const contracts = [
    { name: "RefundPolicyRegistry", file: "RefundPolicyRegistry.sol" },
    { name: "RefundVault", file: "RefundVault.sol" },
    { name: "RefundRight", file: "RefundRight.sol" },
    { name: "RevertPayManager", file: "RevertPayManager.sol" },
    { name: "MockUSDC", file: "MockUSDC.sol" },
  ];

  for (const contract of contracts) {
    const artifactPath = path.join(
      artifactsDir,
      contract.file,
      `${contract.name}.json`
    );

    if (!fs.existsSync(artifactPath)) {
      console.log(`⚠️  Artifact not found: ${contract.name}`);
      continue;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    const outputPath = path.join(outputDir, `${contract.name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));

    console.log(`✅ Exported ${contract.name} ABI to ${outputPath}`);
  }

  // Also export ERC20 ABI for token interactions
  const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
  ];

  const erc20OutputPath = path.join(outputDir, "ERC20.json");
  fs.writeFileSync(erc20OutputPath, JSON.stringify(erc20Abi, null, 2));
  console.log(`✅ Exported ERC20 ABI to ${erc20OutputPath}`);

  console.log("\n🎉 ABI export complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
