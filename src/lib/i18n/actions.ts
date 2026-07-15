"use server";

// ============================================================
// Locale change Server Action
// ============================================================

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isValidLocale } from "./config";

export async function setLocale(locale: string) {
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false, // 클라이언트 컨텍스트에서도 필요할 수 있음
  });

  // 현재 페이지 리렌더 트리거
  revalidatePath("/", "layout");

  return { success: true, locale };
}
