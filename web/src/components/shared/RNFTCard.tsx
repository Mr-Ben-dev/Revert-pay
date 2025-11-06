import { motion } from 'framer-motion';
import { Clock, Coins, Shield } from 'lucide-react';
import { GradientButton } from './GradientButton';
import { useEffect, useState } from 'react';

interface RNFTCardProps {
  tokenId: string;
  amount: string;
  tokenAddress: string;
  expiresAt: Date;
  canRefund: boolean;
  status: 'active' | 'refunded' | 'expired';
  onRefund?: () => void;
  onList?: () => void;
}

export const RNFTCard = ({
  tokenId,
  amount,
  tokenAddress,
  expiresAt,
  canRefund,
  status,
  onRefund,
  onList,
}: RNFTCardProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = expiresAt.getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-xl p-6 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Token ID</p>
          <p className="text-xl font-bold">#{tokenId}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'active'
              ? 'bg-success/20 text-success'
              : status === 'refunded'
              ? 'bg-primary/20 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {status.toUpperCase()}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-semibold">{amount} USDC</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-secondary" />
          <span className="text-muted-foreground">Token:</span>
          <span className="font-mono text-xs">{tokenAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Expires in:</span>
          <span className="font-semibold">{timeLeft}</span>
        </div>
      </div>

      {canRefund && status === 'active' && (
        <div className="flex gap-2">
          <GradientButton onClick={onRefund} className="flex-1">
            Refund
          </GradientButton>
          <GradientButton onClick={onList} variant="secondary" className="flex-1">
            List for Sale
          </GradientButton>
        </div>
      )}
    </motion.div>
  );
};
