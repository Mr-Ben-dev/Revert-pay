import { GradientButton } from "@/components/shared/GradientButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAddresses } from "@/lib/wagmi";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import {
  Activity,
  Award,
  BarChart3,
  DollarSign,
  Download,
  RefreshCw,
  Shield,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

interface EcosystemStats {
  totalPayments: number;
  totalRefunds: number;
  totalVolume: bigint;
  refundVolume: bigint;
  uniqueMerchants: number;
  uniqueCustomers: number;
  activeRNFTs: number;
  marketplaceVolume: bigint;
  marketplaceListings: number;
  avgRefundTime: number;
  refundRate: number;
  successfulPurchases: number;
}

interface TopMerchant {
  address: string;
  volume: bigint;
  transactions: number;
  refundRate: number;
}

interface TraderStats {
  address: string;
  buys: number;
  sells: number;
  totalVolume: bigint;
  badge: "bronze" | "silver" | "gold" | "diamond" | "none";
}

// Demo data for when RPC fails or for showcase
const DEMO_STATS: EcosystemStats = {
  totalPayments: 47,
  totalRefunds: 8,
  totalVolume: BigInt("125000000000000000000"), // 125 USDC
  refundVolume: BigInt("15000000000000000000"), // 15 USDC
  uniqueMerchants: 5,
  uniqueCustomers: 23,
  activeRNFTs: 12,
  marketplaceVolume: BigInt("8500000000000000000"), // 8.5 USDC
  marketplaceListings: 6,
  avgRefundTime: 4,
  refundRate: 17,
  successfulPurchases: 39,
};

const DEMO_MERCHANTS: TopMerchant[] = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bA12",
    volume: BigInt("45000000000000000000"),
    transactions: 18,
    refundRate: 11,
  },
  {
    address: "0x8B3f5393bC2006Ab66a4F5D99373dD5e09d8E4E2",
    volume: BigInt("32000000000000000000"),
    transactions: 12,
    refundRate: 16,
  },
  {
    address: "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
    volume: BigInt("28000000000000000000"),
    transactions: 11,
    refundRate: 9,
  },
];

const DEMO_TRADERS: TraderStats[] = [
  {
    address: "0xDeF1C0ded9bec7F1a1670819833240f027b25EfF",
    buys: 8,
    sells: 3,
    totalVolume: BigInt("12000000000000000000"),
    badge: "silver",
  },
  {
    address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    buys: 5,
    sells: 2,
    totalVolume: BigInt("7500000000000000000"),
    badge: "bronze",
  },
];

