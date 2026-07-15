import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Supabase Auth Callback Handler
 *
 * 두 가지 인증 흐름을 모두 지원합니다:
 * 1. PKCE flow (`?code=...`) — OAuth (Google, GitHub 등) 로그인
 * 2. Email OTP (`?token_hash=...&type=...`) — 이메일 인증, 비밀번호 재설정
 *
 * Supabase 최신 SDK(@supabase/ssr)는 이메일 링크에 token_hash를 사용합니다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // 우선순위: next 파라미터 > 기본값
  const next = searchParams.get("next") ?? "/dashboard";
  // next 파라미터가 절대 URL이면 무시 (open redirect 방지)
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  // 1) PKCE flow: code 파라미터
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("[auth/callback] PKCE exchange error:", error.message);
  }

  // 2) Email OTP flow: token_hash + type 파라미터 (이메일 확인/비번 재설정 등)
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error(
      "[auth/callback] OTP verify error:",
      error.message,
      "type:",
      type
    );

    // 이메일 링크가 만료되었거나 이미 사용된 경우
    const errorCode = error.status === 403 ? "expired" : "auth";
    return NextResponse.redirect(
      `${origin}/auth/login?error=${errorCode}&message=${encodeURIComponent(error.message)}`
    );
  }

  // 3) 어떤 파라미터도 없거나 실패
  console.error(
    "[auth/callback] No valid auth params. URL:",
    request.url
  );
  return NextResponse.redirect(`${origin}/auth/login?error=auth`);
}
