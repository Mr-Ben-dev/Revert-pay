# RevertPay

**Refundable crypto payments with tradable refund rights on Polygon** 🔄💰

A decentralized payment system that enables merchants to accept crypto payments while issuing transferable refund rights as NFTs (rNFTs). Buyers can refund their purchases or trade their refund rights on a secondary marketplace.

![Polygon Amoy Testnet](https://img.shields.io/badge/Polygon-Amoy_Testnet-8247E5?style=flat-square&logo=polygon)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)

## 🎯 Features

- **🔄 Refundable Payments**: Merchants can offer refunds with customizable policies
- **🎨 Tradable Refund Rights**: rNFTs can be traded on the built-in marketplace
- **⏱️ Time-Limited Refunds**: Configurable refund windows (e.g., 7 days)
- **💰 Restocking Fees**: Optional fees for processing refunds
- **🔐 Decentralized**: Fully on-chain with no intermediaries
- **🌐 Multi-Chain Ready**: Deployed on Polygon Amoy testnet, ready for mainnet

## 🏗️ Architecture

### Smart Contracts (Solidity 0.8.24)

Located in `contracts/contracts/`:

- **RefundPolicyRegistry** (`0xa4C96647E5718ff6673395b7a5D85632eEFd61db`)  
  Manages refund policies per merchant (token, refund window, restocking fee, auto-approve)

- **RefundVault** (`0xca7aFd9EaDAeDA8d9725eAF03154c6495Cd0b363`)  
  Handles ERC-20 deposits/withdrawals by merchants, tracks reserved balances for active orders

- **RefundRight** (`0xdE7Fd95Bdf716C8bf13FCBdd3b852550297D8D05`)  
  ERC-721 NFT representing refund rights with on-chain metadata and enumeration

- **RevertPayManager** (`0x7dcC3d114cdD3Da59e7A091E5f50E5d27766076D`)  
  Main orchestrator for order creation, refunds, and marketplace listings/purchases

- **MockUSDC** (`0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87`)  
  Demo ERC-20 token for testing (18 decimals, anyone can mint)

### Web Application (Vite + React + TypeScript)

Located in `web/`:

- **Modern UI**: Tailwind CSS, shadcn/ui components, Framer Motion animations
- **Web3 Integration**: wagmi v2 + viem for blockchain interactions
- **State Management**: Zustand for global state
- **Routing**: React Router for navigation
- **Multi-Chain**: Polygon Amoy (testnet) and Polygon Mainnet support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Polygon Amoy testnet tokens (get from [Polygon Faucet](https://faucet.polygon.technology/))

### Installation

```bash
# Clone the repository
git clone https://github.com/Mr-Ben-dev/Revert-pay.git
cd Revert-pay

# Install dependencies
npm install
cd web && npm install
cd ../contracts && npm install
```

### Environment Setup

1. Create `web/.env` file:

```env
VITE_CHAIN_ID=80002
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_ALCHEMY_API_KEY=your_alchemy_key

# Contract addresses (Polygon Amoy)
VITE_MANAGER_80002=0x7dcC3d114cdD3Da59e7A091E5f50E5d27766076D
VITE_POLICY_80002=0xa4C96647E5718ff6673395b7a5D85632eEFd61db
VITE_VAULT_80002=0xca7aFd9EaDAeDA8d9725eAF03154c6495Cd0b363
VITE_RNFT_80002=0xdE7Fd95Bdf716C8bf13FCBdd3b852550297D8D05
VITE_MOCKUSDC_80002=0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87
```

2. Create `contracts/.env` file:

```env
ALCHEMY_API_KEY=your_alchemy_key
PRIVATE_KEY=your_wallet_private_key
POLYGONSCAN_API_KEY=your_polygonscan_key
```

### Running the Web Application

```bash
# Development mode
cd web
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Deploying Contracts

```bash
cd contracts
npx hardhat run scripts/deployWithSetRNFT.js --network amoy
```

## 📖 User Guide

### For Merchants

1. **Create a Refund Policy**

   - Navigate to "Merchant" → "Create Policy"
   - Set refund window (e.g., 7 days), restocking fee (0-100%), and approval mode
   - Approve and confirm the transaction

2. **Deposit Funds**

   - Go to "Merchant Dashboard"
   - Click "Deposit Funds"
   - Enter USDC amount and confirm
   - Funds are now available for refunds

3. **Generate Payment Links**

   - Go to "Merchant" → "Generate Link"
   - Enter order details (amount, memo)
   - Generate QR code or copy the link
   - Share with customers

4. **Manage Vault**
   - View vault balance, reserved funds, and available balance
   - Withdraw unreserved funds anytime

### For Customers

1. **Make a Payment**

   - Open the payment link from merchant
   - Review order details
   - Approve USDC spending
   - Complete payment
   - Receive rNFT (refund right)

2. **View Your rNFTs**

   - Navigate to "My rNFTs"
   - See all your refundable purchases
   - Check expiry dates and refund status

3. **Request a Refund**

   - Open "My rNFTs"
   - Click "Refund" on an active rNFT
   - Confirm transaction
   - Receive refund (minus restocking fee if applicable)

4. **Trade Refund Rights**
   - List your rNFT on the marketplace
   - Set your price
   - Wait for buyers
   - Or browse and buy others' listings

## 🛠️ Technical Details

### Contract Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    RevertPayManager                     │
│  (Orchestrates orders, refunds, marketplace)            │
└─────────────────┬─────────────────┬────────────────────┘
                  │                 │
        ┌─────────▼──────┐  ┌───────▼─────────┐
        │  RefundVault   │  │  RefundRight    │
        │  (Holds USDC)  │  │  (ERC-721 NFT)  │
        └────────────────┘  └─────────────────┘
                  │
        ┌─────────▼──────────────┐
        │ RefundPolicyRegistry   │
        │ (Merchant policies)    │
        └────────────────────────┘
```

### Key Design Decisions

1. **Mutable RNFT Reference**: Added `setRNFT()` function to `RevertPayManager` to break circular dependency during deployment
2. **Reserved Balances**: Vault tracks reserved funds for active orders to prevent double-spending
3. **On-Chain Metadata**: rNFT metadata is generated on-chain using Base64 encoding
4. **ERC721Enumerable**: Enables efficient rNFT discovery for wallet addresses
5. **Auto-Approval**: Merchants can enable instant refunds without manual approval

### Contract Interactions

```solidity
// Create order (customer pays merchant)
Manager.createOrder(merchant, customer, token, amount, memo)
  → Vault.reserve(merchant, refundableAmount)
  → Token.transferFrom(customer, merchant, amount)
  → RNFT.mint(customer, orderData)

// Request refund (customer burns rNFT)
Manager.refund(tokenId)
  → Vault.payRefund(merchant, customer, token, amount)
  → RNFT.burn(tokenId)
  → Vault.unreserve(merchant, amount)

// List rNFT for sale
Manager.list(tokenId, price)
  → Creates marketplace listing

// Buy listed rNFT
Manager.buy(listingId)
  → Token.transferFrom(buyer, seller, price)
  → RNFT.transferFrom(seller, buyer, tokenId)
```

## 🧪 Testing

```bash
cd contracts

# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test
npx hardhat test test/RevertPayManager.test.js
```

## 📝 Development Notes

### Circular Dependency Issue

During development, we encountered a circular dependency between contracts:

- `RefundVault` needs `RevertPayManager` address (set via `setManager()`)
- `RefundRight` needs `RevertPayManager` address (constructor param)
- `RevertPayManager` needs both `RefundVault` and `RefundRight` addresses (constructor params)

**Solution**: Made `RevertPayManager.rnft` mutable and added `setRNFT()` function to allow updating the RNFT reference after deployment.

### Deployment Sequence

1. Deploy `RefundVault`
2. Deploy temp `RefundRight` (with deployer as manager)
3. Deploy `RevertPayManager` (with Vault and temp RNFT)
4. Deploy final `RefundRight` (with Manager as manager)
5. Call `Manager.setRNFT(finalRNFT)`
6. Call `Vault.setManager(Manager)`

## 🔐 Security Considerations

- ✅ ReentrancyGuard on all state-changing functions
- ✅ SafeERC20 for token transfers
- ✅ Access control (only manager can mint rNFTs)
- ✅ Balance checks before transfers
- ✅ Expiry validation on refunds
- ⚠️ **Not audited** - use at your own risk on mainnet

## 🗺️ Roadmap

- [x] Core payment and refund functionality
- [x] rNFT marketplace (list/buy/cancel)
- [x] On-chain metadata
- [x] Web UI with wallet integration
- [ ] Contract tests (comprehensive suite)
- [ ] Multi-token support (beyond USDC)
- [ ] Gasless meta-transactions
- [ ] Subgraph for event indexing
- [ ] Mobile app (React Native)
- [ ] Security audit

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Links

- **Website**: Coming soon
- **Docs**: Coming soon
- **Twitter**: Coming soon
- **Discord**: Coming soon

## 👨‍💻 Author

Built with ❤️ by [@Mr-Ben-dev](https://github.com/Mr-Ben-dev)

---

**⚠️ Disclaimer**: This project is experimental and has not been audited. Use at your own risk. Do not use with real funds on mainnet without proper security review.

The web app will be available at `http://localhost:5173`

### Smart Contracts

```bash
# Compile contracts
npm run contracts:compile

# Run tests
npm run contracts:test

# Clean build artifacts
npm run contracts:clean

# Deploy to Polygon Amoy testnet
npm run deploy:amoy

# Deploy to Polygon mainnet
npm run deploy:polygon

# Verify contracts on Amoy
npm run verify:amoy

# Verify contracts on Polygon
npm run verify:polygon
```

## 📁 Project Structure

```
revert-pay/
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and wagmi config
│   │   ├── store/         # Zustand state management
│   │   └── shared/        # Shared assets and ABIs
│   └── package.json
├── contracts/             # Hardhat project
│   ├── contracts/         # Solidity smart contracts
│   ├── scripts/           # Deployment scripts
│   ├── test/             # Contract tests
│   └── hardhat.config.ts
├── addresses.json         # Deployed contract addresses
├── package.json          # Root package with scripts
└── README.md
```

## 🌐 Supported Networks

- **Polygon Amoy Testnet** (Chain ID: 80002)
- **Polygon Mainnet** (Chain ID: 137)

## 🔑 Environment Setup

Create a `.env` file in the `/web` directory:

```env
VITE_CHAIN_ID=80002
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_ALCHEMY_API_KEY=your_alchemy_key
# Contract addresses will be auto-filled after deployment
```

Create a `.env` file in the `/contracts` directory:

```env
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_key
POLYGONSCAN_API_KEY=your_polygonscan_key
```

## 📖 Key Features

### For Merchants

- Set flexible refund policies (window, restocking fee, auto-approve)
- Bond funds in a vault to back refunds
- Generate payment links
- Dashboard to track orders and rNFTs

### For Buyers

- Receive rNFT on payment
- Refund before expiry from merchant's vault
- Trade rNFT on the marketplace
- View all owned rNFTs

### For Traders

- Browse active rNFTs for sale
- Buy refund rights at fixed prices
- List/cancel your own rNFTs

## 🛠️ Development

### Web Development

The web app uses:

- **Vite** for fast development and building
- **React Router** for navigation
- **wagmi** for Web3 interactions
- **Zustand** for state management
- **shadcn/ui** for beautiful components

### Contract Development

- Solidity 0.8.24
- Hardhat for compilation, testing, and deployment
- OpenZeppelin contracts for security
- Comprehensive test coverage

## 📝 License

MIT
