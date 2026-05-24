"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MOOD_PACKS, STORY_TYPE_CONFIGS, type StoryType } from "@/features/mood-engine";
import { useEditorStore } from "@/store/editorStore";
import { useUploadStore } from "@/store/uploadStore";

// ── Inline SVG icons ────────────────────────────────────────────────────────

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ShuffleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);

// ── Story Type Card ──────────────────────────────────────────────────────────

interface StoryTypeCardProps {
  typeId: StoryType;
  isSelected: boolean;
  onSelect: () => void;
}

function StoryTypeCard({ typeId, isSelected, onSelect }: StoryTypeCardProps) {
  const { t } = useI18n();
  const config = STORY_TYPE_CONFIGS[typeId];
  const typeT = t.storyTypes[typeId];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-start gap-1.5 p-4 rounded-2xl text-left",
        "border transition-all duration-200 active:scale-[0.97]",
        isSelected ? "bg-[var(--brand-purple-dim)] border-[var(--brand-purple-border)]" : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-card)]",
      )}
    >
      {/* Selected indicator */}
      {isSelected && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--brand-purple)]" style={{ boxShadow: "0 0 6px var(--brand-purple)" }} />}

      <span className="text-xl">{config.emoji}</span>

      <div>
        <p className={cn("text-sm font-semibold leading-tight", isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{typeT.name}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{typeT.description}</p>
      </div>

      <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{typeT.hint}</span>
    </button>
  );
}

// ── Mood Pack Card ───────────────────────────────────────────────────────────

interface MoodCardProps {
  moodId: string;
  emoji: string;
  accentColor: string;
  isSelected: boolean;
  onSelect: () => void;
}

function MoodCard({ moodId, emoji, accentColor, isSelected, onSelect }: MoodCardProps) {
  const { t } = useI18n();
  const moodT = t.moods[moodId as keyof typeof t.moods];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex items-center gap-3 p-3.5 rounded-2xl text-left w-full",
        "border transition-all duration-200 active:scale-[0.97]",
        isSelected ? "border-[var(--brand-purple-border)]" : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-card)]",
      )}
      style={
        isSelected
          ? {
              background: `linear-gradient(135deg, ${accentColor}22 0%, var(--bg-card) 100%)`,
              borderColor: `${accentColor}60`,
            }
          : {}
      }
    >
      {/* Emoji dot */}
      <span className="flex items-center justify-center w-9 h-9 rounded-xl text-lg shrink-0" style={{ background: `${accentColor}25` }}>
        {emoji}
      </span>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium leading-tight truncate", isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{moodT?.name ?? moodId}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{moodT?.description ?? ""}</p>
      </div>

      {/* Selected dot */}
      {isSelected && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />}
    </button>
  );
}

// ── Recent Story Placeholder ─────────────────────────────────────────────────

function RecentStories() {
  const { t } = useI18n();

  // V1: chưa có storage → hiện empty state đẹp
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center">
        <span className="text-2xl opacity-40">🎞️</span>
      </div>
      <p className="text-sm text-[var(--text-muted)] text-center">{t.home.noRecent}</p>
    </div>
  );
}

// ── Main Home Page ───────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();

  const [selectedType, setSelectedType] = useState<StoryType | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const setStoryType = useUploadStore((s) => s.setStoryType);
  const selectMoodPack = useEditorStore((s) => s.selectMoodPack);

  const canContinue = selectedType !== null && selectedMood !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    setStoryType(selectedType);
    selectMoodPack(selectedMood);
    router.push("/create");
  };

  return (
    <>
      <MobileContainer>
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Mood<span className="text-gradient">Story</span>
              </h1>
              <span
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full",
                  "bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]",
                  "text-[var(--brand-purple)] text-[10px] font-medium",
                )}
              >
                <SparkleIcon />
                {t.home.badge}
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{t.appTagline}</p>
          </div>
        </header>

        {/* ── Hero greeting ── */}
        <section className="px-5 mb-6">
          <div className={cn("relative rounded-3xl p-5 overflow-hidden", "bg-[var(--bg-card)] border border-[var(--border-subtle)]")}>
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 80% 20%, rgba(155,124,244,0.3) 0%, transparent 60%)",
              }}
            />
            <p className="relative text-2xl font-bold text-[var(--text-primary)] leading-tight mb-1">{t.home.greeting}</p>
            <p className="relative text-sm text-[var(--text-secondary)]">{t.home.subtitle}</p>
          </div>
        </section>

        {/* ── Step 1: Story Type ── */}
        <section className="px-5 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">01 — {t.home.pickType}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(STORY_TYPE_CONFIGS) as StoryType[]).map((typeId) => (
              <StoryTypeCard key={typeId} typeId={typeId} isSelected={selectedType === typeId} onSelect={() => setSelectedType(typeId)} />
            ))}
          </div>
        </section>

        {/* ── Step 2: Mood Pack ── */}
        <section className="px-5 mb-6 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">02 — {t.home.pickMood}</h2>
          </div>
          <div className="flex flex-col gap-2">
            {MOOD_PACKS.map((pack) => (
              <MoodCard key={pack.id} moodId={pack.id} emoji={pack.emoji} accentColor={pack.accentColor} isSelected={selectedMood === pack.id} onSelect={() => setSelectedMood(pack.id)} />
            ))}
          </div>
        </section>

        {/* ── Recent Stories ── */}
        <section className="px-5 mb-6 animate-fade-in-up delay-200">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">{t.home.recentStories}</h2>
          <RecentStories />
        </section>

        {/* ── CTA — sticky bottom above nav ── */}
        <div className="sticky bottom-[calc(var(--nav-height)+var(--safe-bottom)+12px)] px-5 pb-2 z-10">
          <Button
            variant="gradient"
            size="lg"
            fullWidth
            disabled={!canContinue}
            onClick={handleContinue}
            rightIcon={<ArrowRightIcon />}
            className={cn("shadow-2xl shadow-[rgba(155,124,244,0.4)]", "transition-all duration-300", canContinue && "animate-pulse-glow")}
          >
            {t.home.continueBtn}
          </Button>
        </div>
      </MobileContainer>

      <BottomNav />
    </>
  );
}
