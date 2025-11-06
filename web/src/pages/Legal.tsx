import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';

const Legal = () => {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <PageHeader
          title="Legal & Terms"
          subtitle="Terms of Service and Privacy Policy"
        />

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                By using RevertPay, you agree to these terms. RevertPay is a decentralized
                protocol for refundable payments. We do not custody funds or control smart
                contracts after deployment.
              </p>
              <h3 className="text-lg font-semibold text-foreground">Merchant Obligations</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Honor refund policies as defined in your smart contracts</li>
                <li>Ensure adequate liquidity for refunds in your vault</li>
                <li>Comply with local regulations regarding payments and refunds</li>
              </ul>
              <h3 className="text-lg font-semibold text-foreground">Customer Rights</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Request refunds within the specified window</li>
                <li>Trade rNFTs on the marketplace</li>
                <li>Transfer rNFTs to other addresses</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                RevertPay is a non-custodial protocol. We do not collect personal information
                or control user funds. All transactions are on-chain and publicly visible.
              </p>
              <h3 className="text-lg font-semibold text-foreground">Data We Collect</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>On-chain transaction data (public blockchain data)</li>
                <li>Usage analytics (anonymized)</li>
              </ul>
              <h3 className="text-lg font-semibold text-foreground">Data We Don't Collect</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Private keys or seed phrases</li>
                <li>Personal identifying information</li>
                <li>Financial data beyond what's on-chain</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-4">Disclaimers</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                RevertPay smart contracts are provided "as is" without warranties. Users
                assume all risks associated with cryptocurrency transactions. We are not
                liable for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Smart contract bugs or vulnerabilities</li>
                <li>Blockchain network failures</li>
                <li>Loss of funds due to user error</li>
                <li>Regulatory changes affecting cryptocurrency use</li>
              </ul>
            </div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-8 bg-muted/30"
          >
            <p className="text-sm text-muted-foreground">
              Last updated: November 2025. These terms may be updated
              periodically. Continued use of RevertPay constitutes acceptance of changes.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
