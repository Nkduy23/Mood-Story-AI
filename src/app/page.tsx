"use client";

import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MOOD_PACKS } from "@/features/mood-engine";

// ── Icons ────────────────────────────────────────────────────────────────────

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c-3 3-4 6-4 9s1 6 4 9M12 3c3 3 4 6 4 9s-1 6-4 9M3 12h18" />
  </svg>
);

// ── Flow Step ────────────────────────────────────────────────────────────────

interface FlowStepProps {
  number: string;
  emoji: string;
  title: string;
  desc: string;
  isLast?: boolean;
}

function FlowStep({ number, emoji, title, desc, isLast }: FlowStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
            "bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]",
            "text-[var(--brand-purple)] text-xs font-bold font-mono",
          )}
        >
          {number}
        </div>
        {!isLast && <div className="w-px h-8 mt-1 bg-gradient-to-b from-[var(--brand-purple-border)] to-transparent" />}
      </div>

      <div className={cn("pb-6", isLast && "pb-0")}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">{emoji}</span>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Mood Chip ────────────────────────────────────────────────────────────────

function MoodChip({ emoji, name, accentColor }: { emoji: string; name: string; accentColor: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl shrink-0 border" style={{ background: `${accentColor}18`, borderColor: `${accentColor}35` }}>
      <span className="text-base">{emoji}</span>
      <span className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{name}</span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  // FIX: dùng locale từ useI18n() — không dùng t.locale
  const { t, locale, setLocale } = useI18n();

  const FLOW_STEPS: FlowStepProps[] = [
    {
      number: "01",
      emoji: "📸",
      title: locale === "vi" ? "Upload khoảnh khắc" : "Upload your moments",
      desc: locale === "vi" ? "Ảnh hoặc video ngắn, tối đa 5 file · 50MB mỗi file" : "Photos or short clips, up to 5 files · 50MB each",
    },
    {
      number: "02",
      emoji: "🎨",
      title: locale === "vi" ? "Chọn mood & style" : "Pick your mood & style",
      desc: locale === "vi" ? "6 mood pack · AI tự chọn nhạc, màu sắc, chuyển cảnh" : "6 mood packs · AI picks music, color grade, transitions",
    },
    {
      number: "03",
      emoji: "✨",
      title: locale === "vi" ? "AI xử lý & export" : "AI renders & exports",
      desc: locale === "vi" ? "GPT-4o phân tích, tạo caption · xuất MP4 9:16 chuẩn reels" : "GPT-4o analyzes, writes caption · exports 9:16 MP4 for reels",
      isLast: true,
    },
  ];

  return (
    <>
      <MobileContainer>
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-5 pt-12 pb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Mood<span className="text-gradient">Story</span>
            </h1>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-md",
                "bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]",
                "text-[var(--brand-purple)] text-[9px] font-bold tracking-wider uppercase",
              )}
            >
              AI
            </span>
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl",
              "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
              "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              "text-xs font-medium transition-all duration-150 active:scale-95",
            )}
          >
            <GlobeIcon />
            <span className="uppercase font-mono">{locale}</span>
          </button>
        </header>

        {/* ── Hero ── */}
        <section className="px-5 pt-6 pb-6">
          <div className={cn("relative rounded-3xl p-6 overflow-hidden", "bg-[var(--bg-card)] border border-[var(--border-subtle)]")}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 70% 0%, rgba(155,124,244,0.2) 0%, transparent 65%)",
              }}
            />
            <div
              className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)",
              }}
            />

            <p className="relative text-[10px] font-semibold text-[var(--brand-purple)] uppercase tracking-widest mb-2 font-mono">
              {locale === "vi" ? "✦ Tạo story đẹp trong 30 giây" : "✦ Beautiful stories in 30 seconds"}
            </p>
            <h2 className="relative text-3xl font-bold text-[var(--text-primary)] leading-tight mb-3">
              {locale === "vi" ? (
                <>
                  Chỉnh ít.
                  <br />
                  <span className="text-gradient">Chất nhiều.</span>
                </>
              ) : (
                <>
                  Minimal edit.
                  <br />
                  <span className="text-gradient">Maximum vibe.</span>
                </>
              )}
            </h2>
            <p className="relative text-sm text-[var(--text-secondary)] leading-relaxed">
              {locale === "vi" ? "Upload ảnh, chọn mood — AI lo phần còn lại. Không cần biết edit." : "Upload photos, pick a mood — AI handles the rest. No editing skills needed."}
            </p>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="px-5 mb-6">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4 font-mono">{locale === "vi" ? "Cách hoạt động" : "How it works"}</p>
          <div className={cn("rounded-3xl p-5", "bg-[var(--bg-card)] border border-[var(--border-subtle)]")}>
            {FLOW_STEPS.map((step) => (
              <FlowStep key={step.number} {...step} />
            ))}
          </div>
        </section>

        {/* ── Mood preview ── */}
        <section className="mb-6">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-5 font-mono">{locale === "vi" ? "6 mood có sẵn" : "6 available moods"}</p>
          <div className="flex gap-2 px-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {MOOD_PACKS.map((pack) => (
              <MoodChip key={pack.id} emoji={pack.emoji} name={pack.name} accentColor={pack.accentColor} />
            ))}
          </div>
        </section>

        {/* ── CTA — flow tự nhiên, không sticky để không che content ── */}
        <div className="px-5 pb-4 mt-2">
          <Button variant="gradient" size="lg" fullWidth onClick={() => router.push("/create")} rightIcon={<ArrowRightIcon />} className="shadow-2xl shadow-[rgba(155,124,244,0.4)] animate-pulse-glow">
            {locale === "vi" ? "Bắt đầu tạo story" : "Start creating"}
          </Button>
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">{locale === "vi" ? "Miễn phí · Không cần đăng ký" : "Free · No sign-up required"}</p>
        </div>
      </MobileContainer>

      <BottomNav />
    </>
  );
}
