"use client";

import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MOOD_PACKS } from "@/features/mood-engine";

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

// ── Feature Highlight Card ───────────────────────────────────────────────────

interface FeatureCardProps {
  emoji: string;
  title: string;
  desc: string;
  accentColor: string;
}

function FeatureCard({ emoji, title, desc, accentColor }: FeatureCardProps) {
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-2xl", "bg-[var(--bg-card)] border border-[var(--border-subtle)]")}>
      <span className="flex items-center justify-center w-9 h-9 rounded-xl text-lg shrink-0" style={{ background: `${accentColor}20` }}>
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{title}</p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();

  const isVi = locale === "vi";

  const FLOW_STEPS = [
    { number: "01", emoji: "📸", title: isVi ? "Upload ảnh / video" : "Upload photos / videos" },
    { number: "02", emoji: "🎨", title: isVi ? "Chọn mood & style" : "Pick mood & style" },
    { number: "03", emoji: "✨", title: isVi ? "AI xử lý & export" : "AI renders & exports" },
  ];

  const FEATURES: FeatureCardProps[] = isVi
    ? [
        {
          emoji: "🧠",
          title: "AI hiểu nội dung ảnh",
          desc: "GPT-4o Vision phân tích từng frame — không cắt lung tung như TikTok AutoCut.",
          accentColor: "#9b7cf4",
        },
        {
          emoji: "🎬",
          title: "Chuyển cảnh đúng beat nhạc",
          desc: "Transition rơi đúng beat drop, không phải chia đều thủ công.",
          accentColor: "#f472b6",
        },
        {
          emoji: "✍️",
          title: "Caption từ ảnh thật",
          desc: "AI đọc nội dung ảnh và tự viết caption phù hợp mood — không phải text generic.",
          accentColor: "#4a9af4",
        },
      ]
    : [
        {
          emoji: "🧠",
          title: "AI reads your photos",
          desc: "GPT-4o Vision analyzes every frame — picks the best moment, not random cuts.",
          accentColor: "#9b7cf4",
        },
        {
          emoji: "🎬",
          title: "Transitions on the beat",
          desc: "Scene changes land exactly on beat drops — no manual timing needed.",
          accentColor: "#f472b6",
        },
        {
          emoji: "✍️",
          title: "Captions from your actual photos",
          desc: "AI reads your image and writes a fitting caption — not generic filler text.",
          accentColor: "#4a9af4",
        },
      ];

  return (
    <>
      <MobileContainer>
        {/* ── Header ── */}
        <header className="shrink-0 flex items-center justify-between px-5 pt-10 pb-4">
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
          <button
            onClick={() => setLocale(isVi ? "en" : "vi")}
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
        <section className="px-5 pb-5">
          <div className={cn("relative rounded-3xl px-5 py-5 overflow-hidden", "bg-[var(--bg-card)] border border-[var(--border-subtle)]")}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 80% 10%, rgba(155,124,244,0.25) 0%, transparent 60%)",
              }}
            />
            <div
              className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)",
              }}
            />
            <p className="relative text-[9px] font-semibold text-[var(--brand-purple)] uppercase tracking-widest mb-2 font-mono">
              {isVi ? "✦ Tạo story đẹp trong 30 giây" : "✦ Beautiful stories in 30 seconds"}
            </p>
            <h2 className="relative text-2xl font-bold text-[var(--text-primary)] leading-tight mb-2">
              {isVi ? (
                <>
                  {`Chỉnh ít. `}
                  <span className="text-gradient">Chất nhiều.</span>
                </>
              ) : (
                <>
                  {`Minimal edit. `}
                  <span className="text-gradient">Maximum vibe.</span>
                </>
              )}
            </h2>
            <p className="relative text-xs text-[var(--text-secondary)] leading-relaxed">
              {isVi ? "Upload ảnh, chọn mood — AI lo phần còn lại." : "Upload photos, pick a mood — AI handles the rest."}
            </p>
          </div>
        </section>

        {/* ── How it works — 3 steps horizontal ── */}
        <section className="px-5 pb-5">
          <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 font-mono">{isVi ? "Cách hoạt động" : "How it works"}</p>
          <div className="grid grid-cols-3 gap-2">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.number} className={cn("relative flex flex-col items-center gap-2 p-3 rounded-2xl text-center", "bg-[var(--bg-card)] border border-[var(--border-subtle)]")}>
                {i < FLOW_STEPS.length - 1 && <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px] z-10">›</span>}
                <span className="text-xl">{step.emoji}</span>
                <div>
                  <span className="block text-[8px] font-mono text-[var(--brand-purple)] mb-0.5">{step.number}</span>
                  <p className="text-[10px] font-medium text-[var(--text-secondary)] leading-tight">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-5 pb-5">
          <Button variant="gradient" size="lg" fullWidth onClick={() => router.push("/create")} rightIcon={<ArrowRightIcon />} className="shadow-2xl shadow-[rgba(155,124,244,0.4)] animate-pulse-glow">
            {isVi ? "Bắt đầu tạo story" : "Start creating"}
          </Button>
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">{isVi ? "Miễn phí · Không cần đăng ký" : "Free · No sign-up required"}</p>
        </section>

        {/* ── Feature Highlights ── */}
        <section className="px-5 pb-5">
          <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 font-mono">{isVi ? "Khác gì TikTok AutoCut?" : "What makes it different?"}</p>
          <div className="flex flex-col gap-2">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* ── Mood preview ── */}
        <section className="pb-6">
          <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-5 font-mono">{isVi ? "6 mood có sẵn" : "6 available moods"}</p>
          <div className="flex gap-2 px-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {MOOD_PACKS.map((pack) => (
              <div key={pack.id} className="flex items-center gap-2 px-3 py-2 rounded-2xl shrink-0 border" style={{ background: `${pack.accentColor}18`, borderColor: `${pack.accentColor}35` }}>
                <span className="text-base">{pack.emoji}</span>
                <span className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">{pack.name}</span>
              </div>
            ))}
          </div>
        </section>
      </MobileContainer>

      <BottomNav />
    </>
  );
}
