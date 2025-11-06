// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RefundPolicyRegistry.sol";
import "./RefundVault.sol";
import "./RefundRight.sol";

/**
 * @title RevertPayManager
 * @notice Main contract orchestrating refundable payments and marketplace
 * @dev Handles order creation, refunds, and rNFT marketplace
 */
contract RevertPayManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State
    RefundPolicyRegistry public immutable policyRegistry;
    RefundVault public immutable vault;
    RefundRight public rnft; // Changed from immutable to allow updates

    address public admin; // Add admin for access control

    // Marketplace
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    uint256 private _nextListingId;
    mapping(uint256 => Listing) public listings;

    // Events
    event Purchase(
        bytes32 indexed orderId,
        address indexed merchant,
        address indexed buyer,
        address token,
        uint256 amount,
        uint256 tokenId
    );

    event Refunded(
        uint256 indexed tokenId,
        address indexed to,
        uint256 netAmount
    );

    event Listed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event ListingCancelled(uint256 indexed listingId);

    event Bought(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    /**
     * @notice Constructor
     * @param _policyRegistry Policy registry address
     * @param _vault Vault address
     * @param _rnft rNFT address
     */
    constructor(
        address _policyRegistry,
        address _vault,
        address _rnft
    ) {
        require(_policyRegistry != address(0), "RevertPayManager: zero policy");
        require(_vault != address(0), "RevertPayManager: zero vault");
        require(_rnft != address(0), "RevertPayManager: zero rnft");

        policyRegistry = RefundPolicyRegistry(_policyRegistry);
        vault = RefundVault(_vault);
        rnft = RefundRight(_rnft);
        admin = msg.sender; // Set deployer as admin

        _nextListingId = 1;
    }

    /**
     * @notice Set RNFT address (admin only)
     * @param _rnft New RNFT address
     */
    function setRNFT(address _rnft) external {
        require(msg.sender == admin, "RevertPayManager: only admin");
        require(_rnft != address(0), "RevertPayManager: zero rnft");
        rnft = RefundRight(_rnft);
    }

    /**
     * @notice Create a new refundable order
     * @param merchant Merchant address
     * @param buyer Buyer address
     * @param token Payment token address
     * @param amount Payment amount
     * @param memo Order memo/description
     * @return tokenId The minted rNFT token ID
     */
    function createOrder(
        address merchant,
        address buyer,
        address token,
        uint256 amount,
        string calldata memo
    ) external nonReentrant returns (uint256) {
        // Get and validate policy
        RefundPolicyRegistry.Policy memory policy = policyRegistry.getPolicy(merchant);
        require(policy.exists, "RevertPayManager: no policy");
        require(token == policy.token, "RevertPayManager: wrong token");
        require(amount > 0, "RevertPayManager: zero amount");

        // Calculate fee and refundable amount
        uint256 feeAmount = (amount * policy.restockingFeeBps) / 10000;
        uint256 refundableAmount = amount - feeAmount;

        // Check vault has enough free balance
        uint256 available = vault.availableBalance(merchant);
        require(available >= refundableAmount, "RevertPayManager: insufficient vault");

        // Reserve funds in vault
        vault.reserve(merchant, refundableAmount);

        // Transfer payment from buyer to merchant
        IERC20(token).safeTransferFrom(msg.sender, merchant, amount);

        // Generate order ID
        bytes32 orderId = keccak256(
            abi.encode(merchant, buyer, token, amount, block.timestamp, memo)
        );

        // Calculate expiry
        uint64 expiry = uint64(block.timestamp) + policy.refundWindow;

        // Mint rNFT to buyer
        uint256 tokenId = rnft.mint(
            buyer,
            orderId,
            merchant,
            token,
            refundableAmount,
            expiry,
            policy.restockingFeeBps
        );

        emit Purchase(orderId, merchant, buyer, token, amount, tokenId);
        return tokenId;
    }

    /**
     * @notice Refund an rNFT before expiry
     * @param tokenId rNFT token ID
     */
    function refund(uint256 tokenId) external nonReentrant {
        // Verify ownership or approval
        address owner = rnft.ownerOf(tokenId);
        require(
            msg.sender == owner || rnft.isApprovedForAll(owner, msg.sender) || rnft.getApproved(tokenId) == msg.sender,
            "RevertPayManager: not authorized"
        );

        // Get rNFT info
        (
            address merchant,
            address token,
            uint256 amount,
            uint64 expiry,
            ,
            uint16 feeBpsAtMint
        ) = rnft.info(tokenId);

        // Check expiry
        require(block.timestamp <= expiry, "RevertPayManager: expired");

        // Calculate net refund amount
        uint256 feeAmount = (amount * feeBpsAtMint) / 10000;
        uint256 netAmount = amount - feeAmount;

        // Burn the rNFT
        rnft.burn(tokenId);

        // Pay refund (payRefund handles unreserving internally)
        vault.payRefund(merchant, token, msg.sender, netAmount);

        emit Refunded(tokenId, msg.sender, netAmount);
    }

    /**
     * @notice List an rNFT for sale
     * @param tokenId rNFT token ID
     * @param price Sale price
     * @return listingId The created listing ID
     */
    function list(uint256 tokenId, uint256 price) external returns (uint256) {
        require(rnft.ownerOf(tokenId) == msg.sender, "RevertPayManager: not owner");
        require(price > 0, "RevertPayManager: zero price");
        
        // Check approval
        require(
            rnft.isApprovedForAll(msg.sender, address(this)) || rnft.getApproved(tokenId) == address(this),
            "RevertPayManager: not approved"
        );

        uint256 listingId = _nextListingId++;

        listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });

        emit Listed(listingId, tokenId, msg.sender, price);
        return listingId;
    }

    /**
     * @notice Cancel a listing
     * @param listingId Listing ID
     */
    function cancel(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "RevertPayManager: not active");
        require(listing.seller == msg.sender, "RevertPayManager: not seller");

        listing.active = false;
        emit ListingCancelled(listingId);
    }

    /**
     * @notice Buy an rNFT from a listing
     * @param listingId Listing ID
     */
    function buy(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "RevertPayManager: not active");

        address seller = listing.seller;
        uint256 tokenId = listing.tokenId;
        uint256 price = listing.price;

        // Verify seller still owns the token
        require(rnft.ownerOf(tokenId) == seller, "RevertPayManager: seller not owner");

        // Get payment token from rNFT info
        (, address token, , , , ) = rnft.info(tokenId);

        // Mark as inactive
        listing.active = false;

        // Transfer payment from buyer to seller
        IERC20(token).safeTransferFrom(msg.sender, seller, price);

        // Transfer rNFT from seller to buyer
        rnft.safeTransferFrom(seller, msg.sender, tokenId);

        emit Bought(listingId, tokenId, msg.sender, price);
    }

    /**
     * @notice Get listing details
     * @param listingId Listing ID
     * @return Listing struct
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
}
