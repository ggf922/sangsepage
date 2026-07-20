"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/error-messages";
import { getAbsoluteUrl } from "@/lib/site-url";
import { Sparkles, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: getAbsoluteUrl("/auth/callback"),
      },
    });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    // 이메일 확인 필요한 경우
    if (data.user && !data.session) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    // 자동 로그인된 경우
    router.push("/dashboard");
    router.refresh();
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory-light to-ivory-dark px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-brand/10 bg-white p-8 text-center shadow-xl">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-4 font-serif text-2xl font-bold text-ink">
            가입 이메일을 확인해주세요
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            <strong className="text-brand">{email}</strong>로<br />
            인증 링크를 보냈습니다. 클릭하시면 가입이 완료됩니다.
          </p>
          <div className="mb-6 rounded-lg bg-amber-50 p-3 text-left text-xs text-amber-900">
            <p className="mb-1 font-semibold">💡 메일이 안 왔나요?</p>
            <ul className="list-disc space-y-1 pl-4 text-amber-800">
              <li>스팸함(정크메일함)을 확인해 주세요</li>
              <li>1~2분 정도 소요될 수 있어요</li>
              <li>Naver/Daum 사용자는 스팸함 확인 필수</li>
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
            <h1 className="mb-2 font-serif text-3xl font-bold text-ink">
              회원가입
            </h1>
            <p className="text-sm text-muted-foreground">
              가입 후 포인트를 충전하고 바로 시작하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                이름 / 사업자명
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동 또는 ○○상회"
                className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

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

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                비밀번호{" "}
                <span className="text-xs text-muted-foreground">
                  (8자 이상)
                </span>
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? "가입 중..." : "회원가입 하기"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              가입시 <Link href="/terms" className="underline">이용약관</Link>과{" "}
              <Link href="/privacy" className="underline">개인정보처리방침</Link>
              에 동의합니다.
            </p>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">이미 계정이 있나요? </span>
            <Link
              href="/auth/login"
              className="font-medium text-brand hover:underline"
            >
              로그인
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-ivory p-3 text-xs text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>신용카드 등록 불필요 · 언제든 해지 가능</span>
          </div>
        </div>
      </div>
    </main>
  );
}
