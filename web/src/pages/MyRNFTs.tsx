import { GradientButton } from "@/components/shared/GradientButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { RNFTCard } from "@/components/shared/RNFTCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAddresses } from "@/lib/wagmi";
import RefundRightABI from "@/shared/abis/RefundRight.json";
import RevertPayManagerABI from "@/shared/abis/RevertPayManager.json";
import { useStore } from "@/store/useStore";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPublicClient, formatEther, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

interface RNFTData {
  tokenId: bigint;
  orderId: string; // bytes32 from contract
  merchant: string;
  customer: string;
  token: string;
  amount: bigint;
  expiresAt: bigint;
  canRefund: boolean;
}

const MyRNFTs = () => {
  const { address: account, chainId, chain } = useAccount();
  const addresses = getAddresses(chainId);
  const { addToast } = useStore();
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);
  const [listPrice, setListPrice] = useState("");
  const [rnfts, setRnfts] = useState<RNFTData[]>([]);
  const [isRefunding, setIsRefunding] = useState(false);

  const { writeContract } = useWriteContract();

  // Read the total number of NFTs owned by the user
  const { data: balance } = useReadContract({
    address: addresses?.RNFT as `0x${string}`,
    abi: RefundRightABI as any,
    functionName: "balanceOf",
    args: [account],
    query: {
      enabled: !!account && !!addresses?.RNFT,
    },
  });

  // Fetch all token IDs and their data
  useEffect(() => {
    const fetchRNFTs = async () => {
      console.log("Fetching rNFTs...");
      console.log("Balance:", balance);
      console.log("Account:", account);
      console.log("Addresses:", addresses);

      if (!balance || !account || !addresses || Number(balance) === 0) {
        console.log("No rNFTs to fetch");
        setRnfts([]);
        return;
      }

      try {
        const tokenCount = Number(balance);
        const nfts: RNFTData[] = [];

        // Create a public client for reading
        const client = createPublicClient({
          chain: polygonAmoy,
          transport: http(
            `https://polygon-amoy.g.alchemy.com/v2/jYtq4mLJ0kFeTg0uLUJ4M`
          ),
        });

        // Fetch each token
        for (let i = 0; i < tokenCount; i++) {
          try {
            // Get token ID at index i
            const tokenId = (await client.readContract({
              address: addresses.RNFT as `0x${string}`,
              abi: RefundRightABI as any,
              functionName: "tokenOfOwnerByIndex",
              args: [account, BigInt(i)],
            } as any)) as bigint;

            // Get token info
            const info: any = await client.readContract({
              address: addresses.RNFT as `0x${string}`,
              abi: RefundRightABI as any,
              functionName: "info",
              args: [tokenId],
            } as any);

            console.log("Token info:", info);

            // info is returned as an array: [merchant, token, amount, expiry, orderId, feeBpsAtMint]
            const [merchant, token, amount, expiry, orderId, feeBpsAtMint] =
              info;

            // Check if refund is available (not expired and token still exists)
            const now = Math.floor(Date.now() / 1000);
            const canRefund = Number(expiry) > now;

            nfts.push({
              tokenId: tokenId as bigint,
              orderId: orderId as string,
              merchant: merchant as string,
              customer: account,
              token: token as string,
              amount: amount as bigint,
              expiresAt: expiry as bigint,
              canRefund,
            });
          } catch (error) {
            console.error(`Error fetching token at index ${i}:`, error);
          }
        }

        setRnfts(nfts);
      } catch (error) {
        console.error("Error fetching rNFTs:", error);
        addToast("Failed to load rNFTs", "error");
      }
    };

    fetchRNFTs();
  }, [balance, account, addresses]);

  const handleRefund = async (tokenId: bigint) => {
    if (!account) {
      addToast("Please connect your wallet", "error");
      return;
    }

    setIsRefunding(true);

    writeContract(
      {
        address: addresses?.MANAGER as `0x${string}`,
        abi: RevertPayManagerABI as any,
        functionName: "refund",
        args: [tokenId],
        chain,
        account: account!,
      },
      {
        onSuccess: () => {
          setIsRefunding(false);
          addToast("Refund processed successfully!", "success");

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });

          // Remove the refunded NFT from the list immediately
          setRnfts((prevRnfts) =>
            prevRnfts.filter((nft) => nft.tokenId !== tokenId)
          );
        },
        onError: (error: any) => {
          setIsRefunding(false);
          console.error("Refund error:", error);
          addToast(error.message || "Refund failed", "error");
        },
      }
    );
  };

  const handleListForSale = (tokenId: bigint) => {
    setSelectedTokenId(tokenId);
    setListDialogOpen(true);
  };

  const handleConfirmListing = async () => {
    if (!selectedTokenId || !account) return;

    const priceInWei = BigInt(Math.floor(Number(listPrice) * 1e18));

    writeContract(
      {
        address: addresses?.MANAGER as `0x${string}`,
        abi: RevertPayManagerABI as any,
        functionName: "list",
        args: [selectedTokenId, priceInWei],
        chain,
        account: account!,
      },
      {
        onSuccess: () => {
          addToast("rNFT listed for sale successfully", "success");
          setListDialogOpen(false);
          setListPrice("");
          setSelectedTokenId(null);
          setTimeout(() => window.location.reload(), 2000);
        },
        onError: (error: any) => {
          console.error("Listing error:", error);
          addToast(error.message || "Failed to list rNFT", "error");
        },
      }
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <PageHeader
          title="My rNFTs"
          subtitle="Manage your refundable NFTs - refund or trade them"
        />

        {rnfts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-12 text-center"
          >
            <p className="text-lg text-muted-foreground">
              {balance === undefined
                ? "Loading your rNFTs..."
                : "You don't have any rNFTs yet. Make a purchase to receive one!"}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rnfts.map((rnft, index) => (
              <motion.div
                key={rnft.tokenId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RNFTCard
                  tokenId={rnft.tokenId.toString()}
                  tokenAddress={rnft.token}
                  amount={formatEther(rnft.amount)}
                  expiresAt={new Date(Number(rnft.expiresAt) * 1000)}
                  canRefund={rnft.canRefund}
                  status={rnft.canRefund ? "active" : "expired"}
                  onRefund={() => handleRefund(rnft.tokenId)}
                  onList={() => handleListForSale(rnft.tokenId)}
                />
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
          <DialogContent className="glass-card border-border">
            <DialogHeader>
              <DialogTitle>List rNFT for Sale</DialogTitle>
              <DialogDescription>
                Set a price for your rNFT. Buyers can purchase it at a discount.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="price">Sale Price (USDC)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="mt-2 bg-input border-border"
                />
              </div>
              <GradientButton onClick={handleConfirmListing} className="w-full">
                List for Sale
              </GradientButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyRNFTs;
