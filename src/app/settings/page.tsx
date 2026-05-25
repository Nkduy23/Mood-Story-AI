"use client";

import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useEditorStore, useExportStore, useSettingsStore, useUploadStore } from "@/store";
import { SOCIAL_LINKS } from "@/constants/social";
import { useRouter } from "next/navigation";

function AboutModal({ open, onClose, isVi }: { open: boolean; onClose: () => void; isVi: boolean }) {
  if (!open) return null;
  return (
    // faux viewport để modal không collapse layout
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(8,8,15,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div
        className={cn("w-full max-w-[430px] rounded-t-3xl pt-6 px-6", "bg-[var(--bg-elevated)] border-t border-[var(--border-card)]", "animate-fade-in-up")}
        style={{ paddingBottom: "calc(var(--nav-height) + var(--safe-bottom) + 24px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-[var(--border-card)] mx-auto mb-6" />

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl", "bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]")}>🎞️</div>
          <div className="text-center">
            <p className="text-xl font-bold text-gradient">MoodStory</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">v1.0.0</p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          {isVi ? "Tạo story aesthetic chỉ trong vài giây.\nChọn mood, upload ảnh — AI làm phần còn lại." : "Create aesthetic stories in seconds.\nPick a mood, upload photos — AI does the rest."}
        </p>

        {/* Info rows */}
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden mb-4">
          {[
            { label: isVi ? "Phiên bản" : "Version", value: "1.0.0" },
            { label: isVi ? "Tác giả" : "Made by", value: "NK" },
            { label: "Stack", value: "Next.js · Claude AI" },
            { label: isVi ? "Giấy phép" : "License", value: "MIT" },
          ].map((row, i, arr) => (
            <div key={row.label} className={cn("flex items-center justify-between px-4 py-3 text-sm", i < arr.length - 1 && "border-b border-[var(--border-subtle)]")}>
              <span className="text-[var(--text-muted)]">{row.label}</span>
              <span className="text-[var(--text-secondary)] font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className={cn(
            "w-full py-3 rounded-2xl text-sm font-semibold",
            "bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]",
            "text-[var(--brand-purple)] transition-all active:scale-95",
          )}
        >
          {isVi ? "Đóng" : "Close"}
        </button>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-muted)] mt-5 mb-2 px-1">{children}</p>;
}

function RowGroup({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden">{children}</div>;
}

interface RowProps {
  icon: string;
  iconBg?: string;
  title: string;
  desc?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

function Row({ icon, iconBg = "bg-[var(--brand-purple-dim)] text-[var(--brand-purple)]", title, desc, right, danger, onClick }: RowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left",
        "border-b border-[var(--border-subtle)] last:border-b-0",
        "transition-colors duration-150 active:bg-[var(--bg-elevated)]",
        onClick && "cursor-pointer",
      )}
    >
      <span className={cn("w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-sm shrink-0", iconBg)}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", danger ? "text-red-400" : "text-[var(--text-primary)]")}>{title}</p>
        {desc && <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">{right}</div>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "w-11 h-6 rounded-full relative transition-colors duration-200",
        "border",
        on ? "bg-[var(--brand-purple)] border-[var(--brand-purple)]" : "bg-[var(--bg-elevated)] border-[var(--border-card)]",
      )}
    >
      <span className={cn("absolute top-[3px] w-[18px] h-[18px] rounded-full transition-all duration-200", on ? "left-[calc(100%-21px)] bg-white" : "left-[3px] bg-[var(--text-muted)]")} />
    </button>
  );
}

