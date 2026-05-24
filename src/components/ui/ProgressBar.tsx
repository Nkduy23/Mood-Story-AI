"use client";

import { type FC } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  variant?: "default" | "gradient";
  size?: "sm" | "md";
  className?: string;
  animated?: boolean;
}

const ProgressBar: FC<ProgressBarProps> = ({ value, label, showPercent = false, variant = "gradient", size = "md", className, animated = true }) => {
  const clamped = Math.min(100, Math.max(0, value));

  const trackSizes = {
    sm: "h-1",
    md: "h-1.5",
  };

  const fills = {
    default: "bg-[var(--brand-purple)]",
    gradient: "bg-gradient-to-r from-[var(--brand-purple)] to-[var(--brand-pink)]",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex justify-between mb-2">
          {label && <span className="text-xs text-[var(--text-secondary)]">{label}</span>}
          {showPercent && <span className="text-xs text-[var(--text-muted)] tabular-nums">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden", trackSizes[size])}>
        <div
          className={cn("h-full rounded-full", fills[variant], animated && "transition-all duration-300 ease-out")}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export { ProgressBar };
export type { ProgressBarProps };
