"use client";

// ============================================================
// Language Switcher Dropdown
// ============================================================

import { useState, useTransition } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface Props {
  currentLocale: Locale;
  variant?: "default" | "compact" | "ghost";
  showLabel?: boolean;
}

export function LanguageSwitcher({
  currentLocale,
  variant = "default",
  showLabel = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selecting, setSelecting] = useState<Locale | null>(null);

  const current = LOCALE_META[currentLocale];

  function handleSelect(locale: Locale) {
    if (locale === currentLocale) {
      setOpen(false);
      return;
    }
    setSelecting(locale);
    startTransition(async () => {
      try {
        await setLocale(locale);
        setOpen(false);
      } catch (err) {
        console.error("[LanguageSwitcher] setLocale failed:", err);
      } finally {
        setSelecting(null);
      }
    });
  }

  const btnClass = cn(
    "inline-flex items-center gap-1.5 rounded-lg border transition-colors",
    variant === "default" &&
      "border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50",
    variant === "compact" &&
      "border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50",
    variant === "ghost" &&
      "border-transparent px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={btnClass}
        disabled={isPending}
      >
        {variant !== "compact" && <Globe className="h-4 w-4 text-slate-500" />}
        <span className="text-base leading-none">{current.flag}</span>
        {showLabel && (
          <span className="font-medium text-slate-700">
            {current.nativeLabel}
          </span>
        )}
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {LOCALES.map((locale) => {
              const meta = LOCALE_META[locale];
              const isCurrent = locale === currentLocale;
              const isLoading = selecting === locale;
              return (
                <button
                  key={locale}
                  type="button"
                  onClick={() => handleSelect(locale)}
                  disabled={isPending}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                    isCurrent
                      ? "bg-red-50 text-[#a71d1d]"
                      : "text-slate-700 hover:bg-slate-50",
                    isPending && "cursor-wait opacity-60"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{meta.flag}</span>
                    <span className="font-medium">{meta.nativeLabel}</span>
                  </span>
                  {isLoading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  ) : isCurrent ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
