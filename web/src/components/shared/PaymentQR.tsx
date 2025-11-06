import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentQRProps {
  paymentLink: string;
  amount?: string;
}

export const PaymentQR = ({ paymentLink, amount }: PaymentQRProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-8 text-center max-w-md mx-auto"
    >
      <h3 className="text-xl font-bold mb-6">Payment Link Generated</h3>
      
      <div className="bg-white p-4 rounded-xl inline-block mb-6">
        <QRCodeSVG value={paymentLink} size={200} />
      </div>

      {amount && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="text-2xl font-bold text-primary">{amount} USDC</p>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={paymentLink}
          readOnly
          className="w-full bg-input border border-border rounded-lg px-4 py-2 pr-12 text-sm font-mono"
        />
        <button
          onClick={copyToClipboard}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-md transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-4">
        Share this QR code or link with your customer
      </p>
    </motion.div>
  );
};
