import { create } from 'zustand';

interface Policy {
  id: string;
  tokenAddress: string;
  refundWindowHours: number;
  restockingFeeBps: number;
  autoApprove: boolean;
  createdAt: Date;
}

interface RNFT {
  id: string;
  tokenId: string;
  amount: string;
  tokenAddress: string;
  expiresAt: Date;
  canRefund: boolean;
  status: 'active' | 'refunded' | 'expired';
  listedForSale?: boolean;
  salePrice?: string;
}

interface MarketListing {
  id: string;
  rnftId: string;
  seller: string;
  price: string;
  tokenAddress: string;
  amount: string;
  expiresAt: Date;
}

interface Store {
  // User state
  isConnected: boolean;
  address: string | null;
  setConnected: (connected: boolean, address?: string) => void;

  // Merchant state
  policies: Policy[];
  addPolicy: (policy: Policy) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;

  // User rNFTs
  rnfts: RNFT[];
  setRNFTs: (rnfts: RNFT[]) => void;
  updateRNFT: (id: string, updates: Partial<RNFT>) => void;

  // Market
  marketListings: MarketListing[];
  setMarketListings: (listings: MarketListing[]) => void;
  addListing: (listing: MarketListing) => void;
  removeListing: (id: string) => void;

  // Toasts
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useStore = create<Store>((set) => ({
  isConnected: false,
  address: null,
  setConnected: (connected, address) =>
    set({ isConnected: connected, address: address || null }),

  policies: [],
  addPolicy: (policy) =>
    set((state) => ({ policies: [...state.policies, policy] })),
  updatePolicy: (id, updates) =>
    set((state) => ({
      policies: state.policies.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  rnfts: [
    // Mock data
    {
      id: '1',
      tokenId: '42',
      amount: '100',
      tokenAddress: '0x1234...5678',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      canRefund: true,
      status: 'active',
    },
    {
      id: '2',
      tokenId: '43',
      amount: '250',
      tokenAddress: '0xabcd...efgh',
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      canRefund: true,
      status: 'active',
    },
  ],
  setRNFTs: (rnfts) => set({ rnfts }),
  updateRNFT: (id, updates) =>
    set((state) => ({
      rnfts: state.rnfts.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  marketListings: [
    // Mock data
    {
      id: '1',
      rnftId: '100',
      seller: '0xdead...beef',
      price: '90',
      tokenAddress: '0x1234...5678',
      amount: '100',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      rnftId: '101',
      seller: '0xcafe...babe',
      price: '225',
      tokenAddress: '0xabcd...efgh',
      amount: '250',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  ],
  setMarketListings: (listings) => set({ marketListings: listings }),
  addListing: (listing) =>
    set((state) => ({
      marketListings: [...state.marketListings, listing],
    })),
  removeListing: (id) =>
    set((state) => ({
      marketListings: state.marketListings.filter((l) => l.id !== id),
    })),

  toasts: [],
  addToast: (message, type) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Math.random().toString(), message, type },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
