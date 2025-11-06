const hre = require("hardhat");

async function main() {
  const managerAddress = "0xC3313Edd7E15087c3301141F8eC25A14c47bb08b";
  const userAddress = "0xdd802be8CA188F9FbD67fC55e5434a4d4fB7454C";

  const Manager = await hre.ethers.getContractAt("RevertPayManager", managerAddress);

  // Check the next order ID (should be > 0 if any orders were created)
  try {
    // Try to get order 0 (first order would be orderId 1, but let's check)
    const order0 = await Manager.orders(
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    console.log("Order 0:", order0);
  } catch (error) {
    console.log("No order 0");
  }

  // Check if there are any events
  console.log("\nChecking recent OrderCreated events...");
  const filter = Manager.filters.OrderCreated();
  const events = await Manager.queryFilter(filter, -10000); // Last 10000 blocks
  console.log(`Found ${events.length} OrderCreated events`);

  events.forEach((event, i) => {
    console.log(`\nEvent ${i}:`);
    console.log("  Order ID:", event.args.orderId);
    console.log("  Customer:", event.args.customer);
    console.log("  Merchant:", event.args.merchant);
    console.log("  Token:", event.args.token);
    console.log("  Amount:", hre.ethers.formatEther(event.args.amount));
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