const Stats = () => {
  const { chainId } = useAccount();
  const addresses = getAddresses(chainId);
  const { addToast } = useStore();

  // Use demo data directly - in production this would come from a subgraph/indexer
  // RPC rate limits make direct blockchain queries impractical for stats
  const [stats, setStats] = useState<EcosystemStats>(DEMO_STATS);
  const [topMerchants, setTopMerchants] =
    useState<TopMerchant[]>(DEMO_MERCHANTS);
  const [traderLeaderboard, setTraderLeaderboard] =
    useState<TraderStats[]>(DEMO_TRADERS);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isDemo] = useState(true); // Always demo until we have a subgraph

  const fetchStats = useCallback(async () => {
    // Simulate loading for UX
    setIsLoading(true);

    // In production, this would fetch from a subgraph like The Graph
    // For now, we use demo data since RPC rate limits are too restrictive
    await new Promise((resolve) => setTimeout(resolve, 500));

    setStats(DEMO_STATS);
    setTopMerchants(DEMO_MERCHANTS);
    setTraderLeaderboard(DEMO_TRADERS);
    setLastUpdated(new Date());
    setIsLoading(false);

    addToast("Stats refreshed (demo data)", "info");
  }, [addToast]);

  // Export stats as CSV for grant applications
  const exportCSV = () => {
    if (!stats) return;

    const csvContent = [
      ["Metric", "Value"],
      ["Total Payments", stats.totalPayments.toString()],
      ["Total Refunds", stats.totalRefunds.toString()],
      ["Successful Purchases", stats.successfulPurchases.toString()],
      ["Total Volume (USDC)", formatEther(stats.totalVolume)],
      ["Refund Volume (USDC)", formatEther(stats.refundVolume)],
      ["Marketplace Volume (USDC)", formatEther(stats.marketplaceVolume)],
      ["Unique Merchants", stats.uniqueMerchants.toString()],
      ["Unique Customers", stats.uniqueCustomers.toString()],
      ["Active rNFTs", stats.activeRNFTs.toString()],
      ["Refund Rate (%)", stats.refundRate.toFixed(2)],
      ["Marketplace Listings", stats.marketplaceListings.toString()],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revertpay-stats-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addToast("Stats exported successfully!", "success");
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const badgeColors: Record<TraderStats["badge"], string> = {
    diamond: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    silver: "bg-gray-400/20 text-gray-300 border-gray-400/50",
    bronze: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    none: "bg-muted text-muted-foreground",
  };

  const badgeEmoji: Record<TraderStats["badge"], string> = {
    diamond: "💎",
    gold: "🥇",
    silver: "🥈",
    bronze: "🥉",
    none: "🔰",
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <PageHeader
            title="Ecosystem Stats"
            subtitle="Real-time analytics and leaderboards for RevertPay"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchStats}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <GradientButton onClick={exportCSV} disabled={!stats}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </GradientButton>
          </div>
        </div>

        {isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm"
          >
            📊 Showing demo data. In production, stats are indexed from on-chain
            events.
          </motion.div>
        )}

        {lastUpdated && (
          <p className="text-xs text-muted-foreground mb-6">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Main Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <StatCard
                title="Total Volume"
                value={`$${parseFloat(
                  formatEther(stats.totalVolume)
                ).toLocaleString()}`}
                icon={DollarSign}
                trend="+12.5%"
                trendUp
              />
              <StatCard
                title="Total Payments"
                value={stats.totalPayments.toLocaleString()}
                icon={Activity}
              />
              <StatCard
                title="Unique Merchants"
                value={stats.uniqueMerchants.toLocaleString()}
                icon={Store}
              />
              <StatCard
                title="Active rNFTs"
                value={stats.activeRNFTs.toLocaleString()}
                icon={Shield}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <StatCard
                title="Refund Rate"
                value={`${stats.refundRate.toFixed(1)}%`}
                icon={TrendingUp}
                subtitle={`${stats.totalRefunds} refunds`}
              />
              <StatCard
                title="Unique Customers"
                value={stats.uniqueCustomers.toLocaleString()}
                icon={Users}
              />
              <StatCard
                title="Marketplace Volume"
                value={`$${parseFloat(
                  formatEther(stats.marketplaceVolume)
                ).toLocaleString()}`}
                icon={BarChart3}
              />
              <StatCard
                title="Market Listings"
                value={stats.marketplaceListings.toLocaleString()}
                icon={Wallet}
              />
            </motion.div>

            {/* Top Merchants & Trader Leaderboard */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Merchants */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-card border-border h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      Top Merchants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topMerchants.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No merchant data yet
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {topMerchants.map((merchant, index) => (
                          <div
                            key={merchant.address}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-muted-foreground">
                                #{index + 1}
                              </span>
                              <div>
                                <p className="font-mono text-sm">
                                  {formatAddress(merchant.address)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {merchant.transactions} transactions
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                $
                                {parseFloat(
                                  formatEther(merchant.volume)
                                ).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {merchant.refundRate.toFixed(1)}% refund rate
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Trader Leaderboard */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-card border-border h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-400" />
                      Trader Leaderboard
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {traderLeaderboard.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No trading activity yet. Be the first! 🚀
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {traderLeaderboard.map((trader, index) => (
                          <div
                            key={trader.address}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {index === 0 ? "👑" : `#${index + 1}`}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-mono text-sm">
                                    {formatAddress(trader.address)}
                                  </p>
                                  {trader.badge !== "none" && (
                                    <Badge
                                      variant="outline"
                                      className={badgeColors[trader.badge]}
                                    >
                                      {badgeEmoji[trader.badge]} {trader.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {trader.buys} buys • {trader.sells} sells
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                $
                                {parseFloat(
                                  formatEther(trader.totalVolume)
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Badge Legend */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Badge Requirements:
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline" className={badgeColors.bronze}>
                          🥉 Bronze (5+ trades)
                        </Badge>
                        <Badge variant="outline" className={badgeColors.silver}>
                          🥈 Silver (20+ trades)
                        </Badge>
                        <Badge variant="outline" className={badgeColors.gold}>
                          🥇 Gold (50+ trades)
                        </Badge>
                        <Badge
                          variant="outline"
                          className={badgeColors.diamond}
                        >
                          💎 Diamond (100+ trades)
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Network Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Card className="glass-card border-border">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Network: Polygon Amoy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        Manager:{" "}
                        {addresses?.MANAGER
                          ? formatAddress(addresses.MANAGER)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        RNFT:{" "}
                        {addresses?.RNFT
                          ? formatAddress(addresses.RNFT)
                          : "N/A"}
                      </span>
                    </div>
                    <a
                      href="https://amoy.polygonscan.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View on PolygonScan →
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              Unable to load stats. Please check your connection and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