function LangPills({ locale, setLocale }: { locale: string; setLocale: (l: any) => void }) {
  return (
    <div className="flex gap-1.5">
      {(["vi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={(e) => {
            e.stopPropagation();
            setLocale(l);
          }}
          className={cn(
            "px-3 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150",
            locale === l ? "bg-[var(--brand-purple-dim)] border-[var(--brand-purple-border)] text-[var(--brand-purple)]" : "bg-transparent border-[var(--border-card)] text-[var(--text-muted)]",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { darkMode, toggleDarkMode } = useSettingsStore();
  const router = useRouter();
  const resetUpload = useUploadStore((s) => s.reset);
  const resetEditor = useEditorStore((s) => s.reset);
  const resetExport = useExportStore((s) => s.reset);
  const [showAbout, setShowAbout] = useState(false);

  const isVi = locale === "vi";

  const handleClearData = () => {
    if (!confirm(isVi ? "Xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác." : "Clear all data? This cannot be undone.")) return;
    resetUpload();
    resetEditor();
    resetExport();
    localStorage.removeItem("ms-settings");
    router.push("/");
  };

  return (
    <>
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} isVi={isVi} />;
      <MobileContainer>
        {/* Header */}
        <header className="px-5 pt-12 pb-5 border-b border-[var(--border-subtle)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{isVi ? "Cài đặt" : "Settings"}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">{isVi ? "Tuỳ chỉnh trải nghiệm của bạn" : "Customize your experience"}</p>
        </header>

        <div className="px-5 pb-8 animate-fade-in-up">
          {/* Appearance */}
          <SectionLabel>{isVi ? "Giao diện" : "Appearance"}</SectionLabel>
          <RowGroup>
            <Row icon="🌙" title="Dark mode" desc={isVi ? "Giao diện tối mặc định" : "Default dark interface"} right={<Toggle on={darkMode} onToggle={toggleDarkMode} />} />{" "}
            <Row icon="🌐" title={isVi ? "Ngôn ngữ" : "Language"} desc="Language / Ngôn ngữ" right={<LangPills locale={locale} setLocale={setLocale} />} />
          </RowGroup>

          {/* App info */}
          <SectionLabel>{isVi ? "Ứng dụng" : "App"}</SectionLabel>
          <RowGroup>
            <Row
              icon="✨"
              title={isVi ? "Về MoodStory" : "About MoodStory"}
              desc="Version, changelog"
              right={
                <>
                  <span className="text-xs text-[var(--text-muted)]">v1.0.0</span>
                  <ChevronIcon />
                </>
              }
              onClick={() => setShowAbout(true)}
            />
            <Row
              icon="📜"
              iconBg="bg-[rgba(52,211,153,0.12)] text-emerald-400"
              title={isVi ? "Điều khoản & Riêng tư" : "Terms & Privacy"}
              right={<ChevronIcon />}
              onClick={() => router.push("/terms")}
            />
          </RowGroup>

          {/* Social */}
          <SectionLabel>{isVi ? "Kết nối" : "Connect"}</SectionLabel>
          <div className="flex gap-2.5">
            {[
              {
                label: "Twitter / X",
                icon: "𝕏",
                href: SOCIAL_LINKS.twitter,
                style: {
                  background: "#000",
                  borderColor: "#333",
                  color: "#fff",
                },
              },
              {
                label: "Instagram",
                icon: "📸",
                href: SOCIAL_LINKS.instagram,
                style: {
                  background: "linear-gradient(135deg, #f472b6 0%, #fb923c 100%)",
                  borderColor: "transparent",
                  color: "#fff",
                },
              },
              {
                label: isVi ? "Góp ý" : "Feedback",
                icon: "💬",
                href: SOCIAL_LINKS.feedback,
                style: {
                  background: "var(--brand-purple-dim)",
                  borderColor: "var(--brand-purple-border)",
                  color: "var(--brand-purple)",
                },
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl", "border text-xs font-medium transition-all duration-150 active:scale-95")}
                style={s.style}
              >
                <span className="text-base">{s.icon}</span>
                {s.label}
              </a>
            ))}
          </div>

          {/* Data */}
          <SectionLabel>{isVi ? "Dữ liệu" : "Data"}</SectionLabel>
          <RowGroup>
            <Row
              icon="🗑"
              iconBg="bg-[rgba(248,113,113,0.12)] text-red-400"
              title={isVi ? "Xóa toàn bộ dữ liệu" : "Clear all data"}
              desc={isVi ? "Xóa story, cache, cài đặt đã lưu" : "Stories, cache, saved settings"}
              danger
              right={<ChevronIcon />}
              onClick={handleClearData}
            />
          </RowGroup>

          {/* Footer */}
          <div className="flex flex-col items-center gap-1.5 mt-8">
            <p className="text-sm font-bold text-gradient">MoodStory</p>
            <p className="text-[11px] text-[var(--text-muted)]">v1.0.0 · {t.appTagline}</p>
          </div>
        </div>
      </MobileContainer>
      <BottomNav />
    </>
  );
}
