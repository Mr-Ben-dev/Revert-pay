import { GradientButton } from "@/components/shared/GradientButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAddresses } from "@/lib/wagmi";
import RefundPolicyRegistryABI from "@/shared/abis/RefundPolicyRegistry.json";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

const CreatePolicy = () => {
  const navigate = useNavigate();
  const { addToast } = useStore();
  const { address: account, chainId, chain } = useAccount();
  const addresses = getAddresses(chainId);

  const [formData, setFormData] = useState({
    tokenAddress: addresses?.MOCKUSDC || "",
    refundWindowHours: 168, // 7 days default
    restockingFeeBps: 0,
    autoApprove: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContract } = useWriteContract();

  // Read existing policy
  const { data: existingPolicy } = useReadContract({
    address: addresses?.POLICY as `0x${string}`,
    abi: RefundPolicyRegistryABI,
    functionName: "getPolicy",
    args: [account],
  });

  // Load existing policy into form
  useEffect(() => {
    if (existingPolicy && (existingPolicy as any).exists) {
      const policy = existingPolicy as any;
      setFormData({
        tokenAddress: policy.token,
        refundWindowHours: Math.floor(Number(policy.refundWindow) / 3600),
        restockingFeeBps: Number(policy.restockingFeeBps),
        autoApprove: policy.autoApprove,
      });
    }
  }, [existingPolicy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      addToast("Please connect your wallet", "error");
      return;
    }

    // Validation
    if (!formData.tokenAddress) {
      addToast("Please enter a token address", "error");
      return;
    }

    if (formData.refundWindowHours < 1 || formData.refundWindowHours > 720) {
      addToast(
        "Refund window must be between 1 and 720 hours (30 days)",
        "error"
      );
      return;
    }

    if (formData.restockingFeeBps < 0 || formData.restockingFeeBps > 1000) {
      addToast("Restocking fee must be between 0 and 1000 bps (10%)", "error");
      return;
    }

    setIsSubmitting(true);

    const refundWindowSeconds = formData.refundWindowHours * 3600;

    writeContract(
      {
        address: addresses?.POLICY as `0x${string}`,
        abi: RefundPolicyRegistryABI as any,
        functionName: "setPolicy",
        args: [
          formData.tokenAddress,
          BigInt(refundWindowSeconds),
          formData.restockingFeeBps,
          formData.autoApprove,
        ],
        chain,
        account: account!,
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          addToast("Policy created/updated successfully!", "success");
          setTimeout(() => navigate("/merchant"), 2000);
        },
        onError: (error: any) => {
          setIsSubmitting(false);
          console.error("Policy creation error:", error);
          addToast(error.message || "Failed to create policy", "error");
        },
      }
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <PageHeader
          title="Create Refund Policy"
          subtitle="Define the terms for your refundable payments"
        />

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-xl p-8 space-y-6"
        >
          <div>
            <Label htmlFor="tokenAddress" className="flex items-center gap-2">
              Token Address
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      The ERC20 token address for payments (e.g., USDC)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="tokenAddress"
              placeholder="0x..."
              value={formData.tokenAddress}
              onChange={(e) =>
                setFormData({ ...formData, tokenAddress: e.target.value })
              }
              className="mt-2 bg-input border-border"
            />
          </div>

          <div>
            <Label htmlFor="refundWindow" className="flex items-center gap-2">
              Refund Window (hours)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      How long customers have to request a refund (1-720 hours)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="refundWindow"
              type="number"
              min="1"
              max="720"
              value={formData.refundWindowHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  refundWindowHours: parseInt(e.target.value) || 0,
                })
              }
              className="mt-2 bg-input border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(formData.refundWindowHours / 24).toFixed(1)} days
            </p>
          </div>

          <div>
            <Label htmlFor="restockingFee" className="flex items-center gap-2">
              Restocking Fee (basis points)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Fee charged on refunds. 100 bps = 1%. Max 10000 bps (100%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="restockingFee"
              type="number"
              min="0"
              max="10000"
              value={formData.restockingFeeBps}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  restockingFeeBps: parseInt(e.target.value) || 0,
                })
              }
              className="mt-2 bg-input border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(formData.restockingFeeBps / 100).toFixed(2)}% fee
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <Label
                htmlFor="autoApprove"
                className="flex items-center gap-2 cursor-pointer"
              >
                Auto-approve Refunds
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        If enabled, refunds are processed automatically.
                        Otherwise, manual approval required.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <p className="text-sm text-muted-foreground">
                Process refunds without manual review
              </p>
            </div>
            <Switch
              id="autoApprove"
              checked={formData.autoApprove}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, autoApprove: checked })
              }
            />
          </div>

          <div className="pt-6 border-t border-border">
            <GradientButton
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating Policy..."
                : (existingPolicy as any)?.exists
                ? "Update Policy"
                : "Create Policy"}
            </GradientButton>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreatePolicy;
