// ============================================================
// Dictionary Registry
// ============================================================

import type { Locale } from "../config";
import { ko, type Dictionary } from "./ko";
import { en } from "./en";
import { zh } from "./zh";
import { ja } from "./ja";

export const DICTIONARIES: Record<Locale, Dictionary> = {
  ko,
  en,
  zh,
  ja,
};

export type { Dictionary };
