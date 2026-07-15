"use client";

// ============================================================
// Client-side i18n Context
// ============================================================

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  locale,
  dictionary,
}: {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: dictionary }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useT(): Dictionary {
  return useI18n().t;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
