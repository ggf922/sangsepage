// ============================================================
// Server-side i18n utilities
// (Server Components / Server Actions / Route Handlers)
// ============================================================

import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isValidLocale,
  type Locale,
} from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

/**
 * 현재 요청의 로케일을 쿠키에서 읽어 반환합니다.
 * 쿠키가 없거나 유효하지 않으면 DEFAULT_LOCALE.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  return isValidLocale(raw) ? raw : DEFAULT_LOCALE;
}

/**
 * 현재 요청의 사전을 반환합니다.
 * 서버 컴포넌트에서 사용.
 */
export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return DICTIONARIES[locale];
}

/**
 * 로케일 + 사전을 함께 반환합니다.
 */
export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: DICTIONARIES[locale] };
}
