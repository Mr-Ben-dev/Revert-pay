// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./RefundPolicyRegistry.sol";

/**
 * @title RefundVault
 * @notice Holds merchant funds for refunds with reserve accounting
 * @dev Only the manager contract can reserve/unreserve/payRefund
 */
contract RefundVault {
    using SafeERC20 for IERC20;

    // State variables
    RefundPolicyRegistry public immutable registry;
    address public manager;

    // Merchant balances
    mapping(address => uint256) public balance;
    mapping(address => uint256) public reserved;

    // Events
    event Deposited(address indexed merchant, address indexed token, uint256 amount);
    event Withdrawn(address indexed merchant, address indexed token, uint256 amount);
    event Reserved(address indexed merchant, uint256 amount);
    event Unreserved(address indexed merchant, uint256 amount);
    event RefundPaid(address indexed merchant, address indexed to, address indexed token, uint256 amount);
    event ManagerUpdated(address indexed oldManager, address indexed newManager);

    // Modifiers
    modifier onlyManager() {
        require(msg.sender == manager, "RefundVault: only manager");
        _;
    }

    /**
     * @notice Constructor
     * @param _registry Address of the RefundPolicyRegistry
     */
    constructor(address _registry) {
        require(_registry != address(0), "RefundVault: zero registry");
        registry = RefundPolicyRegistry(_registry);
    }

    /**
     * @notice Set the manager address (one-time setup)
     * @param _manager Manager contract address
     */
    function setManager(address _manager) external {
        require(manager == address(0), "RefundVault: manager already set");
        require(_manager != address(0), "RefundVault: zero manager");
        manager = _manager;
        emit ManagerUpdated(address(0), _manager);
    }

    /**
     * @notice Deposit tokens into the vault
     * @param token ERC-20 token address
     * @param amount Amount to deposit
     */
    function deposit(address token, uint256 amount) external {
        RefundPolicyRegistry.Policy memory policy = registry.getPolicy(msg.sender);
        require(policy.exists, "RefundVault: no policy");
        require(token == policy.token, "RefundVault: wrong token");
        require(amount > 0, "RefundVault: zero amount");

        balance[msg.sender] += amount;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, token, amount);
    }

    /**
     * @notice Withdraw unreserved tokens from the vault
     * @param token ERC-20 token address
     * @param amount Amount to withdraw
     */
    function withdraw(address token, uint256 amount) external {
        RefundPolicyRegistry.Policy memory policy = registry.getPolicy(msg.sender);
        require(policy.exists, "RefundVault: no policy");
        require(token == policy.token, "RefundVault: wrong token");

        uint256 available = balance[msg.sender] - reserved[msg.sender];
        require(available >= amount, "RefundVault: insufficient available");

        balance[msg.sender] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, token, amount);
    }

    /**
     * @notice Reserve funds for a potential refund (manager only)
     * @param merchant Merchant address
     * @param amount Amount to reserve
     */
    function reserve(address merchant, uint256 amount) external onlyManager {
        uint256 available = balance[merchant] - reserved[merchant];
        require(available >= amount, "RefundVault: insufficient balance");

        reserved[merchant] += amount;
        emit Reserved(merchant, amount);
    }

    /**
     * @notice Unreserve funds (manager only)
     * @param merchant Merchant address
     * @param amount Amount to unreserve
     */
    function unreserve(address merchant, uint256 amount) external onlyManager {
        require(reserved[merchant] >= amount, "RefundVault: insufficient reserved");

        reserved[merchant] -= amount;
        emit Unreserved(merchant, amount);
    }

    /**
     * @notice Pay out a refund (manager only)
     * @param merchant Merchant address
     * @param token Token address
     * @param to Recipient address
     * @param amount Amount to pay
     */
    function payRefund(
        address merchant,
        address token,
        address to,
        uint256 amount
    ) external onlyManager {
        require(reserved[merchant] >= amount, "RefundVault: insufficient reserved");
        require(balance[merchant] >= amount, "RefundVault: insufficient balance");

        reserved[merchant] -= amount;
        balance[merchant] -= amount;

        IERC20(token).safeTransfer(to, amount);
        emit RefundPaid(merchant, to, token, amount);
    }

    /**
     * @notice Get available (unreserved) balance for a merchant
     * @param merchant Merchant address
     * @return Available balance
     */
    function availableBalance(address merchant) external view returns (uint256) {
        return balance[merchant] - reserved[merchant];
    }
}
