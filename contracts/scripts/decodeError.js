const hre = require("hardhat");

async function main() {
  const revertData = "0xfb8f41b20000000000000000000000001ef77736dbb6eba2ae588be74aca025ea41cc93c0000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000056bc75e2d63100000";
  
  // This is the InsufficientBalance error selector
  const errorSelector = revertData.slice(0, 10);
  console.log("Error selector:", errorSelector);
  
  if (errorSelector === "0xfb8f41b2") {
    console.log("Error: InsufficientBalance(address merchant, uint256 available, uint256 required)");
    
    // Decode the parameters
    const abiCoder = new hre.ethers.AbiCoder();
    const params = abiCoder.decode(
      ["address", "uint256", "uint256"],
      "0x" + revertData.slice(10)
    );
    
    console.log("\nParameters:");
    console.log("  Merchant:", params[0]);
    console.log("  Available balance:", hre.ethers.formatEther(params[1]), "USDC");
    console.log("  Required amount:", hre.ethers.formatEther(params[2]), "USDC");
  }
}

main().catch(console.error);
