import { GradientButton } from "@/components/shared/GradientButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useWallet } from "@/hooks/useWallet";
import { getAddresses } from "@/lib/wagmi";
import ERC20ABI from "@/shared/abis/ERC20.json";
import RevertPayManagerABI from "@/shared/abis/RevertPayManager.json";
import { useStore } from "@/store/useStore";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { CheckCircle, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";

const Checkout = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { isConnected, connect, address: account } = useWallet();
  const { chainId, chain } = useAccount();
  const addresses = getAddresses(chainId);
  const { addToast } = useStore();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>();
  const [orderHash, setOrderHash] = useState<`0x${string}` | undefined>();

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        if (!approvalHash) {
          setApprovalHash(hash);
        } else {
          setOrderHash(hash);
        }
      },
    },
  });

  // Decode payment link
  useEffect(() => {
    if (linkId) {
      try {
        const decoded = JSON.parse(atob(linkId));
        setPaymentData(decoded);
      } catch (error) {
        addToast("Invalid payment link", "error");
        navigate("/");
      }
    }
  }, [linkId]);

  const handlePayment = () => {
    if (!isConnected) {
      addToast("Please connect your wallet first", "error");
      return;
    }

    if (!paymentData) {
      addToast("Invalid payment data", "error");
      return;
    }

    setIsPaying(true);
    const amount = parseEther(paymentData.amount);

    // First, approve the token
    addToast("Approving token...", "info");
    writeContract(
      {
        address: paymentData.token as `0x${string}`,
        abi: ERC20ABI as any,
        functionName: "approve",
        args: [addresses?.MANAGER, amount],
        chain,
        account: account!,
      },
      {
        onSuccess: () => {
          // Wait a bit then create order
          setTimeout(() => {
            addToast("Creating order...", "info");
            writeContract(
              {
                address: addresses?.MANAGER as `0x${string}`,
                abi: RevertPayManagerABI as any,
                functionName: "createOrder",
                args: [
                  paymentData.merchant,
                  account,
                  paymentData.token,
                  amount,
                  paymentData.memo || "",
                ],
                chain,
                account: account!,
              },
              {
                onSuccess: () => {
                  setPaymentSuccess(true);
                  setIsPaying(false);
                  addToast(
                    "Payment successful! You received an rNFT",
                    "success"
                  );

                  // Trigger confetti
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                  });

                  // Redirect to My rNFTs after 3 seconds
                  setTimeout(() => navigate("/me"), 3000);
                },
                onError: (error: any) => {
                  setIsPaying(false);
                  console.error("Order error:", error);
                  addToast(error.message || "Order creation failed", "error");
                },
              }
            );
          }, 3000);
        },
        onError: (error: any) => {
          setIsPaying(false);
          console.error("Approval error:", error);
          addToast(error.message || "Approval failed", "error");
        },
      }
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-lg">
        <PageHeader
          title="Checkout"
          subtitle={
            paymentData
              ? `Merchant: ${paymentData.merchant.slice(
                  0,
                  6
                )}...${paymentData.merchant.slice(-4)}`
              : "Loading..."
          }
        />

        {!paymentData ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p>Loading payment details...</p>
          </div>
        ) : !paymentSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-8 space-y-6"
          >
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">Amount Due</p>
              <p className="text-5xl font-bold gradient-text">
                {paymentData.amount} USDC
              </p>
            </div>

            {paymentData.memo && (
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Memo</p>
                <p className="font-medium">{paymentData.memo}</p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-2">What you'll receive:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Refundable NFT (rNFT)</li>
                <li>• 7-day refund window</li>
                <li>• Tradable on marketplace</li>
              </ul>
            </div>

            {!isConnected ? (
              <GradientButton onClick={connect} className="w-full gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet to Pay
              </GradientButton>
            ) : (
              <GradientButton
                onClick={handlePayment}
                disabled={isPaying}
                className="w-full"
              >
                {isPaying ? "Processing..." : "Pay Now"}
              </GradientButton>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-8 text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground">
                You've received an rNFT. Check your portfolio to manage refunds
                or list for sale.
              </p>
            </div>
            <GradientButton
              onClick={() => (window.location.href = "/me")}
              className="w-full"
            >
              View My rNFTs
            </GradientButton>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
