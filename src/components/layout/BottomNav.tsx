"use client";

import { type FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

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

const SettingsIcon: FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" fill={filled ? "currentColor" : "none"} />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const NAV_ITEMS = [
  { href: "/", labelKey: "home" as const, icon: HomeIcon },
  { href: "/create", labelKey: "create" as const, icon: PlusIcon, isCreate: true },
  { href: "/preview", labelKey: "preview" as const, icon: PlayIcon },
  { href: "/settings", labelKey: "settings" as const, icon: SettingsIcon },
] as const;

const BottomNav: FC = () => {
  const pathname = usePathname();
  const { t } = useI18n();

  // settings label fallback vì translations chưa có key này
  const getLabel = (key: string) => {
    if (key === "settings") return t.language.label === "Ngôn ngữ" ? "Cài đặt" : "Settings";
    return t.nav[key as keyof typeof t.nav];
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
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon, ...rest }) => {
          const isCreate = "isCreate" in rest && rest.isCreate;
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
              {isCreate ? (
                <span
                  className={cn(
                    "flex items-center justify-center w-11 h-11 rounded-2xl",
                    "bg-gradient-to-br from-[var(--brand-purple)] to-[var(--brand-pink)]",
                    "text-white shadow-lg shadow-[rgba(155,124,244,0.35)]",
                    "transition-transform duration-200 active:scale-95",
                  )}
                >
                  <Icon />
                </span>
              ) : (
                <>
                  <Icon filled={isActive} />
                  <span className="text-[10px] font-medium tracking-wide">{getLabel(labelKey)}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export { BottomNav };
