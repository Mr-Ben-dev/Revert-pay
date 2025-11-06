// Web3 configuration with Wagmi + Viem
import { injected, walletConnect } from "@wagmi/connectors";
import { polygon, polygonAmoy } from "viem/chains";
import { createConfig, http } from "wagmi";

const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY as string;
const WC_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;

export const chains = [polygonAmoy, polygon] as const;

export const config = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({
      projectId: WC_PROJECT_ID,
      metadata: {
        name: "RevertPay",
        description: "Refundable crypto payments with tradable refund rights",
        url: "https://revertpay.app",
        icons: [],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [polygonAmoy.id]: http(
      `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_KEY}`
    ),
    [polygon.id]: http(
      `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
    ),
  },
});

// Contract addresses mapped by chain ID
export const ADDRESSES = {
  80002: {
    MANAGER: import.meta.env.VITE_MANAGER_80002,
    POLICY: import.meta.env.VITE_POLICY_80002,
    VAULT: import.meta.env.VITE_VAULT_80002,
    RNFT: import.meta.env.VITE_RNFT_80002,
    MOCKUSDC: import.meta.env.VITE_MOCKUSDC_80002,
  },
  137: {
    MANAGER: import.meta.env.VITE_MANAGER_137,
    POLICY: import.meta.env.VITE_POLICY_137,
    VAULT: import.meta.env.VITE_VAULT_137,
    RNFT: import.meta.env.VITE_RNFT_137,
    MOCKUSDC: import.meta.env.VITE_MOCKUSDC_137,
  },
} as const;

/**
 * Helper to get contract addresses for a specific chain
 */
export function getAddresses(chainId?: number) {
  const id = (chainId || 80002) as keyof typeof ADDRESSES;
  return ADDRESSES[id] || ADDRESSES[80002]; // Fallback to Amoy
}
