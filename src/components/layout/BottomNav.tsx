"use client";

import { type FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// Simple SVG icons — không dùng icon lib để giữ bundle nhỏ
const HomeIcon: FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" fill={filled ? "currentColor" : "none"} />
    {!filled && <path d="M9 21V12h6v9" />}
  </svg>
);

const PlusIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const PlayIcon: FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" fill={filled ? "currentColor" : "none"} />
    {!filled && <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />}
    {filled && <path d="M10 8l6 4-6 4V8z" fill="white" stroke="none" />}
  </svg>
);

const GlobeIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c-3 3-4 6-4 9s1 6 4 9M12 3c3 3 4 6 4 9s-1 6-4 9M3 12h18" />
  </svg>
);

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useI18n>["t"]["nav"];
  icon: FC<{ filled?: boolean }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "home", icon: HomeIcon },
  { href: "/create", labelKey: "create", icon: PlusIcon },
  { href: "/preview", labelKey: "preview", icon: PlayIcon },
];

const BottomNav: FC = () => {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === "vi" ? "en" : "vi");
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2",
        "w-full max-w-[430px]",
        "bg-[var(--bg-base)]/90 backdrop-blur-xl",
        "border-t border-[var(--border-subtle)]",
        "pb-[var(--safe-bottom)]",
        "z-50",
      )}
      style={{ height: "calc(var(--nav-height) + var(--safe-bottom))" }}
    >
      <div className="flex items-center h-[var(--nav-height)] px-2">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 h-full",
                "transition-colors duration-200",
                isActive ? "text-[var(--brand-purple)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              )}
            >
              {/* Create button gets special treatment */}
              {href === "/create" ? (
                <span
                  className={cn(
                    "flex items-center justify-center w-11 h-11 rounded-2xl",
                    "bg-gradient-to-br from-[var(--brand-purple)] to-[var(--brand-pink)]",
                    "text-white shadow-lg shadow-[rgba(155,124,244,0.35)]",
                    "transition-transform duration-200 active:scale-95",
                  )}
                >
                  <Icon filled={isActive} />
                </span>
              ) : (
                <>
                  <Icon filled={isActive} />
                  <span className="text-[10px] font-medium tracking-wide">{t.nav[labelKey]}</span>
                </>
              )}
            </Link>
          );
        })}

        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className={cn("flex flex-col items-center justify-center gap-1 px-3 h-full", "text-[var(--text-muted)] hover:text-[var(--text-secondary)]", "transition-colors duration-200")}
          aria-label={t.language.label}
          title={t.language.label}
        >
          <GlobeIcon />
          <span className="text-[10px] font-medium tracking-wide uppercase">{locale}</span>
        </button>
      </div>
    </nav>
  );
};

export { BottomNav };
