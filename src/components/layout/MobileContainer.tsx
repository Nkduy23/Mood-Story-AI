"use client";

import { type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  /** Có padding bottom cho BottomNav không (default: true) */
  withNav?: boolean;
}

/**
 * Wrapper chính của app.
 * Max width 430px, centered, safe area insets.
 * Tất cả pages đều wrap trong component này.
 */
const MobileContainer: FC<MobileContainerProps> = ({ children, className, withNav = true }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex justify-center">
      <div className={cn("relative w-full max-w-[430px] min-h-screen", "flex flex-col", "overflow-x-hidden", withNav && "pb-[calc(var(--nav-height)+var(--safe-bottom))]", className)}>{children}</div>
    </div>
  );
};

export { MobileContainer };
