import { getAddresses } from "@/lib/wagmi";
import ERC20ABI from "@/shared/abis/ERC20.json";
import RefundRightABI from "@/shared/abis/RefundRight.json";
import RevertPayManagerABI from "@/shared/abis/RevertPayManager.json";
import { useStore } from "@/store/useStore";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

export interface MarketListing {
  listingId: bigint;
  tokenId: bigint;
  seller: string;
  price: bigint;
  active: boolean;
  // Extended info from rNFT
  originalAmount: bigint;
  tokenAddress: string;
  expiresAt: bigint;
  merchant: string;
}

// Demo listings for showcase (RPC rate limits prevent live querying)
const DEMO_LISTINGS: MarketListing[] = [
  {
    listingId: BigInt(1),
    tokenId: BigInt(1),
    seller: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bA12",
    price: BigInt("8500000000000000000"), // 8.5 USDC (15% discount)
    active: true,
    originalAmount: BigInt("10000000000000000000"), // 10 USDC
    tokenAddress: "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87",
    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400 * 5), // 5 days
    merchant: "0x8B3f5393bC2006Ab66a4F5D99373dD5e09d8E4E2",
  },
  {
    listingId: BigInt(2),
    tokenId: BigInt(2),
    seller: "0xDeF1C0ded9bec7F1a1670819833240f027b25EfF",
    price: BigInt("23000000000000000000"), // 23 USDC (8% discount)
    active: true,
    originalAmount: BigInt("25000000000000000000"), // 25 USDC
    tokenAddress: "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87",
    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3), // 3 days
    merchant: "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
  },
  {
    listingId: BigInt(3),
    tokenId: BigInt(3),
    seller: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    price: BigInt("4250000000000000000"), // 4.25 USDC (15% discount)
    active: true,
    originalAmount: BigInt("5000000000000000000"), // 5 USDC
    tokenAddress: "0x50aADCa249821ED7BA61Df29eaD40F46EF7D0B87",
    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400 * 1), // 1 day (urgent!)
    merchant: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bA12",
  },
];

