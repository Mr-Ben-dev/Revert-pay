import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2 gradient-text">{title}</h1>
          {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </motion.div>
  );
};
