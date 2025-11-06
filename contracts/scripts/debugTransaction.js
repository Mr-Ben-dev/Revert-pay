const hre = require("hardhat");

async function main() {
  const managerAddress = "0x1EF77736Dbb6eba2ae588be74ACA025Ea41CC93C"; // NEW address
  const merchantAddress = "0xdd802be8CA188F9FbD67fC55e5434a4d4fB7454C";
  const customerAddress = "0xdd802be8CA188F9FbD67fC55e5434a4d4fB7454C";
  const mockUSDC = "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87";
  const amount = hre.ethers.parseEther("100");

  const Manager = await hre.ethers.getContractAt("RevertPayManager", managerAddress);
  
  console.log("Testing createOrder with NEW contracts:");
  console.log("  Manager:", managerAddress);
  console.log("  Merchant:", merchantAddress);
  console.log("  Customer:", customerAddress);
  console.log("  Token:", mockUSDC);
  console.log("  Amount:", hre.ethers.formatEther(amount), "USDC");

  try {
    await Manager.createOrder.staticCall(
      merchantAddress,
      customerAddress,
      mockUSDC,
      amount,
      "Test order"
    );
    console.log("\n✓ Transaction would succeed!");
  } catch (error) {
    console.log("\n✗ Transaction would fail:");
    console.log("Error:", error.message);
    
    if (error.data) {
      console.log("\nRevert data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
