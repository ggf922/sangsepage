import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import LoginForm from "./login-form";
import { getI18n } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { locale, t } = await getI18n();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory-light to-ivory-dark px-4">
      {/* Top-right language switcher */}
      <div className="absolute right-4 top-4">
        <LanguageSwitcher currentLocale={locale} />
      </div>

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
              {t.auth.loginTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.auth.loginSubtitle}
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
            <span className="text-muted-foreground">
              {t.auth.dontHaveAccount}{" "}
            </span>
            <Link
              href="/auth/signup"
              className="font-medium text-brand hover:underline"
            >
              {t.auth.signupButton}
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-ivory p-3 text-xs text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.auth.signupBonus}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-brand"
          >
            ← {t.common.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
