const hre = require("hardhat");

async function main() {
  const vaultAddress = "0x0883A8dA70b79370bE1F544992a261d617E7CE54";
  const merchantAddress = "0xdd802be8CA188F9FbD67fC55e5434a4d4fB7454C";
  const mockUSDC = "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87";

  console.log("Checking NEW vault balance:");
  console.log("  Vault:", vaultAddress);
  console.log("  Merchant:", merchantAddress);
  console.log("  Token:", mockUSDC);

  const Vault = await hre.ethers.getContractAt("RefundVault", vaultAddress);
  const Token = await hre.ethers.getContractAt("IERC20", mockUSDC);

  // Check vault balance
  const vaultBalance = await Vault.balance(merchantAddress);
  console.log("\nVault balance:", hre.ethers.formatEther(vaultBalance), "USDC");

  // Check reserved amount
  const reserved = await Vault.reserved(merchantAddress);
  console.log("Reserved:", hre.ethers.formatEther(reserved), "USDC");

  // Check available
  const available = vaultBalance - reserved;
  console.log("Available:", hre.ethers.formatEther(available), "USDC");

  // Check actual token balance in vault
  const tokenBalance = await Token.balanceOf(vaultAddress);
  console.log("\nActual USDC in vault contract:", hre.ethers.formatEther(tokenBalance), "USDC");
}

main().catch(console.error);
