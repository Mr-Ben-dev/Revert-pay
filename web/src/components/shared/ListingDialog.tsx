import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Clock,
  Lightbulb,
  Loader2,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { GradientButton } from "./GradientButton";

interface ListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: bigint) => void;
  tokenId: bigint | null;
  originalAmount: bigint;
  expiresAt: bigint;
  isLoading?: boolean;
  needsApproval?: boolean;
  onApprove?: () => void;
}

export const ListingDialog = ({
  isOpen,
  onClose,
  onConfirm,
  tokenId,
  originalAmount,
  expiresAt,
  isLoading = false,
  needsApproval = false,
  onApprove,
}: ListingDialogProps) => {
  const [priceInput, setPriceInput] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState<bigint>(0n);

  // Calculate smart price based on time remaining
  useEffect(() => {
    if (originalAmount > 0n && expiresAt > 0n) {
      const now = Math.floor(Date.now() / 1000);
      const expiry = Number(expiresAt);
      const totalWindow = 7 * 24 * 60 * 60; // Assume 7 day window
      const remaining = expiry - now;

      // Higher discount as expiry approaches
      // 0% discount at 7 days, up to 30% discount at 0 days
      const percentRemaining = Math.max(
        0,
        Math.min(1, remaining / totalWindow)
      );
      const discount = 0.05 + (1 - percentRemaining) * 0.25; // 5% to 30%

      const suggested =
        (originalAmount * BigInt(Math.floor((1 - discount) * 1000))) / 1000n;
      setSuggestedPrice(suggested);

      // Pre-fill with suggested price if empty
      if (!priceInput) {
        setPriceInput(formatEther(suggested));
      }
    }
  }, [originalAmount, expiresAt, isOpen]);

  // Calculate discount from input
  const inputPrice = priceInput
    ? BigInt(Math.floor(Number(priceInput) * 1e18))
    : 0n;
  const discount =
    originalAmount > 0n && inputPrice > 0n
      ? Number(((originalAmount - inputPrice) * 100n) / originalAmount)
      : 0;

  // Time remaining
  const getTimeRemaining = () => {
    const now = Math.floor(Date.now() / 1000);
    const diff = Number(expiresAt) - now;
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    return `${days}d ${hours}h`;
  };

  const handleConfirm = () => {
    if (priceInput && Number(priceInput) > 0) {
      const priceInWei = BigInt(Math.floor(Number(priceInput) * 1e18));
      onConfirm(priceInWei);
    }
  };

  const handleUseSuggested = () => {
    setPriceInput(formatEther(suggestedPrice));
  };

  const handleClose = () => {
    setPriceInput("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            List rNFT #{tokenId?.toString()} for Sale
          </DialogTitle>
          <DialogDescription>
            Set a competitive price to attract buyers. Lower prices sell faster!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Token Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Original Value
              </p>
              <p className="text-lg font-bold">
                {formatEther(originalAmount)} USDC
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Expires In
              </p>
              <p className="text-lg font-bold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getTimeRemaining()}
              </p>
            </div>
          </div>

          {/* Smart Pricing Suggestion */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  Smart Pricing Suggestion
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on time remaining and market conditions
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold">
                    {formatEther(suggestedPrice)} USDC
                  </span>
                  <button
                    onClick={handleUseSuggested}
                    className="text-xs text-primary hover:underline"
                  >
                    Use this price
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <Label
              htmlFor="price"
              className="flex items-center justify-between"
            >
              <span>Sale Price (USDC)</span>
              {discount > 0 && (
                <span className="flex items-center gap-1 text-green-500 text-xs">
                  <TrendingDown className="w-3 h-3" />
                  {discount}% discount
                </span>
              )}
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              max={formatEther(originalAmount)}
              placeholder="0.00"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="bg-input border-border text-lg"
            />
          </div>

          {/* Warning for high prices */}
          {inputPrice > originalAmount && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              Price is higher than original amount - unlikely to sell
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <GradientButton
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </GradientButton>

            {needsApproval ? (
              <GradientButton
                onClick={onApprove}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve NFT"
                )}
              </GradientButton>
            ) : (
              <GradientButton
                onClick={handleConfirm}
                className="flex-1"
                disabled={isLoading || !priceInput || Number(priceInput) <= 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Listing...
                  </>
                ) : (
                  "List for Sale"
                )}
              </GradientButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
