import { GradientButton } from "@/components/shared/GradientButton";
import { MarketListingCard } from "@/components/shared/MarketListingCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useStore } from "@/store/useStore";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  BarChart3,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "expiry-soon"
  | "discount";

const Market = () => {
  const { address: account } = useAccount();
  const { addToast } = useStore();
  const {
    listings,
    isLoading,
    fetchListings,
    buyListing,
    cancelListing,
    isBuying,
    isCancelling,
  } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [processingId, setProcessingId] = useState<bigint | null>(null);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.tokenId.toString().includes(query) ||
          l.seller.toLowerCase().includes(query) ||
          l.listingId.toString().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => Number(a.price - b.price));
        break;
      case "price-high":
        result.sort((a, b) => Number(b.price - a.price));
        break;
      case "expiry-soon":
        result.sort((a, b) => Number(a.expiresAt - b.expiresAt));
        break;
      case "discount":
        result.sort((a, b) => {
          const discountA = Number(
            ((a.originalAmount - a.price) * 100n) / a.originalAmount
          );
          const discountB = Number(
            ((b.originalAmount - b.price) * 100n) / b.originalAmount
          );
          return discountB - discountA;
        });
        break;
      default:
        result.sort((a, b) => Number(b.listingId - a.listingId));
    }

    return result;
  }, [listings, searchQuery, sortBy]);

  // Market stats
  const marketStats = useMemo(() => {
    if (listings.length === 0) return null;

    const totalVolume = listings.reduce((sum, l) => sum + l.price, 0n);
    const totalOriginal = listings.reduce(
      (sum, l) => sum + l.originalAmount,
      0n
    );
    const avgDiscount =
      totalOriginal > 0n
        ? Number(((totalOriginal - totalVolume) * 100n) / totalOriginal)
        : 0;

    return {
      totalListings: listings.length,
      totalVolume,
      avgDiscount,
    };
  }, [listings]);

  // Market depth - group listings by discount bracket
  const marketDepth = useMemo(() => {
    const brackets = [
      { label: "0-5%", min: 0, max: 5, count: 0, volume: 0n },
      { label: "5-10%", min: 5, max: 10, count: 0, volume: 0n },
      { label: "10-15%", min: 10, max: 15, count: 0, volume: 0n },
      { label: "15-20%", min: 15, max: 20, count: 0, volume: 0n },
      { label: "20-25%", min: 20, max: 25, count: 0, volume: 0n },
      { label: "25%+", min: 25, max: 100, count: 0, volume: 0n },
    ];

    for (const listing of listings) {
      const discount =
        listing.originalAmount > 0n
          ? Number(
              ((listing.originalAmount - listing.price) * 100n) /
                listing.originalAmount
            )
          : 0;

      for (const bracket of brackets) {
        if (discount >= bracket.min && discount < bracket.max) {
          bracket.count++;
          bracket.volume += listing.price;
          break;
        }
      }
    }

    const maxCount = Math.max(...brackets.map((b) => b.count), 1);
    return brackets.map((b) => ({
      ...b,
      percentage: (b.count / maxCount) * 100,
    }));
  }, [listings]);

  const [showDepth, setShowDepth] = useState(true);

  const handleBuy = async (
    listingId: bigint,
    price: bigint,
    tokenAddress: string
  ) => {
    setProcessingId(listingId);
    await buyListing(listingId, price, tokenAddress);

    // Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setProcessingId(null);
  };

  const handleCancel = async (listingId: bigint) => {
    setProcessingId(listingId);
    await cancelListing(listingId);
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <PageHeader
          title="rNFT Marketplace"
          subtitle="Trade refundable NFTs at a discount - buy low, refund high!"
        />

        {/* Market Stats */}
        {marketStats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Active Listings
              </p>
              <p className="text-2xl font-bold gradient-text">
                {marketStats.totalListings}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Value
              </p>
              <p className="text-2xl font-bold gradient-text">
                {formatEther(marketStats.totalVolume)} USDC
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Avg Discount
              </p>
              <p className="text-2xl font-bold text-green-500">
                {marketStats.avgDiscount}%
              </p>
            </div>
          </motion.div>
        )}

        {/* Market Depth Visualization */}
        {listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div
              className="glass-card rounded-xl p-4 cursor-pointer"
              onClick={() => setShowDepth(!showDepth)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Market Depth</h3>
                  <span className="text-xs text-muted-foreground">
                    (Liquidity by Discount Level)
                  </span>
                </div>
                <button className="text-xs text-primary hover:underline">
                  {showDepth ? "Hide" : "Show"}
                </button>
              </div>

              {showDepth && (
                <div className="space-y-2">
                  {marketDepth.map((bracket) => (
                    <div
                      key={bracket.label}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs text-muted-foreground w-12">
                        {bracket.label}
                      </span>
                      <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bracket.percentage}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                        />
                        {bracket.count > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                            {bracket.count} listing
                            {bracket.count !== 1 ? "s" : ""} •{" "}
                            {parseFloat(formatEther(bracket.volume)).toFixed(2)}{" "}
                            USDC
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    🐳 Deep liquidity = better prices for traders • Find
                    opportunities at higher discounts!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by token ID, seller, or listing ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 rounded-lg bg-input border border-border text-foreground"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="expiry-soon">Expiring Soon</option>
            <option value="discount">Highest Discount</option>
          </select>

          {/* Privacy Toggle */}
          <button
            onClick={() => setShowPrivacy(!showPrivacy)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showPrivacy
                ? "bg-primary/20 border-primary text-primary"
                : "bg-input border-border text-muted-foreground"
            }`}
          >
            {showPrivacy ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            Privacy Mode
          </button>

          {/* Refresh */}
          <GradientButton
            onClick={fetchListings}
            variant="secondary"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </GradientButton>
        </motion.div>

        {/* Loading State */}
        {isLoading && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-12 text-center"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">
              Loading marketplace listings...
            </p>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredListings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-12 text-center"
          >
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">
              {searchQuery
                ? "No listings match your search"
                : "No rNFTs listed for sale yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try a different search term"
                : "List your rNFT from the My rNFTs page to start trading!"}
            </p>
          </motion.div>
        )}

        {/* Listings Grid */}
        {filteredListings.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.listingId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MarketListingCard
                  listingId={listing.listingId}
                  tokenId={listing.tokenId}
                  seller={listing.seller}
                  price={listing.price}
                  originalAmount={listing.originalAmount}
                  tokenAddress={listing.tokenAddress}
                  expiresAt={listing.expiresAt}
                  isOwner={
                    account?.toLowerCase() === listing.seller.toLowerCase()
                  }
                  onBuy={() =>
                    handleBuy(
                      listing.listingId,
                      listing.price,
                      listing.tokenAddress
                    )
                  }
                  onCancel={() => handleCancel(listing.listingId)}
                  isLoading={
                    processingId === listing.listingId &&
                    (isBuying || isCancelling)
                  }
                  showPrivacy={showPrivacy}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
