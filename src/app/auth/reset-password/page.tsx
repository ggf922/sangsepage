"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/error-messages";
import { getAbsoluteUrl } from "@/lib/site-url";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * 비밀번호 재설정 요청 페이지
 *
 * 흐름:
 * 1. 사용자가 이메일 입력 → "재설정 링크 받기" 클릭
 * 2. Supabase가 Resend 통해 재설정 링크 이메일 발송
 * 3. 이메일 링크 → /auth/callback?token_hash=...&type=recovery&next=/auth/reset-password/confirm
 * 4. callback route가 세션 생성 후 → /auth/reset-password/confirm으로 리다이렉트
 * 5. confirm 페이지에서 새 비밀번호 입력 → 완료
 */
export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // callback에서 세션 생성 후 confirm 페이지로 자동 이동
      redirectTo: getAbsoluteUrl(
        "/auth/callback?next=/auth/reset-password/confirm"
      ),
    });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory-light to-ivory-dark px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-brand/10 bg-white p-8 text-center shadow-xl">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-4 font-serif text-2xl font-bold text-ink">
            재설정 링크를 보냈어요
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            <strong className="text-brand">{email}</strong>로<br />
            비밀번호 재설정 링크를 보냈습니다.<br />
            이메일의 링크를 클릭하면 새 비밀번호를 설정할 수 있어요.
          </p>
          <div className="mb-6 rounded-lg bg-amber-50 p-3 text-left text-xs text-amber-900">
            <p className="mb-1 font-semibold">💡 메일이 안 왔나요?</p>
            <ul className="list-disc space-y-1 pl-4 text-amber-800">
              <li>스팸함(정크메일함)을 확인해 주세요</li>
              <li>1~2분 정도 소요될 수 있어요</li>
              <li>Naver/Daum 사용자는 스팸함 확인 필수</li>
              <li>가입되지 않은 이메일에는 메일이 발송되지 않습니다</li>
            </ul>
          </div>
          <Link
            href="/auth/login"
            className="inline-block rounded-lg bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-dark"
          >
            로그인 페이지로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory-light to-ivory-dark px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
            <span className="font-serif text-[16px] font-extrabold tracking-tighter text-white">
              88
            </span>
          </div>
          <span className="font-serif text-2xl font-bold text-brand">
            88km
          </span>
        </Link>

        <div className="rounded-2xl border border-brand/10 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
              <Mail className="h-6 w-6 text-brand" />
            </div>
            <h1 className="mb-2 font-serif text-2xl font-bold text-ink">
              비밀번호 재설정
            </h1>
            <p className="text-sm text-muted-foreground">
              가입하신 이메일을 입력하시면<br />
              재설정 링크를 보내드립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "발송 중..." : "재설정 링크 받기"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              로그인 페이지로
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-brand"
          >
            ← 홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
