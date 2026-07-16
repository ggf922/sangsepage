"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/error-messages";
import { CheckCircle, KeyRound, Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * 비밀번호 재설정 확인 페이지
 *
 * 흐름:
 * - /auth/callback이 recovery 토큰을 verifyOtp로 검증 후 세션 생성
 * - 여기로 리다이렉트되면 이미 로그인된 상태 (recovery 세션)
 * - 사용자가 새 비밀번호 2번 입력 → supabase.auth.updateUser()로 비밀번호 변경
 * - 성공 시 로그인 페이지로 자동 이동 (또는 대시보드로)
 *
 * 별도의 승인/확인 단계 없이 세션이 있으면 바로 비밀번호 변경 가능
 */
export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);

  // 페이지 진입 시 세션 확인 (recovery 링크로 왔는지 확인)
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasValidSession(!!session);
      setSessionChecked(true);
    }
    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 클라이언트 사이드 검증
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // 2초 후 대시보드로 자동 이동 (이미 로그인 상태이므로)
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  }

  // 세션 확인 중
  if (!sessionChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory-light to-ivory-dark px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <p className="text-sm text-muted-foreground">확인 중...</p>
        </div>
      </main>
    );
  }

  // 유효한 세션 없음 (링크 만료 또는 직접 접근)
  if (!hasValidSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory-light to-ivory-dark px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-brand/10 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <KeyRound className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mb-4 font-serif text-2xl font-bold text-ink">
            링크가 만료되었어요
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            비밀번호 재설정 링크가 만료되었거나<br />
            이미 사용되었을 수 있습니다.<br />
            재설정 링크를 다시 요청해 주세요.
          </p>
          <div className="space-y-2">
            <Link
              href="/auth/reset-password"
              className="block w-full rounded-lg bg-brand py-2.5 font-medium text-white hover:bg-brand-dark"
            >
              재설정 링크 다시 받기
            </Link>
            <Link
              href="/auth/login"
              className="block text-sm text-muted-foreground hover:text-brand"
            >
              로그인 페이지로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 성공 화면
  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory-light to-ivory-dark px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-brand/10 bg-white p-8 text-center shadow-xl">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-4 font-serif text-2xl font-bold text-ink">
            비밀번호가 변경되었어요
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            새 비밀번호로 로그인되었습니다.<br />
            잠시 후 대시보드로 이동합니다...
          </p>
          <div className="mx-auto h-1.5 w-32 overflow-hidden rounded-full bg-ivory">
            <div className="h-full animate-[progress_2s_linear] bg-brand" />
          </div>
          <style jsx>{`
            @keyframes progress {
              from {
                width: 0%;
              }
              to {
                width: 100%;
              }
            }
          `}</style>
        </div>
      </main>
    );
  }

  // 비밀번호 입력 폼
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
              <KeyRound className="h-6 w-6 text-brand" />
            </div>
            <h1 className="mb-2 font-serif text-2xl font-bold text-ink">
              새 비밀번호 설정
            </h1>
            <p className="text-sm text-muted-foreground">
              새로 사용하실 비밀번호를 입력해 주세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                새 비밀번호{" "}
                <span className="text-xs text-muted-foreground">
                  (8자 이상)
                </span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-white px-4 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="mb-2 block text-sm font-medium"
              >
                새 비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p className="mt-1.5 text-xs text-destructive">
                  비밀번호가 일치하지 않습니다
                </p>
              )}
              {passwordConfirm && password === passwordConfirm && password.length >= 8 && (
                <p className="mt-1.5 text-xs text-green-600">
                  ✓ 비밀번호가 일치합니다
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 8 || password !== passwordConfirm}
              className="w-full rounded-lg bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-ivory p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold text-brand">💡 안전한 비밀번호 팁</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>8자 이상, 영문·숫자·기호 조합 권장</li>
              <li>다른 사이트와 다른 비밀번호 사용</li>
              <li>주기적으로 비밀번호 변경</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
