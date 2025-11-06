// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title RefundRight
 * @notice ERC-721 NFT representing a refund right (rNFT)
 * @dev On-chain metadata with base64-encoded JSON
 */
contract RefundRight is ERC721Enumerable {
    using Strings for uint256;
    using Strings for address;

    struct RNFT {
        address merchant;      // Merchant who received payment
        address token;         // ERC-20 token for refund
        uint256 amount;        // Refundable amount
        uint64 expiry;         // Expiry timestamp
        bytes32 orderId;       // Unique order identifier
        uint16 feeBpsAtMint;   // Fee in basis points at mint time
    }

    // State
    address public manager;
    uint256 private _nextTokenId;
    mapping(uint256 => RNFT) public info;

    // Events
    event Minted(
        uint256 indexed tokenId,
        address indexed to,
        address indexed merchant,
        bytes32 orderId,
        uint256 amount,
        uint64 expiry
    );
    event Burned(uint256 indexed tokenId);

    // Modifiers
    modifier onlyManager() {
        require(msg.sender == manager, "RefundRight: only manager");
        _;
    }

    /**
     * @notice Constructor
     * @param _manager Manager contract address
     */
    constructor(address _manager) ERC721("RevertPay Refund Right", "rNFT") {
        require(_manager != address(0), "RefundRight: zero manager");
        manager = _manager;
        _nextTokenId = 1; // Start token IDs at 1
    }

    /**
     * @notice Mint a new rNFT (manager only)
     * @param to Recipient address
     * @param orderId Unique order ID
     * @param merchant Merchant address
     * @param token Token address
     * @param amount Refundable amount
     * @param expiry Expiry timestamp
     * @param feeBpsAtMint Fee in basis points
     * @return tokenId The minted token ID
     */
    function mint(
        address to,
        bytes32 orderId,
        address merchant,
        address token,
        uint256 amount,
        uint64 expiry,
        uint16 feeBpsAtMint
    ) external onlyManager returns (uint256) {
        require(to != address(0), "RefundRight: zero address");
        require(merchant != address(0), "RefundRight: zero merchant");
        require(token != address(0), "RefundRight: zero token");
        require(amount > 0, "RefundRight: zero amount");
        require(expiry > block.timestamp, "RefundRight: expired");

        uint256 tokenId = _nextTokenId++;

        info[tokenId] = RNFT({
            merchant: merchant,
            token: token,
            amount: amount,
            expiry: expiry,
            orderId: orderId,
            feeBpsAtMint: feeBpsAtMint
        });

        _safeMint(to, tokenId);

        emit Minted(tokenId, to, merchant, orderId, amount, expiry);
        return tokenId;
    }

    /**
     * @notice Burn an rNFT (manager only)
     * @param tokenId Token ID to burn
     */
    function burn(uint256 tokenId) external onlyManager {
        require(_ownerOf(tokenId) != address(0), "RefundRight: nonexistent token");
        
        delete info[tokenId];
        _burn(tokenId);

        emit Burned(tokenId);
    }

    /**
     * @notice Generate on-chain JSON metadata
     * @param tokenId Token ID
     * @return Base64-encoded JSON metadata URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "RefundRight: nonexistent token");

        RNFT memory rnft = info[tokenId];
        
        // Build JSON in parts to avoid stack too deep
        bytes memory part1 = abi.encodePacked(
            '{"name":"rNFT #',
            tokenId.toString(),
            '","description":"RevertPay Refund Right - Tradable refund token","attributes":[',
            '{"trait_type":"Merchant","value":"',
            _toHexString(rnft.merchant),
            '"},{"trait_type":"Token","value":"',
            _toHexString(rnft.token),
            '"}'
        );
        
        bytes memory part2 = abi.encodePacked(
            ',{"trait_type":"Amount","value":"',
            rnft.amount.toString(),
            '"},{"trait_type":"Expiry","value":"',
            uint256(rnft.expiry).toString(),
            '"},{"trait_type":"Fee BPS","value":"',
            uint256(rnft.feeBpsAtMint).toString(),
            '"}]}'
        );

        string memory json = string(abi.encodePacked(part1, part2));

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }

    /**
     * @notice Convert address to hex string
     */
    function _toHexString(address addr) private pure returns (string memory) {
        bytes memory buffer = new bytes(42);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint160(addr) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            buffer[2 + 2 * i] = _char(hi);
            buffer[3 + 2 * i] = _char(lo);
        }
        return string(buffer);
    }

    function _char(bytes1 b) private pure returns (bytes1) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
