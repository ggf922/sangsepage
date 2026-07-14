import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory-light to-ivory-dark px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-brand" />
          <span className="font-serif text-2xl font-bold text-brand">
            SangSePage
          </span>
        </Link>

        <div className="rounded-2xl border border-brand/10 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="mb-2 font-serif text-3xl font-bold text-ink">
              로그인
            </h1>
            <p className="text-sm text-muted-foreground">
              다시 오신 것을 환영합니다
            </p>
          </div>

          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="h-20 animate-pulse rounded-lg bg-ivory" />
                <div className="h-20 animate-pulse rounded-lg bg-ivory" />
                <div className="h-10 animate-pulse rounded-lg bg-ivory" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Link
              href="/auth/signup"
              className="font-medium text-brand hover:underline"
            >
              무료 회원가입
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-ivory p-3 text-xs text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>신규가입시 100포인트 무료 (상세페이지 3장 제작 가능)</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-brand"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
