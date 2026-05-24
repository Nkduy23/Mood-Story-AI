"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { useI18n } from "@/lib/i18n";

export default function PreviewPage() {
  const { t } = useI18n();

  return (
    <>
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 gap-4">
          <span className="text-4xl">🎬</span>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t.preview.title}</h1>
            <p className="text-sm text-[var(--text-muted)]">Coming soon — V1.4 Preview & Export</p>
          </div>
        </div>
      </MobileContainer>
      <BottomNav />
    </>
  );
}
