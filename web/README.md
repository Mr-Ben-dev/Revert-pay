# RevertPay - Web3 Refund Protocol

A production-ready, animated Web3 application for refundable payments built with React, TypeScript, and Three.js.

## Features

- 🌑 **Cinematic Dark Theme** - Glass morphism, gradient accents, smooth animations
- 🎨 **Framer Motion** - Page transitions and micro-interactions
- 🌊 **3D Hero** - Animated gradient blob with @react-three/fiber
- 💎 **rNFT System** - Refundable NFTs with countdown timers
- 🏪 **Marketplace** - Trade rNFTs at a discount
- 🔐 **Web3 Ready** - Wagmi skeleton, mock wallet connection
- 📱 **Mobile First** - Fully responsive design
- ⚡ **Performance** - Optimized with Vite, React 18, TypeScript

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Animation**: Framer Motion, @react-three/fiber
- **State**: Zustand
- **Web3**: Wagmi (placeholder), Viem
- **Data**: @tanstack/react-query
- **Forms**: React Hook Form, Zod validation

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── shared/          # Reusable components
│   │   ├── AnimatedOrb.tsx
│   │   ├── GradientButton.tsx
│   │   ├── StatCard.tsx
│   │   ├── RNFTCard.tsx
│   │   ├── MarketCard.tsx
│   │   ├── PaymentQR.tsx
│   │   ├── PageHeader.tsx
│   │   └── Navbar.tsx
│   └── ui/              # shadcn components
├── pages/
│   ├── Home.tsx
│   ├── MerchantDashboard.tsx
│   ├── CreatePolicy.tsx
│   ├── GenerateLink.tsx
│   ├── Checkout.tsx
│   ├── MyRNFTs.tsx
│   ├── Market.tsx
│   ├── Docs.tsx
│   └── Legal.tsx
├── store/
│   └── useStore.ts      # Zustand global state
├── hooks/
│   ├── useWallet.ts
│   └── useChain.ts
├── lib/
│   └── wagmi.ts         # Web3 config (placeholder)
└── shared/
    └── abis/            # Contract ABIs (empty)
```

## Routes

- `/` - Home with animated hero
- `/merchant` - Merchant dashboard
- `/merchant/policy` - Create refund policy
- `/merchant/link` - Generate payment links
- `/pay/:linkId` - Checkout page
- `/me` - User rNFT portfolio
- `/market` - rNFT marketplace
- `/docs` - Documentation
- `/legal` - Terms & privacy

## Connecting Real Contracts

### 1. Add Contract ABIs

Place your contract ABIs in `src/shared/abis/`:

```
src/shared/abis/
├── RevertPayFactory.json
├── RNFTMarketplace.json
└── RefundPolicy.json
```

### 2. Update addresses.json

Create `src/shared/addresses.json`:

```json
{
  "1": {
    "RevertPayFactory": "0x...",
    "RNFTMarketplace": "0x..."
  },
  "5": {
    "RevertPayFactory": "0x...",
    "RNFTMarketplace": "0x..."
  }
}
```

### 3. Configure Wagmi

Update `src/lib/wagmi.ts` with your chains and providers:

```typescript
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
```

### 4. Replace Mock Functions

Search for `mockTransaction` and `mockConnectWallet` calls and replace with real contract interactions using wagmi hooks.

## Design System

All colors, gradients, and animations are defined in:
- `src/index.css` - CSS variables
- `tailwind.config.ts` - Tailwind theme

**Key Design Tokens:**
- Primary: Cyan (#00d4ff)
- Secondary: Purple (#a855f7)
- Background: Deep blue-black
- Glass cards with backdrop blur
- Animated gradients on hover

## Performance

- Lazy load 3D components
- Optimize images with proper formats
- Code splitting by route
- Tree-shakable icon imports (lucide-react)
- Minimal bundle size with Vite

## Deployment

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

Deploy `dist/` folder to:
- Vercel
- Netlify
- IPFS (for decentralized hosting)
- Any static hosting service

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines first.

---

Built with ❤️ using Lovable
