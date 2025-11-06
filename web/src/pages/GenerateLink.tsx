import { GradientButton } from "@/components/shared/GradientButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaymentQR } from "@/components/shared/PaymentQR";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAddresses } from "@/lib/wagmi";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";

const GenerateLink = () => {
  const { address: account, chainId } = useAccount();
  const addresses = getAddresses(chainId);
  const { addToast } = useStore();

  const [formData, setFormData] = useState({
    amount: "",
    memo: "",
  });
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      addToast("Please connect your wallet", "error");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    // Encode payment data
    const paymentData = {
      merchant: account,
      token: addresses?.MOCKUSDC,
      amount: formData.amount,
      memo: formData.memo,
      chainId,
    };

    // Base64 encode the payment data
    const encoded = btoa(JSON.stringify(paymentData));
    const link = `${window.location.origin}/pay/${encoded}`;
    setPaymentLink(link);
  };

  const handleReset = () => {
    setPaymentLink(null);
    setFormData({ amount: "", memo: "" });
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <PageHeader
          title="Generate Payment Link"
          subtitle="Create a payment link with QR code for your customer"
        />

        {!paymentLink ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleGenerate}
            className="glass-card rounded-xl p-8 space-y-6"
          >
            <div>
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="mt-2 bg-input border-border"
                required
              />
            </div>

            <div>
              <Label htmlFor="memo">Memo (optional)</Label>
              <Textarea
                id="memo"
                placeholder="Payment for..."
                value={formData.memo}
                onChange={(e) =>
                  setFormData({ ...formData, memo: e.target.value })
                }
                className="mt-2 bg-input border-border"
                rows={3}
              />
            </div>

            <GradientButton type="submit" className="w-full">
              Generate Payment Link
            </GradientButton>
          </motion.form>
        ) : (
          <div className="space-y-6">
            <PaymentQR paymentLink={paymentLink} amount={formData.amount} />
            <GradientButton
              onClick={handleReset}
              variant="secondary"
              className="w-full"
            >
              Generate Another Link
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateLink;
