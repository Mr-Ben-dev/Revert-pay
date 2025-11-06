import { useStore } from "@/store/useStore";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const useWallet = () => {
  const { addToast } = useStore();
  const { address, isConnected, chain } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const connect = async () => {
    try {
      // Connect with the first available connector (injected or WalletConnect)
      const connector = connectors[0];
      if (connector) {
        wagmiConnect({ connector });
        addToast("Wallet connected successfully", "success");
      }
    } catch (error) {
      addToast("Failed to connect wallet", "error");
    }
  };

  const disconnect = () => {
    wagmiDisconnect();
    addToast("Wallet disconnected", "info");
  };

  return {
    isConnected,
    address,
    chainId: chain?.id,
    connect,
    disconnect,
  };
};
