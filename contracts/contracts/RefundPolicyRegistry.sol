// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title RefundPolicyRegistry
 * @notice Registry for merchant refund policies
 * @dev Each merchant can set one policy per address
 */
contract RefundPolicyRegistry {
    struct Policy {
        address token;           // ERC-20 token address for refunds
        uint64 refundWindow;     // Time window for refunds (seconds)
        uint16 restockingFeeBps; // Restocking fee in basis points (0-1000 = 0-10%)
        bool autoApprove;        // Whether refunds are auto-approved
        bool exists;             // Flag to check if policy exists
    }

    // Merchant address => Policy
    mapping(address => Policy) public policies;

    // Events
    event PolicyUpdated(
        address indexed merchant,
        address token,
        uint64 refundWindow,
        uint16 restockingFeeBps,
        bool autoApprove
    );

    /**
     * @notice Set or update refund policy for the caller
     * @param token ERC-20 token address (cannot be zero address)
     * @param refundWindow Time window in seconds (3600 to 30 days)
     * @param restockingFeeBps Fee in basis points (max 1000 = 10%)
     * @param autoApprove Whether to auto-approve refunds
     */
    function setPolicy(
        address token,
        uint64 refundWindow,
        uint16 restockingFeeBps,
        bool autoApprove
    ) external {
        require(token != address(0), "RefundPolicyRegistry: zero token");
        require(restockingFeeBps <= 1000, "RefundPolicyRegistry: fee too high");
        require(
            refundWindow >= 3600 && refundWindow <= 30 days,
            "RefundPolicyRegistry: invalid window"
        );

        policies[msg.sender] = Policy({
            token: token,
            refundWindow: refundWindow,
            restockingFeeBps: restockingFeeBps,
            autoApprove: autoApprove,
            exists: true
        });

        emit PolicyUpdated(
            msg.sender,
            token,
            refundWindow,
            restockingFeeBps,
            autoApprove
        );
    }

    /**
     * @notice Get policy for a merchant
     * @param merchant Merchant address
     * @return Policy struct
     */
    function getPolicy(address merchant) external view returns (Policy memory) {
        return policies[merchant];
    }
}
