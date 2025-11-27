import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon | ReactNode;
  subtitle?: string;
  trend?: ReactNode;
  trendUp?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendUp,
}: StatCardProps) => {
  // Check if icon is a Lucide component (function or forwardRef object) or a ReactNode
  const isLucideIcon =
    typeof icon === "function" ||
    (typeof icon === "object" &&
      icon !== null &&
      "$$typeof" in icon &&
      "render" in icon);

  // Render the icon
  const renderIcon = () => {
    if (isLucideIcon) {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className="w-6 h-6 text-primary" />;
    }
    return <div className="text-primary">{icon}</div>;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,255,0.2)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold font-heading mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={`mt-2 text-xs ${
                trendUp ? "text-green-400" : "text-red-400"
              }`}
            >
              {trend}
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">{renderIcon()}</div>
      </div>
    </motion.div>
  );
};
