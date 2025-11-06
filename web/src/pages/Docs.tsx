import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { BookOpen, Code, Zap, Shield } from 'lucide-react';

const Docs = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <PageHeader
          title="Documentation"
          subtitle="Learn how to integrate RevertPay into your application"
        />

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Getting Started</h2>
                <p className="text-muted-foreground">
                  RevertPay is a Web3 refund protocol that enables merchants to offer
                  refundable payments with programmable terms. Customers receive rNFTs
                  (Refundable NFTs) that can be refunded or traded.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Code className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Smart Contracts</h2>
                <p className="text-muted-foreground mb-4">
                  To integrate RevertPay, you'll need to interact with our smart contracts:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <code className="text-primary">RevertPayFactory</code>: Create and manage refund policies</li>
                  <li>• <code className="text-primary">RNFTMarketplace</code>: Trade rNFTs on the secondary market</li>
                  <li>• <code className="text-primary">RefundPolicy</code>: Individual policy contracts</li>
                </ul>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Zap className="w-6 h-6 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Quick Integration</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Create a Policy</h3>
                    <p className="text-sm text-muted-foreground">
                      Deploy a refund policy contract with your desired terms: token address,
                      refund window, and restocking fee.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2. Generate Payment Links</h3>
                    <p className="text-sm text-muted-foreground">
                      Create payment links for your products. Customers receive an rNFT upon
                      payment.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">3. Handle Refunds</h3>
                    <p className="text-sm text-muted-foreground">
                      Refunds are processed automatically on-chain. No manual intervention
                      required (unless you disable auto-approve).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Security</h2>
                <p className="text-muted-foreground">
                  RevertPay contracts are audited and battle-tested. All refund logic is
                  trustless and executed on-chain. Merchants cannot freeze funds or change
                  terms after policy deployment.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-8 bg-primary/5"
          >
            <h3 className="text-xl font-bold mb-2">Need Help?</h3>
            <p className="text-muted-foreground">
              For detailed API documentation, contract ABIs, and integration examples, visit
              our GitHub repository or join our Discord community.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
