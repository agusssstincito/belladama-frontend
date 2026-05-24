"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full rounded-2xl border-2 border-lumiere-warm bg-lumiere-light px-4 py-3 text-lumiere-charcoal placeholder:text-lumiere-muted focus:border-lumiere-rose focus:outline-none focus:ring-2 focus:ring-lumiere-rose/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-lumiere-rose focus:border-lumiere-rose",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-lumiere-rose">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";