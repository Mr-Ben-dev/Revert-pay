import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChain } from "@/hooks/useChain";
import { useWallet } from "@/hooks/useWallet";
import { motion } from "framer-motion";
import { Menu, Network, Wallet, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { GradientButton } from "./GradientButton";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, address, connect, disconnect } = useWallet();
  const { chainId, chainName, switchChain } = useChain();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/merchant", label: "Merchant" },
    { to: "/me", label: "My rNFTs" },
    { to: "/market", label: "Market" },
    { to: "/stats", label: "Stats" },
    { to: "/docs", label: "Docs" },
  ];

  const handleSwitchChain = async (targetChainId: number) => {
    await switchChain(targetChainId);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold font-heading gradient-text"
            >
              RevertPay
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center gap-3">
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-primary/30 hover:bg-primary/10"
                  >
                    <Network className="w-4 h-4" />
                    {chainName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSwitchChain(80002)}>
                    Polygon Amoy Testnet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSwitchChain(137)}>
                    Polygon Mainnet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isConnected ? (
              <Button
                onClick={disconnect}
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 hover:bg-primary/10"
              >
                <Wallet className="w-4 h-4" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
            ) : (
              <GradientButton onClick={connect}>
                <Wallet className="w-4 h-4 mr-2 inline" />
                Connect Wallet
              </GradientButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                {isConnected ? (
                  <Button
                    onClick={disconnect}
                    variant="outline"
                    className="w-full gap-2 border-primary/30"
                  >
                    <Wallet className="w-4 h-4" />
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </Button>
                ) : (
                  <GradientButton onClick={connect} className="w-full">
                    <Wallet className="w-4 h-4 mr-2 inline" />
                    Connect Wallet
                  </GradientButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};
