import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export const GradientButton = ({
  children,
  onClick,
  variant = 'primary',
  className,
  disabled,
  type = 'button',
  ...props
}: GradientButtonProps) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative overflow-hidden font-semibold transition-all duration-300',
          variant === 'primary' &&
            'bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]',
          variant === 'secondary' &&
            'bg-gradient-to-r from-secondary to-primary text-secondary-foreground hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};
