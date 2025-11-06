import { GradientButton } from "@/components/shared/GradientButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
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
import ERC20ABI from "@/shared/abis/ERC20.json";
import MockUSDCABI from "@/shared/abis/MockUSDC.json";
import RefundPolicyRegistryABI from "@/shared/abis/RefundPolicyRegistry.json";
import RefundVaultABI from "@/shared/abis/RefundVault.json";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  Minus,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatEther, parseEther } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

const MerchantDashboard = () => {
  const { address: account, chainId, chain } = useAccount();
  const addresses = getAddresses(chainId);
  const { addToast } = useStore();

  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const { writeContract } = useWriteContract();

  // Read vault balance
  const { data: vaultBalance, refetch: refetchBalance } = useReadContract({
    address: addresses?.VAULT as `0x${string}`,
    abi: RefundVaultABI,
    functionName: "balance",
    args: [account],
  });

  // Read reserved balance
  const { data: reservedBalance } = useReadContract({
    address: addresses?.VAULT as `0x${string}`,
    abi: RefundVaultABI,
    functionName: "reserved",
    args: [account],
  });

  // Read policy
  const { data: policy } = useReadContract({
    address: addresses?.POLICY as `0x${string}`,
    abi: RefundPolicyRegistryABI,
    functionName: "getPolicy",
    args: [account],
  });

  // Read token balance
  const {
    data: tokenBalance,
    refetch: refetchTokenBalance,
    error: tokenBalanceError,
    isLoading: tokenBalanceLoading,
  } = useReadContract({
    address: addresses?.MOCKUSDC as `0x${string}`,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [account],
    query: {
      enabled: !!account && !!addresses?.MOCKUSDC,
    },
  });

  // Read token allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses?.MOCKUSDC as `0x${string}`,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [account, addresses?.VAULT],
  });

  const balance = vaultBalance
    ? Number(formatEther(vaultBalance as bigint))
    : 0;
  const reserved = reservedBalance
    ? Number(formatEther(reservedBalance as bigint))
    : 0;
  const available = balance - reserved;
  const walletBalance = tokenBalance
    ? Number(formatEther(tokenBalance as bigint))
    : 0;

  // Debug logging
  console.log("Account:", account);
  console.log("MockUSDC address:", addresses?.MOCKUSDC);
  console.log("Token balance (raw):", tokenBalance);
  console.log("Token balance loading:", tokenBalanceLoading);
  console.log("Token balance error:", tokenBalanceError);
  console.log("Wallet balance (formatted):", walletBalance);

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    setIsProcessing(true);

    try {
      const amount = parseEther(depositAmount);
      const currentAllowance = (allowance as bigint) || BigInt(0);

      // Check if approval is needed
      if (currentAllowance < amount) {
        // Approve first
        writeContract(
          {
            address: addresses?.MOCKUSDC as `0x${string}`,
            abi: ERC20ABI as any,
            functionName: "approve",
            args: [addresses?.VAULT, amount],
            chain,
            account: account!,
          },
          {
            onSuccess: () => {
              addToast(
                "Approval submitted, waiting for confirmation...",
                "info"
              );
              setTimeout(async () => {
                await refetchAllowance();
                // Now deposit
                writeContract(
                  {
                    address: addresses?.VAULT as `0x${string}`,
                    abi: RefundVaultABI as any,
                    functionName: "deposit",
                    args: [addresses?.MOCKUSDC, amount],
                    chain,
                    account: account!,
                  },
                  {
                    onSuccess: async () => {
                      addToast("Deposit successful!", "success");
                      setDepositDialogOpen(false);
                      setDepositAmount("");
                      // Refetch all balances
                      setTimeout(async () => {
                        await refetchBalance();
                        await refetchTokenBalance();
                        await refetchAllowance();
                        setIsProcessing(false);
                      }, 3000);
                    },
                    onError: (error: any) => {
                      setIsProcessing(false);
                      console.error("Deposit error:", error);
                      addToast(error.message || "Deposit failed", "error");
                    },
                  }
                );
              }, 3000);
            },
            onError: (error: any) => {
              setIsProcessing(false);
              console.error("Approval error:", error);
              addToast(error.message || "Approval failed", "error");
            },
          }
        );
      } else {
        // Already approved, just deposit
        writeContract(
          {
            address: addresses?.VAULT as `0x${string}`,
            abi: RefundVaultABI as any,
            functionName: "deposit",
            args: [addresses?.MOCKUSDC, amount],
            chain,
            account: account!,
          },
          {
            onSuccess: async () => {
              addToast("Deposit successful!", "success");
              setDepositDialogOpen(false);
              setDepositAmount("");
              // Refetch all balances
              setTimeout(async () => {
                await refetchBalance();
                await refetchTokenBalance();
                setIsProcessing(false);
              }, 3000);
            },
            onError: (error: any) => {
              setIsProcessing(false);
              console.error("Deposit error:", error);
              addToast(error.message || "Deposit failed", "error");
            },
          }
        );
      }
    } catch (error: any) {
      setIsProcessing(false);
      console.error("Deposit error:", error);
      addToast(error.message || "Deposit failed", "error");
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    if (Number(withdrawAmount) > available) {
      addToast("Insufficient available balance", "error");
      return;
    }

    setIsProcessing(true);

    const amount = parseEther(withdrawAmount);

    writeContract(
      {
        address: addresses?.VAULT as `0x${string}`,
        abi: RefundVaultABI as any,
        functionName: "withdraw",
        args: [addresses?.MOCKUSDC, amount],
        chain,
        account: account!,
      },
      {
        onSuccess: async () => {
          addToast("Withdrawal successful!", "success");
          setWithdrawDialogOpen(false);
          setWithdrawAmount("");
          // Refetch all balances
          setTimeout(async () => {
            await refetchBalance();
            await refetchTokenBalance();
            setIsProcessing(false);
          }, 3000);
        },
        onError: (error: any) => {
          setIsProcessing(false);
          console.error("Withdraw error:", error);
          addToast(error.message || "Withdrawal failed", "error");
        },
      }
    );
  };

  const handleMintUSDC = () => {
    setIsMinting(true);
    const mintAmount = parseEther("1000"); // Mint 1000 USDC

    writeContract(
      {
        address: addresses?.MOCKUSDC as `0x${string}`,
        abi: MockUSDCABI as any,
        functionName: "mint",
        args: [account, mintAmount],
        chain,
        account: account!,
      },
      {
        onSuccess: async (hash) => {
          const explorerUrl = `https://amoy.polygonscan.com/tx/${hash}`;
          addToast(
            `Transaction submitted! Waiting for confirmation...`,
            "info"
          );
          console.log("Mint transaction:", explorerUrl);

          // Wait for transaction and then refetch
          setTimeout(async () => {
            await refetchTokenBalance();
            setIsMinting(false);
            addToast("Minted 1000 test USDC!", "success");
          }, 5000);
        },
        onError: (error: any) => {
          setIsMinting(false);
          console.error("Mint error:", error);
          addToast(error.message || "Mint failed", "error");
        },
      }
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <PageHeader
          title="Merchant Dashboard"
          subtitle="Monitor your refund policies and revenue"
          action={
            <Link to="/merchant/policy">
              <GradientButton>Create New Policy</GradientButton>
            </Link>
          }
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Vault Balance"
            value={`${balance.toFixed(2)} USDC`}
            icon={DollarSign}
            subtitle="Total deposited"
          />
          <StatCard
            title="Reserved"
            value={`${reserved.toFixed(2)} USDC`}
            icon={FileText}
            subtitle="For active orders"
          />
          <StatCard
            title="Available"
            value={`${available.toFixed(2)} USDC`}
            icon={TrendingUp}
            subtitle="Can withdraw"
            trend={<span className="text-xs text-success">Free to use</span>}
          />
          <StatCard
            title="Wallet Balance"
            value={`${walletBalance.toFixed(2)} USDC`}
            icon={Wallet}
            subtitle="Your wallet"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card rounded-xl p-8 transition-all duration-300"
          >
            <h3 className="text-2xl font-bold mb-4">Vault Management</h3>
            <div className="space-y-3">
              {walletBalance < 10 && (
                <button
                  onClick={handleMintUSDC}
                  disabled={isMinting}
                  className="block w-full p-4 rounded-lg bg-success/10 hover:bg-success/20 transition-colors text-left border border-success/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Plus className="w-4 h-4 text-success" />
                    <p className="font-semibold text-success">
                      {isMinting ? "Minting..." : "Mint Test USDC"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get 1000 test USDC tokens (Amoy testnet only)
                  </p>
                </button>
              )}
              <button
                onClick={() => setDepositDialogOpen(true)}
                className="block w-full p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Plus className="w-4 h-4" />
                  <p className="font-semibold">Deposit Funds</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add USDC to your refund vault
                </p>
              </button>
              <button
                onClick={() => setWithdrawDialogOpen(true)}
                className="block w-full p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Minus className="w-4 h-4" />
                  <p className="font-semibold">Withdraw Funds</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Withdraw available balance ({available.toFixed(2)} USDC)
                </p>
              </button>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card rounded-xl p-8 transition-all duration-300"
          >
            <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/merchant/policy"
                className="block p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <p className="font-semibold mb-1">
                  {(policy as any)?.exists ? "Update Policy" : "Create Policy"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(policy as any)?.exists
                    ? "Modify your refund policy"
                    : "Set up a new refund policy"}
                </p>
              </Link>
              <Link
                to="/merchant/link"
                className="block p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
              >
                <p className="font-semibold mb-1">Generate Payment Link</p>
                <p className="text-sm text-muted-foreground">
                  Create a payment link with QR code
                </p>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Deposit Dialog */}
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>
                Deposit USDC to your refund vault. You need to have a policy set
                up first.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Amount (USDC)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Wallet balance: {walletBalance.toFixed(2)} USDC
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDepositDialogOpen(false)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <GradientButton
                  onClick={handleDeposit}
                  disabled={isProcessing || !depositAmount}
                  className="flex-1"
                >
                  {isProcessing ? "Processing..." : "Deposit"}
                </GradientButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Withdraw available USDC from your refund vault.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Amount (USDC)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  max={available}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {available.toFixed(2)} USDC
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setWithdrawDialogOpen(false)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <GradientButton
                  onClick={handleWithdraw}
                  disabled={isProcessing || !withdrawAmount}
                  className="flex-1"
                >
                  {isProcessing ? "Processing..." : "Withdraw"}
                </GradientButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MerchantDashboard;
