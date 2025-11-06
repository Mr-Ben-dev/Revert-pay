const hre = require("hardhat");

async function main() {
  const rnftAddress = "0x2eCf83Df0D55EF11B77f7cb5D53A7D380E27a993";
  const customerAddress = "0xdd802be8CA188F9FbD67fC55e5434a4d4fB7454C";

  const RefundRight = await hre.ethers.getContractAt("RefundRight", rnftAddress);

  const balance = await RefundRight.balanceOf(customerAddress);
  console.log(`Customer balance: ${balance}`);

  const totalSupply = await RefundRight.totalSupply();
  console.log(`Total supply: ${totalSupply}`);

  // Check if any tokens exist
  if (totalSupply > 0n) {
    for (let i = 0; i < Number(totalSupply); i++) {
      const tokenId = await RefundRight.tokenByIndex(i);
      const owner = await RefundRight.ownerOf(tokenId);
      console.log(`Token ${tokenId}: owned by ${owner}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