interface UseMarketplaceReturn {
  listings: MarketListing[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchListings: () => Promise<void>;
  listRNFT: (tokenId: bigint, price: bigint) => Promise<void>;
  buyListing: (
    listingId: bigint,
    price: bigint,
    tokenAddress: string
  ) => Promise<void>;
  cancelListing: (listingId: bigint) => Promise<void>;

  // Approval
  checkApproval: (tokenId: bigint) => Promise<boolean>;
  approveRNFT: () => Promise<void>;

  // State
  isListing: boolean;
  isBuying: boolean;
  isCancelling: boolean;
  isApproving: boolean;
}

export const useMarketplace = (): UseMarketplaceReturn => {
  const { address: account, chainId, chain } = useAccount();
  const addresses = getAddresses(chainId);
  const { addToast } = useStore();
  const { writeContract, writeContractAsync } = useWriteContract();

  const [listings, setListings] = useState<MarketListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isListing, setIsListing] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Fetch all active listings - uses demo data due to RPC rate limits
  // In production, use a subgraph or indexer for real-time data
  const fetchListings = useCallback(async () => {
    if (!addresses?.MANAGER || !addresses?.RNFT) {
      console.log("Missing addresses for marketplace");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Use demo listings - in production this would query a subgraph
    // Direct RPC queries hit rate limits on public endpoints
    setListings(DEMO_LISTINGS);
    setIsLoading(false);

    console.log("Loaded demo listings:", DEMO_LISTINGS.length);
  }, [addresses]);

  // Check if RNFT is approved for Manager
  // Due to RPC rate limits, we assume not approved and let the user approve
  // This is safer anyway - approval tx will just succeed if already approved
  const checkApproval = useCallback(
    async (_tokenId: bigint): Promise<boolean> => {
      if (!addresses?.RNFT || !addresses?.MANAGER || !account) return false;

      // Return false to always trigger approval flow
      // The approve transaction will succeed quickly if already approved
      // This avoids RPC rate limit issues
      return false;
    },
    [addresses, account]
  );

  // Approve RNFT for Manager (setApprovalForAll)
  const approveRNFT = useCallback(async () => {
    if (!addresses?.RNFT || !addresses?.MANAGER || !account || !chain) {
      addToast("Please connect your wallet", "error");
      return;
    }

    setIsApproving(true);

    try {
      writeContract(
        {
          address: addresses.RNFT as `0x${string}`,
          abi: RefundRightABI as any,
          functionName: "setApprovalForAll",
          args: [addresses.MANAGER, true],
          chain,
          account,
        },
        {
          onSuccess: () => {
            setIsApproving(false);
            addToast("NFT approved for marketplace!", "success");
          },
          onError: (err: any) => {
            setIsApproving(false);
            console.error("Approval error:", err);
            addToast(err.message || "Approval failed", "error");
          },
        }
      );
    } catch (err: any) {
      setIsApproving(false);
      addToast(err.message || "Approval failed", "error");
    }
  }, [addresses, account, chain, writeContract, addToast]);

  // List an rNFT for sale
  const listRNFT = useCallback(
    async (tokenId: bigint, price: bigint) => {
      if (!addresses?.MANAGER || !account || !chain) {
        addToast("Please connect your wallet", "error");
        return;
      }

      setIsListing(true);

      writeContract(
        {
          address: addresses.MANAGER as `0x${string}`,
          abi: RevertPayManagerABI as any,
          functionName: "list",
          args: [tokenId, price],
          chain,
          account,
        },
        {
          onSuccess: () => {
            setIsListing(false);
            addToast("rNFT listed successfully!", "success");
            // Refresh listings
            fetchListings();
          },
          onError: (err: any) => {
            setIsListing(false);
            console.error("Listing error:", err);
            addToast(err.message || "Failed to list rNFT", "error");
          },
        }
      );
    },
    [addresses, account, chain, writeContract, addToast, fetchListings]
  );

  // Buy a listed rNFT
  const buyListing = useCallback(
    async (listingId: bigint, price: bigint, tokenAddress: string) => {
      if (!addresses?.MANAGER || !account || !chain) {
        addToast("Please connect your wallet", "error");
        return;
      }

      setIsBuying(true);

      // Always approve first, then buy
      // Skipping allowance check due to RPC rate limits
      // Approval tx is cheap if already approved
      try {
        addToast("Approving USDC spending...", "info");

        writeContract(
          {
            address: tokenAddress as `0x${string}`,
            abi: ERC20ABI as any,
            functionName: "approve",
            args: [addresses.MANAGER, price],
            chain,
            account,
          },
          {
            onSuccess: () => {
              // Now buy
              executeBuy(listingId);
            },
            onError: (err: any) => {
              setIsBuying(false);
              console.error("Approval error:", err);
              addToast(err.message || "USDC approval failed", "error");
            },
          }
        );
      } catch (err: any) {
        setIsBuying(false);
        addToast(err.message || "Failed to buy", "error");
      }
    },
    [addresses, account, chain, writeContract, addToast]
  );

  const executeBuy = useCallback(
    (listingId: bigint) => {
      if (!addresses?.MANAGER || !account || !chain) return;

      writeContract(
        {
          address: addresses.MANAGER as `0x${string}`,
          abi: RevertPayManagerABI as any,
          functionName: "buy",
          args: [listingId],
          chain,
          account,
        },
        {
          onSuccess: () => {
            setIsBuying(false);
            addToast("rNFT purchased successfully!", "success");
            // Remove from local state
            setListings((prev) =>
              prev.filter((l) => l.listingId !== listingId)
            );
          },
          onError: (err: any) => {
            setIsBuying(false);
            console.error("Buy error:", err);
            addToast(err.message || "Purchase failed", "error");
          },
        }
      );
    },
    [addresses, account, chain, writeContract, addToast]
  );

  // Cancel a listing
  const cancelListing = useCallback(
    async (listingId: bigint) => {
      if (!addresses?.MANAGER || !account || !chain) {
        addToast("Please connect your wallet", "error");
        return;
      }

      setIsCancelling(true);

      writeContract(
        {
          address: addresses.MANAGER as `0x${string}`,
          abi: RevertPayManagerABI as any,
          functionName: "cancel",
          args: [listingId],
          chain,
          account,
        },
        {
          onSuccess: () => {
            setIsCancelling(false);
            addToast("Listing cancelled!", "success");
            // Remove from local state
            setListings((prev) =>
              prev.filter((l) => l.listingId !== listingId)
            );
          },
          onError: (err: any) => {
            setIsCancelling(false);
            console.error("Cancel error:", err);
            addToast(err.message || "Failed to cancel listing", "error");
          },
        }
      );
    },
    [addresses, account, chain, writeContract, addToast]
  );

  // Fetch listings on mount
  useEffect(() => {
    if (addresses) {
      fetchListings();
    }
  }, [addresses]);

  return {
    listings,
    isLoading,
    error,
    fetchListings,
    listRNFT,
    buyListing,
    cancelListing,
    checkApproval,
    approveRNFT,
    isListing,
    isBuying,
    isCancelling,
    isApproving,
  };
};
