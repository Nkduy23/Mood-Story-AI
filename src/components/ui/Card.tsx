"use client";

import { type FC, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "active" | "interactive";
  children: ReactNode;
}

const Card: FC<CardProps> = ({ variant = "default", className, children, ...props }) => {
  const variants = {
    default: "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
    elevated: "bg-[var(--bg-elevated)] border border-[var(--border-card)]",
    active: "bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]",
    interactive: [
      "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
      "cursor-pointer transition-all duration-200",
      "hover:border-[var(--border-card)] hover:bg-[var(--bg-elevated)]",
      "active:scale-[0.98]",
    ],
  };

  return (
    <div className={cn("rounded-2xl", variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export { Card };
export type { CardProps };
