"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MOOD_PACKS, STORY_TYPE_CONFIGS, type StoryType } from "@/features/mood-engine";
import { useUpload, UploadZone, MediaPreview } from "@/features/upload";
import { useUploadStore } from "@/store/uploadStore";
import { useEditorStore } from "@/store/editorStore";

// ── Icons ────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

// ── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i < current ? "w-4 h-1.5 bg-[var(--brand-purple)] opacity-50" : i === current ? "w-6 h-1.5 bg-[var(--brand-purple)]" : "w-1.5 h-1.5 bg-[var(--border-card)]",
          )}
        />
      ))}
    </div>
  );
}

// ── Step 1: Story Type ───────────────────────────────────────────────────────

function StepStoryType({ selected, onSelect }: { selected: StoryType | null; onSelect: (t: StoryType) => void }) {
  const { t, locale } = useI18n();

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-0.5">{t.home.pickType}</h2>
        <p className="text-xs text-[var(--text-muted)]">{locale === "vi" ? "Chọn loại story bạn muốn tạo" : "Choose the type of story"}</p>
      </div>
      {(Object.keys(STORY_TYPE_CONFIGS) as StoryType[]).map((typeId) => {
        const config = STORY_TYPE_CONFIGS[typeId];
        const typeT = t.storyTypes[typeId];
        const isSelected = selected === typeId;
        return (
          <button
            key={typeId}
            onClick={() => onSelect(typeId)}
            className={cn(
              "flex items-center gap-3 p-3.5 rounded-2xl text-left w-full",
              "border transition-all duration-200 active:scale-[0.98]",
              isSelected ? "bg-[var(--brand-purple-dim)] border-[var(--brand-purple-border)]" : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-card)]",
            )}
          >
            <span className="text-2xl shrink-0">{config.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold", isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{typeT.name}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{typeT.description}</p>
              <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{typeT.hint}</p>
            </div>
            {isSelected && <span className="w-2 h-2 rounded-full bg-[var(--brand-purple)] shrink-0" style={{ boxShadow: "0 0 6px var(--brand-purple)" }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── Step 2: Mood Pack ────────────────────────────────────────────────────────

function StepMoodPack({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const { t, locale } = useI18n();

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-0.5">{t.home.pickMood}</h2>
        <p className="text-xs text-[var(--text-muted)]">{locale === "vi" ? "Mỗi mood tạo ra cảm giác khác nhau" : "Each mood creates a different feeling"}</p>
      </div>
      {MOOD_PACKS.map((pack) => {
        const moodT = t.moods[pack.id as keyof typeof t.moods];
        const isSelected = selected === pack.id;
        return (
          <button
            key={pack.id}
            onClick={() => onSelect(pack.id)}
            className={cn("flex items-center gap-3 p-3.5 rounded-2xl text-left w-full", "border transition-all duration-200 active:scale-[0.98]")}
            style={
              isSelected
                ? { background: `linear-gradient(135deg, ${pack.accentColor}20 0%, var(--bg-card) 100%)`, borderColor: `${pack.accentColor}50` }
                : { background: "var(--bg-card)", borderColor: "var(--border-subtle)" }
            }
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl text-lg shrink-0" style={{ background: `${pack.accentColor}22` }}>
              {pack.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold", isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{moodT?.name ?? pack.name}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{moodT?.description ?? ""}</p>
            </div>
            {isSelected && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: pack.accentColor, boxShadow: `0 0 6px ${pack.accentColor}` }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── Step 3: Upload ───────────────────────────────────────────────────────────

function StepUpload() {
  const { t } = useI18n();
  const { files, storyType, maxFiles, addFiles, removeFile, reorderFiles } = useUpload();

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-0.5">{t.upload.title}</h2>
        <p className="text-xs text-[var(--text-muted)]">{t.upload.subtitle}</p>
      </div>
      <UploadZone fileCount={files.length} maxFiles={maxFiles} storyType={storyType} onFilesSelected={addFiles} />
      {files.length > 0 && <MediaPreview files={files} storyType={storyType} onRemove={removeFile} onReorder={reorderFiles} />}
      {storyType === "journey" && files.length >= 2 && (
        <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl", "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]")}>
          <span className="text-[var(--brand-purple)] shrink-0">
            <SparkleIcon />
          </span>
          <p className="text-xs text-[var(--text-muted)]">AI sẽ sắp xếp lại thứ tự tốt nhất. Bạn cũng có thể kéo để tự sắp xếp.</p>
        </div>
      )}
    </div>
  );
}

// ── Main Wizard Page ─────────────────────────────────────────────────────────

const TOTAL_STEPS = 3;

export default function CreatePage() {
  const router = useRouter();
  const { t } = useI18n();

  const [step, setStep] = useState(0);
  const [localType, setLocalType] = useState<StoryType | null>(null);
  const [localMood, setLocalMood] = useState<string | null>(null);

  const setStoryType = useUploadStore((s) => s.setStoryType);
  const selectMoodPack = useEditorStore((s) => s.selectMoodPack);
  const { files } = useUpload();

  const handleBack = () => {
    if (step === 0) router.push("/");
    else setStep((s) => s - 1);
  };

  const handleNext = () => {
    if (step === 0 && localType) {
      setStoryType(localType);
      setStep(1);
    } else if (step === 1 && localMood) {
      selectMoodPack(localMood);
      setStep(2);
    } else if (step === 2) router.push("/preview");
  };

  const doneFiles = files.filter((f) => f.status === "done");
  const isUploading = files.some((f) => f.status === "uploading");
  const canNext = (step === 0 && localType !== null) || (step === 1 && localMood !== null) || (step === 2 && doneFiles.length > 0 && !isUploading);

  const ctaLabel = () => {
    if (step === 2) {
      if (isUploading) return t.upload.processing;
      return doneFiles.length > 0 ? `${t.home.continueBtn} · ${doneFiles.length} file` : t.upload.selectPrompt;
    }
    return t.home.continueBtn;
  };

  // ── Nav height: 64px (--nav-height) ──
  // Dùng h-dvh thay vì min-h-screen để có height cố định,
  // flex col để header + content + cta luôn trong viewport

  return (
    <>
      {/* 
        Outer: center max-w-[430px] như MobileContainer
        Inner: h-dvh fixed height, flex col
               → header pin top, CTA pin bottom, content scroll giữa
      */}
      <div className="min-h-dvh bg-[var(--bg-base)] flex justify-center">
        <div className="relative w-full max-w-[430px] flex flex-col" style={{ height: "100dvh", paddingBottom: "calc(var(--nav-height) + var(--safe-bottom))" }}>
          {/* ── Header — luôn ở top ── */}
          <header className="shrink-0 flex items-center justify-between px-5 pt-10 pb-3 border-b border-[var(--border-subtle)]">
            <button
              onClick={handleBack}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
                "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                "transition-all duration-150 active:scale-90",
              )}
              aria-label="Quay lại"
            >
              <ArrowLeftIcon />
            </button>
            <StepIndicator current={step} total={TOTAL_STEPS} />
            <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums">
              {step + 1} / {TOTAL_STEPS}
            </span>
          </header>

          {/* ── Scrollable content — flex-1 + overflow-y-auto ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {step === 0 && <StepStoryType selected={localType} onSelect={setLocalType} />}
            {step === 1 && <StepMoodPack selected={localMood} onSelect={setLocalMood} />}
            {step === 2 && <StepUpload />}
          </div>

          {/* ── CTA — luôn ở bottom, không bị đẩy ra ngoài ── */}
          <div className="shrink-0 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <Button
              variant="gradient"
              size="lg"
              fullWidth
              disabled={!canNext}
              isLoading={isUploading}
              onClick={handleNext}
              rightIcon={!isUploading ? <ArrowRightIcon /> : undefined}
              className={cn("shadow-xl shadow-[rgba(155,124,244,0.3)]", "transition-all duration-300", canNext && !isUploading && "animate-pulse-glow")}
            >
              {ctaLabel()}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}
