"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "sale" | "new" | "gold";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    default: "bg-lumiere-charcoal text-lumiere-light",
    sale: "bg-lumiere-rose text-lumiere-light",
    new: "bg-lumiere-gold text-lumiere-light",
    gold: "bg-lumiere-gold text-lumiere-charcoal",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.span>
  );
}