"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <>
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 gap-4">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]")}>
            <span className="text-2xl">⚙️</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Settings</h1>
            <p className="text-sm text-[var(--text-muted)]">Coming soon — V3</p>
          </div>
        </div>
      </MobileContainer>
      <BottomNav />
    </>
  );
}
