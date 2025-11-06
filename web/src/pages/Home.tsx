import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, TrendingUp, RefreshCw, ArrowRight, Check } from 'lucide-react';
import { AnimatedOrb } from '@/components/shared/AnimatedOrb';
import { GradientButton } from '@/components/shared/GradientButton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Create Refund Policy',
      description: 'Set your refund window and terms. Customers receive an rNFT on purchase.',
    },
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Accept crypto payments with built-in refund guarantees. No chargebacks.',
    },
    {
      icon: TrendingUp,
      title: 'rNFT Marketplace',
      description: 'Users can trade rNFTs at a discount before refund window expires.',
    },
    {
      icon: RefreshCw,
      title: 'Easy Refunds',
      description: 'One-click refunds within the window. Trustless and automatic.',
    },
  ];

  const benefits = [
    'No centralized intermediaries',
    'Transparent refund policies on-chain',
    'Secondary market for rNFTs',
    'Lower fees than traditional payments',
    'Programmable restocking fees',
    'Auto-approve or manual review',
  ];

  const faqs = [
    {
      question: 'What is an rNFT?',
      answer:
        'An rNFT (Refundable NFT) is a token that represents your right to request a refund within a specified time window. It can be refunded or sold on the marketplace.',
    },
    {
      question: 'How do refunds work?',
      answer:
        'Within the refund window, you can burn your rNFT to get your funds back minus any restocking fee. The process is automatic and trustless.',
    },
    {
      question: 'Can I sell my rNFT?',
      answer:
        'Yes! If you change your mind but don\'t want to refund, you can list your rNFT on the marketplace. Others can buy it at a discount.',
    },
    {
      question: 'Is this secure?',
      answer:
        'Absolutely. All logic is on-chain via smart contracts. No central party can freeze funds or change terms after purchase.',
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight">
                The Future of{' '}
                <span className="gradient-text">Payment Reversibility</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Buy with confidence. Refund with ease. Trade with freedom. RevertPay brings
                Web3 refund infrastructure to merchants and customers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/merchant/policy">
                  <GradientButton>
                    Create Policy <ArrowRight className="ml-2 w-4 h-4 inline" />
                  </GradientButton>
                </Link>
                <Link to="/me">
                  <GradientButton variant="secondary">Try Demo</GradientButton>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatedOrb />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to enable refundable payments
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card rounded-xl p-6 text-center transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,255,0.2)]"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Wins */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              Why <span className="gradient-text">RevertPay</span> Wins
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 glass-card rounded-lg p-4"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glass-card rounded-lg px-6 border-0"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-12 text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              Ready to Get <span className="gradient-text">Started?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the future of refundable payments. Create your first policy in minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/merchant/policy">
                <GradientButton>
                  Create Your First Policy <ArrowRight className="ml-2 w-4 h-4 inline" />
                </GradientButton>
              </Link>
              <Link to="/docs">
                <GradientButton variant="secondary">Read the Docs</GradientButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
