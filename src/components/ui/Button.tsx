"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const variants = {
      primary: "bg-lumiere-rose text-lumiere-light hover:bg-lumiere-roseDark",
      secondary: "bg-lumiere-charcoal text-lumiere-light hover:bg-lumiere-muted",
      ghost: "bg-transparent text-lumiere-charcoal hover:bg-lumiere-warm",
      outline: "bg-transparent border-2 border-lumiere-charcoal text-lumiere-charcoal hover:bg-lumiere-charcoal hover:text-lumiere-light",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "rounded-full font-medium transition-colors duration-300",
          variants[variant],
          sizes[size],
          className
        )}
        type={props.type || "button"}
        disabled={props.disabled}
        onClick={props.onClick}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";