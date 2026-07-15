// ============================================================
// i18n Configuration
// ============================================================

export const LOCALES = ["ko", "en", "zh", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "sangsepage-locale";

export const LOCALE_META: Record<
  Locale,
  { flag: string; label: string; nativeLabel: string }
> = {
  ko: { flag: "🇰🇷", label: "Korean", nativeLabel: "한국어" },
  en: { flag: "🇺🇸", label: "English", nativeLabel: "English" },
  zh: { flag: "🇨🇳", label: "Chinese", nativeLabel: "中文" },
  ja: { flag: "🇯🇵", label: "Japanese", nativeLabel: "日本語" },
};

export function isValidLocale(locale: string | undefined): locale is Locale {
  return LOCALES.includes(locale as Locale);
}
