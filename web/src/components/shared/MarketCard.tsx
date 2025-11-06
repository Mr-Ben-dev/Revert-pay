import { motion } from 'framer-motion';
import { Clock, Coins, User } from 'lucide-react';
import { GradientButton } from './GradientButton';

interface MarketCardProps {
  rnftId: string;
  seller: string;
  price: string;
  tokenAddress: string;
  amount: string;
  expiresAt: Date;
  onBuy?: () => void;
}

export const MarketCard = ({
  rnftId,
  seller,
  price,
  tokenAddress,
  amount,
  expiresAt,
  onBuy,
}: MarketCardProps) => {
  const timeLeft = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]"
    >
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">rNFT ID</p>
        <p className="text-xl font-bold">#{rnftId}</p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Original Value:</span>
          <span className="font-semibold">{amount} USDC</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-secondary" />
          <span className="text-muted-foreground">Seller:</span>
          <span className="font-mono text-xs">{seller.slice(0, 10)}...</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Expires in:</span>
          <span className="font-semibold">{timeLeft} days</span>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">List Price</span>
          <span className="text-2xl font-bold text-primary">{price} USDC</span>
        </div>
        <GradientButton onClick={onBuy} className="w-full">
          Buy Now
        </GradientButton>
      </div>
    </motion.div>
  );
};
