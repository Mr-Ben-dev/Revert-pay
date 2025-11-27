import { motion } from "framer-motion";
import {
  Clock,
  Coins,
  EyeOff,
  Shield,
  Tag,
  TrendingDown,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { GradientButton } from "./GradientButton";

interface MarketListingCardProps {
  listingId: bigint;
  tokenId: bigint;
  seller: string;
  price: bigint;
  originalAmount: bigint;
  tokenAddress: string;
  expiresAt: bigint;
  isOwner: boolean;
  onBuy?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showPrivacy?: boolean;
}

export const MarketListingCard = ({
  listingId,
  tokenId,
  seller,
  price,
  originalAmount,
  tokenAddress,
  expiresAt,
  isOwner,
  onBuy,
  onCancel,
  isLoading = false,
  showPrivacy = false,
}: MarketListingCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  // Calculate discount percentage
  const discount =
    originalAmount > 0n
      ? Number(((originalAmount - price) * 100n) / originalAmount)
      : 0;

  // Format addresses
  const formatAddress = (addr: string) => {
    if (showPrivacy) return "Anonymous Seller";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiry = Number(expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setIsExpired(true);
        return;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
      setIsExpired(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Determine urgency color
  const getUrgencyColor = () => {
    const now = Math.floor(Date.now() / 1000);
    const diff = Number(expiresAt) - now;
    const days = diff / (60 * 60 * 24);

    if (days < 1) return "text-red-500";
    if (days < 3) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] ${
        isExpired ? "opacity-60" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Listing #{listingId.toString()}
          </p>
          <p className="text-2xl font-bold gradient-text">
            Token #{tokenId.toString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {discount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
              <TrendingDown className="w-3 h-3" />
              {discount}% OFF
            </div>
          )}
          {isExpired ? (
            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
              EXPIRED
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Original Value:</span>
          <span className="font-semibold">
            {formatEther(originalAmount)} USDC
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-secondary" />
          <span className="text-muted-foreground">Seller:</span>
          <span className="font-mono text-xs flex items-center gap-1">
            {formatAddress(seller)}
            {showPrivacy && (
              <EyeOff className="w-3 h-3 text-muted-foreground" />
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-muted-foreground">Token:</span>
          <span className="font-mono text-xs">
            {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-4)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className={`w-4 h-4 ${getUrgencyColor()}`} />
          <span className="text-muted-foreground">Expires:</span>
          <span className={`font-semibold ${getUrgencyColor()}`}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Price Section */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">List Price</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold gradient-text">
              {formatEther(price)} USDC
            </span>
            {discount > 0 && (
              <p className="text-xs text-muted-foreground line-through">
                {formatEther(originalAmount)} USDC
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {isOwner ? (
          <GradientButton
            onClick={onCancel}
            variant="secondary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Listing"}
          </GradientButton>
        ) : (
          <GradientButton
            onClick={onBuy}
            className="w-full"
            disabled={isLoading || isExpired}
          >
            {isLoading ? "Processing..." : isExpired ? "Expired" : "Buy Now"}
          </GradientButton>
        )}
      </div>
    </motion.div>
  );
};
