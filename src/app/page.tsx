import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Globe,
  Palette,
  Zap,
  Shield,
  Download,
  CheckCircle2,
  Star,
} from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function HomePage() {
  const { locale, t } = await getI18n();

  return (
    <main className="min-h-screen bg-ivory-light text-ink [word-break:keep-all]">
      {/* ========== Header ========== */}
      <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-ivory-light/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-brand shadow-sm shadow-brand/20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <span className="relative z-10 font-serif text-[13px] font-extrabold tracking-tighter text-white">
                88
              </span>
            </div>
            <span className="font-serif text-[19px] font-bold tracking-tight text-brand">
              88km
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-[13px] font-medium tracking-wide text-ink/70 transition-colors hover:text-brand"
            >
              특징
            </Link>
            <Link
              href="#styles"
              className="text-[13px] font-medium tracking-wide text-ink/70 transition-colors hover:text-brand"
            >
              스타일
            </Link>
            <Link
              href="#pricing"
              className="text-[13px] font-medium tracking-wide text-ink/70 transition-colors hover:text-brand"
            >
              요금제
            </Link>
            <Link
              href="/guide"
              className="text-[13px] font-medium tracking-wide text-ink/70 transition-colors hover:text-brand"
            >
              이용안내
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher
              currentLocale={locale}
              variant="ghost"
              showLabel={false}
            />
            <Link
              href="/auth/login"
              className="text-[13px] font-medium text-ink/80 transition hover:text-brand"
            >
              {t.common.login}
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-brand px-4 py-2 text-[13px] font-medium text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark hover:shadow-md hover:shadow-brand/30 sm:px-5"
            >
              {t.common.signup}
            </Link>
          </div>
        </div>
      </header>

      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand/[0.04] via-transparent to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-brand/[0.03] to-transparent blur-3xl" />
        </div>

        <div className="container relative mx-auto px-6 pb-24 pt-24 md:pt-32 lg:pb-32 lg:pt-40">
          <div className="mx-auto max-w-4xl text-center">
            {/* Eyebrow */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/60 px-4 py-1.5 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                AI로 완성하는 프로급 상세페이지
              </span>
            </div>

            {/* Hero title */}
            <h1 className="mb-8 font-serif text-[42px] font-bold leading-[1.15] tracking-[-0.02em] text-ink md:text-[62px] md:leading-[1.1] lg:text-[76px]">
              <span className="block">상세페이지 한 장으로,</span>
              <span className="mt-2 block">
                <span className="relative inline-block">
                  <span className="relative z-10 text-brand">3채널 동시 판매</span>
                  <span className="absolute bottom-1 left-0 h-3 w-full rounded-sm bg-brand/10 md:bottom-2 md:h-4" />
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-12 max-w-2xl px-2 text-[15px] leading-[1.75] tracking-tight text-ink/60 md:text-[18px] md:leading-[1.8]">
              상품 정보만 입력하면 AI가{" "}
              <span className="font-medium text-ink/80">
                12개 섹션 카피 + 6장 이미지
              </span>
              를 30초 만에 완성해요.
              <br />
              <span className="font-medium text-brand">
                스마트스토어 · 쿠팡 · 88마트
              </span>
              에 바로 올릴 수 있는 860px 규격.
            </p>

            {/* CTA */}
            <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-[15px] font-semibold tracking-tight text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/35"
              >
                무료로 1장 만들기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#styles"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 px-8 py-4 text-[15px] font-semibold tracking-tight text-ink/80 backdrop-blur transition-all hover:border-brand/30 hover:bg-white hover:text-brand"
              >
                샘플 스타일 미리보기
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col items-center justify-center gap-2.5 text-[13px] text-ink/50 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand/70" />
                <span>가입 즉시 <b className="font-semibold text-ink/70">50P</b> 무료 지급</span>
              </div>
              <div className="hidden h-1 w-1 rounded-full bg-ink/20 sm:block" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand/70" />
                <span>카드 등록 없이 시작</span>
              </div>
              <div className="hidden h-1 w-1 rounded-full bg-ink/20 sm:block" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand/70" />
                <span>4개국어 자동 번역</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Value stats ========== */}
      <section className="border-y border-black/[0.06] bg-white/40 backdrop-blur">
        <div className="container mx-auto px-6 py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatItem value="30초" label="평균 생성 시간" />
            <StatItem value="20만 → 4,500" label="외주 대비 비용 절감 (3$)" unit="원" />
            <StatItem value="5가지" label="프리미엄 스타일" />
            <StatItem value="4개국어" label="자동 다국어 지원" />
          </div>
        </div>
      </section>

      {/* ========== Features ========== */}
      <section id="features" className="container mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            Features
          </p>
          <h2 className="mb-5 font-serif text-[32px] font-bold leading-[1.25] tracking-[-0.02em] text-ink md:text-[48px] md:leading-[1.2]">
            왜 <span className="text-brand">88km</span>인가요?
          </h2>
          <p className="text-[15px] leading-[1.75] text-ink/60 md:text-[17px] md:leading-[1.7]">
            외주 20만원짜리 상세페이지를 <span className="font-semibold text-brand">4,500원 (3$)</span>에.
            <br />
            품질은 그대로, 시간은 <span className="font-semibold text-brand">100배 빠르게</span>.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Palette className="h-5 w-5" />}
            title="5가지 전문 스타일"
            desc="김치·식품 · 생활용품 · 전자제품 · 건강식품 · 화장품. 각 카테고리에 최적화된 프리미엄 템플릿."
          />
          <FeatureCard
            icon={<Globe className="h-5 w-5" />}
            title="4개 언어 자동 번역"
            desc="한국어 · 영어 · 중국어 · 일본어. 글로벌 시장 진출을 원클릭으로 준비하세요."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="30초 자동 생성"
            desc="상품 정보 입력 후 클릭 한 번. 12개 섹션의 카피와 6장의 이미지가 자동 완성."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="860px 표준 규격"
            desc="네이버 스마트스토어 · 쿠팡 · 11번가 즉시 업로드 가능한 한국 이커머스 표준."
          />
          <FeatureCard
            icon={<Download className="h-5 w-5" />}
            title="HTML 다운로드"
            desc="완성된 페이지를 HTML 파일로 즉시 다운로드. 어떤 플랫폼에서도 자유롭게 사용."
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="부분 재생성 지원"
            desc="카피만, 이미지만, 전체 다시 — 원하는 부분만 최대 3회까지 재생성 가능."
          />
        </div>
      </section>

      {/* ========== Styles ========== */}
      <section
        id="styles"
        className="relative overflow-hidden bg-gradient-to-b from-ivory to-ivory-light py-24 md:py-32"
      >
        <div className="container relative mx-auto px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Templates
            </p>
            <h2 className="mb-5 font-serif text-[32px] font-bold leading-[1.25] tracking-[-0.02em] text-ink md:text-[48px] md:leading-[1.2]">
              <span className="text-brand">5가지</span> 프리미엄 스타일
            </h2>
            <p className="text-[16px] leading-[1.7] text-ink/60 md:text-[17px]">
              상품 카테고리에 완벽하게 맞춰진 디자인이 자동으로 적용됩니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StyleCard
              code="A"
              title="식품·김치"
              style="전통 · 감성"
              colors={["#a71d1d", "#f4ede0", "#e8c98a"]}
              example="오가미 김치 스타일"
            />
            <StyleCard
              code="B"
              title="생활용품"
              style="모던 · 미니멀"
              colors={["#2d2d2d", "#f5f5f5", "#a3a3a3"]}
              example="무인양품 스타일"
            />
            <StyleCard
              code="C"
              title="전자제품"
              style="테크 · 프리미엄"
              colors={["#0a0a0a", "#00d47e", "#ffffff"]}
              example="Apple · Dyson 스타일"
            />
            <StyleCard
              code="D"
              title="건강식품"
              style="클린 · 내추럴"
              colors={["#8fa88f", "#f0ebe0", "#ffffff"]}
              example="락토핏 스타일"
            />
            <StyleCard
              code="E"
              title="화장품"
              style="럭셔리 · 뷰티"
              colors={["#c9a5a0", "#d4af7c", "#faf4ee"]}
              example="설화수 스타일"
            />
          </div>
        </div>
      </section>

      {/* ========== Pricing preview ========== */}
      <section id="pricing" className="container mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            Pricing
          </p>
          <h2 className="mb-5 font-serif text-[32px] font-bold leading-[1.25] tracking-[-0.02em] text-ink md:text-[48px] md:leading-[1.2]">
            투명한 <span className="text-brand">포인트</span> 요금제
          </h2>
          <p className="text-[16px] leading-[1.7] text-ink/60 md:text-[17px]">
            사용한 만큼만 결제. 월 정기 결제 없음.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
          <PriceCard
            title="페이지 생성"
            points="45P"
            desc="상세페이지 1장 자동 생성"
            approx="≈ 4,500원"
          />
          <PriceCard
            title="부분 재생성"
            points="3~10P"
            desc="카피·이미지·선택 섹션·전체 (무제한)"
            approx="≈ 300~1,000원"
            highlight
          />
          <PriceCard
            title="언어 추가"
            points="20P"
            desc="영어·중국어·일본어 번역 추가"
            approx="≈ 2,000원"
          />
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="container mx-auto px-6 pb-24 md:pb-32">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-dark p-1 shadow-2xl shadow-brand/30">
          <div className="relative overflow-hidden rounded-[calc(1.5rem-4px)] bg-gradient-to-br from-brand to-brand-dark px-8 py-16 text-center text-white md:px-16 md:py-20">
            {/* Decorative pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
              <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/50 blur-3xl" />
              <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/50 blur-3xl" />
            </div>

            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur">
                <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  런칭 기념 혜택
                </span>
              </div>
              <h2 className="mb-5 font-serif text-[36px] font-bold leading-[1.2] tracking-[-0.02em] md:text-[52px]">
                지금 가입하면
                <br />
                <span className="text-yellow-300">50P 무료</span> 지급
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-[16px] leading-[1.7] text-white/80 md:text-[17px]">
                상세페이지 <strong className="font-semibold text-white">1장 무료 제작</strong>{" "}
                · 카드 등록 불필요
                <br />
                지금 바로 시작하세요.
              </p>
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-[15px] font-semibold tracking-tight text-brand shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-yellow-50 hover:shadow-2xl"
              >
                무료 회원가입
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="border-t border-black/[0.06] bg-white/40">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-brand">
                <span className="font-serif text-[10px] font-extrabold tracking-tighter text-white">
                  88
                </span>
              </div>
              <span className="font-serif text-[15px] font-bold tracking-tight text-brand">
                88km
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 md:items-end">
              <p className="text-[13px] text-ink/50">
                © 2026 88km. All rights reserved.
              </p>
              <p className="text-[12px] text-ink/40">
                AI로 만드는 상세페이지의 새로운 표준
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ========================================================
// Sub Components
// ========================================================

function StatItem({
  value,
  label,
  unit,
}: {
  value: string;
  label: string;
  unit?: string;
}) {
  return (
    <div className="text-center">
      <p className="mb-1.5 font-serif text-[28px] font-bold tracking-tight text-brand md:text-[36px]">
        {value}
        {unit && (
          <span className="ml-0.5 text-[18px] font-medium text-ink/60 md:text-[20px]">
            {unit}
          </span>
        )}
      </p>
      <p className="text-[12px] font-medium tracking-wide text-ink/50 md:text-[13px]">
        {label}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 p-7 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-brand/20 hover:bg-white hover:shadow-lg hover:shadow-brand/5">
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/8 text-brand transition-all group-hover:bg-brand group-hover:text-white group-hover:shadow-md group-hover:shadow-brand/25">
        {icon}
      </div>
      <h3 className="mb-2 font-serif text-[19px] font-bold tracking-tight text-ink">
        {title}
      </h3>
      <p className="text-[14px] leading-[1.65] text-ink/60">{desc}</p>
    </div>
  );
}

function StyleCard({
  code,
  title,
  style,
  colors,
  example,
}: {
  code: string;
  title: string;
  style: string;
  colors: string[];
  example: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand/25 hover:shadow-xl hover:shadow-brand/10">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-serif text-[36px] font-bold tracking-tight text-brand">
          {code}
        </span>
        <div className="flex -space-x-1.5">
          {colors.map((color, i) => (
            <div
              key={i}
              className="h-7 w-7 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-110"
              style={{
                backgroundColor: color,
                transitionDelay: `${i * 30}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <h3 className="mb-1 font-serif text-[17px] font-bold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
        {style}
      </p>
      <p className="text-[12px] leading-[1.55] text-ink/50">{example}</p>
    </div>
  );
}

function PriceCard({
  title,
  points,
  desc,
  approx,
  highlight,
}: {
  title: string;
  points: string;
  desc: string;
  approx: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border p-7 transition-all hover:-translate-y-0.5 " +
        (highlight
          ? "border-brand/30 bg-gradient-to-b from-white to-ivory-light shadow-lg shadow-brand/10"
          : "border-black/[0.06] bg-white/80 hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5")
      }
    >
      {highlight && (
        <div className="absolute right-4 top-4 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          Popular
        </div>
      )}
      <p className="mb-3 text-[13px] font-medium text-ink/60">{title}</p>
      <p className="mb-2 font-serif text-[36px] font-bold tracking-tight text-brand">
        {points}
      </p>
      <p className="mb-5 text-[13px] font-medium text-ink/50">{approx}</p>
      <p className="text-[13px] leading-[1.6] text-ink/70">{desc}</p>
    </div>
  );
}
