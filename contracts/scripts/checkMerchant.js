const hre = require("hardhat");

async function main() {
  const vaultAddress = "0xCef4d4911B224E858F3c15f0C82cF098e8Ad103c";
  const policyAddress = "0xa4C96647E5718ff6673395b7a5D85632eEFd61db";
  const merchantAddress = "0xdd802be8CA188F9FbD67fC55e5434a4d4fB7454C";
  const mockUSDC = "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87";

  const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
  const Policy = await hre.ethers.getContractAt("RefundPolicyRegistry", policyAddress);

  // Check vault balance
  const balance = await Vault.balance(merchantAddress);
  console.log(`Vault balance: ${hre.ethers.formatEther(balance)} USDC`);

  const reserved = await Vault.reserved(merchantAddress);
  console.log(`Reserved: ${hre.ethers.formatEther(reserved)} USDC`);

  // Check policy
  const policy = await Policy.getPolicy(merchantAddress);
  console.log("\nPolicy:");
  console.log("  Exists:", policy.exists);
  console.log("  Token:", policy.token);
  console.log("  Refund window:", policy.refundWindow.toString(), "seconds");
  console.log("  Restocking fee:", policy.restockingFeeBps.toString(), "bps");
  console.log("  Auto approve:", policy.autoApprove);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
