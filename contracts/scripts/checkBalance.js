const hre = require("hardhat");

async function main() {
  const rnftAddress = "0x8A04D093e439a783D0F67CDd3B56e3aacE8E2297";
  const userAddress = "0xdd802be8CA188F9FbD67fC55e5434a4d4fB7454C";

  const RefundRight = await hre.ethers.getContractAt("RefundRight", rnftAddress);

  const balance = await RefundRight.balanceOf(userAddress);
  console.log(`Balance of ${userAddress}: ${balance}`);

  const totalSupply = await RefundRight.totalSupply();
  console.log(`Total supply: ${totalSupply}`);

  // If total supply > 0, check who owns token 0
  if (totalSupply > 0n) {
    try {
      const owner = await RefundRight.ownerOf(0n);
      console.log(`Owner of token 0: ${owner}`);
      
      const info = await RefundRight.info(0n);
      console.log("Token 0 info:", info);
    } catch (error) {
      console.log("Error getting token 0:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
