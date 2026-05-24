"use client";

import { type FC, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button: FC<ButtonProps> = ({ variant = "primary", size = "md", isLoading = false, leftIcon, rightIcon, fullWidth = false, className, children, disabled, ...props }) => {
  const base = [
    "inline-flex items-center justify-center gap-2 font-medium rounded-2xl",
    "transition-all duration-200 active:scale-95",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-purple)]",
    "disabled:opacity-40 disabled:pointer-events-none",
    fullWidth && "w-full",
  ];

  const variants = {
    primary: ["bg-[var(--brand-purple)] text-white", "hover:bg-[#8a6be0] active:bg-[#7a5bd0]"],
    gradient: ["bg-gradient-to-r from-[var(--brand-purple)] to-[var(--brand-pink)] text-white", "hover:opacity-90 active:opacity-80", "shadow-lg shadow-[rgba(155,124,244,0.3)]"],
    secondary: ["bg-[var(--bg-elevated)] text-[var(--text-primary)]", "border border-[var(--border-card)]", "hover:border-[var(--border-active)] hover:bg-[var(--bg-elevated)]"],
    ghost: ["text-[var(--text-secondary)]", "hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"],
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export { Button };
export type { ButtonProps };
