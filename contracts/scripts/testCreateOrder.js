const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  const managerAddress = "0x089B791357896Ef96ef23908437e42579ecbF6Bd"; // NEW Manager3
  const merchantAddress = "0xdd802be8CA188F9FbD67fC55e5434a4d4fB7454C";
  const mockUSDC = "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87";
  const amount = hre.ethers.parseEther("100");

  console.log("Signer address:", signer.address);
  console.log("Manager:", managerAddress);
  console.log("Merchant:", merchantAddress);
  console.log("Token:", mockUSDC);
  console.log("Amount:", hre.ethers.formatEther(amount), "USDC\n");

  const Token = await hre.ethers.getContractAt("MockUSDC", mockUSDC);
  const Manager = await hre.ethers.getContractAt("RevertPayManager", managerAddress);

  // Check signer's USDC balance
  const signerBalance = await Token.balanceOf(signer.address);
  console.log("Signer USDC balance:", hre.ethers.formatEther(signerBalance), "USDC");

  // Check approval
  const allowance = await Token.allowance(signer.address, managerAddress);
  console.log("Allowance to Manager:", hre.ethers.formatEther(allowance), "USDC\n");

  if (signerBalance < amount) {
    console.log("❌ Insufficient balance");
    return;
  }

  if (allowance < amount) {
    console.log("⚠️  Need to approve Manager to spend USDC");
    console.log("Approving...");
    const approveTx = await Token.approve(managerAddress, hre.ethers.MaxUint256);
    await approveTx.wait();
    console.log("✓ Approved\n");
  }

  // Try createOrder
  console.log("Testing createOrder...");
  try {
    const tx = await Manager.createOrder(
      merchantAddress,
      signer.address,
      mockUSDC,
      amount,
      "Test order"
    );
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✓ Success! Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.log("✗ Failed:", error.message);
    if (error.data) {
      console.log("Revert data:", error.data);
    }
  }
}

main().catch(console.error);
