// Real chain switching using Wagmi
import { polygon, polygonAmoy } from "viem/chains";
import { useAccount, useSwitchChain } from "wagmi";

export const useChain = () => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const getChainName = (chainId?: number) => {
    if (chainId === polygonAmoy.id) return "Polygon Amoy Testnet";
    if (chainId === polygon.id) return "Polygon";
    return "Unknown Chain";
  };

  return {
    chainId: chain?.id,
    chainName: getChainName(chain?.id),
    switchChain: async (targetChainId: number) => {
      if (switchChain) {
        switchChain({ chainId: targetChainId });
      }
    },
  };
};
