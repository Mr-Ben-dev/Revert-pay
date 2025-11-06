const { ethers } = require("hardhat");

// Calculate error selector for "InsufficientBalance(address,uint256,uint256)"
const selector = ethers.id("InsufficientBalance(address,uint256,uint256)").slice(0, 10);
console.log("InsufficientBalance selector:", selector);

// This matches 0xfb8f41b2
