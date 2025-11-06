import { MarketCard } from "@/components/shared/MarketCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";

const Market = () => {
  const { marketListings, removeListing, addToast } = useStore();

  const handleBuy = async (listingId: string) => {
    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      removeListing(listingId);
      addToast("rNFT purchased successfully", "success");
    } catch (error) {
      addToast("Purchase failed", "error");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <PageHeader
          title="rNFT Marketplace"
          subtitle="Trade refundable NFTs at a discount"
        />

        {marketListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-xl p-12 text-center"
          >
            <p className="text-lg text-muted-foreground">
              No rNFTs listed for sale yet. Check back soon!
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MarketCard {...listing} onBuy={() => handleBuy(listing.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
