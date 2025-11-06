// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC token for testing and demo purposes
 * @dev 18 decimals, anyone can mint
 */
contract MockUSDC is ERC20 {
    /**
     * @notice Constructor
     */
    constructor() ERC20("Mock USDC", "USDC") {}

    /**
     * @notice Mint tokens to any address (for testing)
     * @param to Recipient address
     * @param amount Amount to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Get decimals (18 for this mock)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
