import Link from "next/link";
import { ArrowRight, Sparkles, Globe, Palette, Zap, Shield, Download } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-ivory-light via-ivory to-ivory-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-brand/10 bg-ivory/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand" />
            <span className="font-serif text-xl font-bold text-brand">
              SangSePage
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm hover:text-brand">
              특징
            </Link>
            <Link href="#pricing" className="text-sm hover:text-brand">
              요금제
            </Link>
            <Link href="#styles" className="text-sm hover:text-brand">
              스타일
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-ink hover:text-brand"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              무료 시작
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/50 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="text-xs font-medium tracking-widest text-brand">
              AI로 5초만에 완성
            </span>
          </div>
          <h1 className="mb-6 font-serif text-5xl font-bold leading-tight text-ink md:text-6xl lg:text-7xl">
            상품 상세페이지,
            <br />
            <span className="text-brand">AI가 자동으로</span> 만들어 드립니다
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            상품 정보만 입력하면 프로급 상세페이지 완성.
            <br />
            <span className="font-semibold">
              스마트스토어·쿠팡·자사몰
            </span>{" "}
            즉시 사용 가능한 860px 규격.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark hover:shadow-brand/40"
            >
              무료로 3장 만들어보기
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#styles"
              className="inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-white/50 px-8 py-4 text-base font-semibold text-brand transition hover:bg-white"
            >
              샘플 미리보기
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            🎁 신규가입 100포인트 무료 지급 · 카드 등록 불필요
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold text-ink">
            왜 <span className="text-brand">SangSePage</span>인가요?
          </h2>
          <p className="text-muted-foreground">
            외주 20만원 → AI로 3천원. 품질은 그대로.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Palette className="h-6 w-6" />}
            title="5가지 전문 스타일"
            desc="김치/식품, 생활용품, 전자제품, 건강식품, 화장품 각 카테고리 최적화 템플릿"
          />
          <FeatureCard
            icon={<Globe className="h-6 w-6" />}
            title="4개 언어 지원"
            desc="한국어·영어·중국어·일본어 자동 번역. 글로벌 시장 진출 준비 완료"
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="5초 자동 생성"
            desc="상품명만 입력하면 12개 섹션 카피 + 13장 이미지 자동 생성"
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="860px 규격 준수"
            desc="네이버 스마트스토어·쿠팡·11번가 즉시 업로드 가능한 표준 규격"
          />
          <FeatureCard
            icon={<Download className="h-6 w-6" />}
            title="다운로드 자유"
            desc="HTML·PDF·이미지 슬라이스 형태로 즉시 다운로드"
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="재수정 지원"
            desc="맘에 안 들면 다시 생성. 카피만, 이미지만 부분 재생성도 가능"
          />
        </div>
      </section>

      {/* Styles */}
      <section id="styles" className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold text-ink">
            5가지 <span className="text-brand">프리미엄 스타일</span>
          </h2>
          <p className="text-muted-foreground">
            상품 카테고리에 딱 맞는 디자인이 자동으로 적용됩니다.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StyleCard
            code="A"
            title="식품·김치"
            style="전통·감성"
            colors={["#a71d1d", "#f4ede0", "#e8c98a"]}
            example="오가미 김치 스타일"
          />
          <StyleCard
            code="B"
            title="생활용품"
            style="모던 미니멀"
            colors={["#2d2d2d", "#f5f5f5", "#a3a3a3"]}
            example="무인양품 스타일"
          />
          <StyleCard
            code="C"
            title="전자제품"
            style="테크 프리미엄"
            colors={["#0a0a0a", "#00d47e", "#ffffff"]}
            example="Apple / Dyson 스타일"
          />
          <StyleCard
            code="D"
            title="건강식품"
            style="클린 내추럴"
            colors={["#8fa88f", "#f0ebe0", "#ffffff"]}
            example="락토핏 스타일"
          />
          <StyleCard
            code="E"
            title="화장품"
            style="럭셔리 뷰티"
            colors={["#c9a5a0", "#d4af7c", "#faf4ee"]}
            example="설화수 스타일"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-brand p-12 text-center text-white shadow-2xl shadow-brand/25">
          <h2 className="mb-4 font-serif text-4xl font-bold">
            지금 시작하면 <span className="text-yellow-300">100포인트</span>{" "}
            무료
          </h2>
          <p className="mb-8 text-lg opacity-90">
            = 상세페이지 3장 무료 제작. 카드 등록 불필요.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-brand transition hover:bg-yellow-50"
          >
            무료 회원가입
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand/10 bg-white/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-brand" />
              <span className="font-serif font-bold text-brand">
                SangSePage
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SangSePage. AI로 만드는 상세페이지의 새로운 표준.
            </p>
          </div>
        </div>
      </footer>
    </main>
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
    <div className="group rounded-xl border border-brand/10 bg-white/70 p-6 transition hover:border-brand/30 hover:shadow-lg">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-2 font-serif text-xl font-bold text-ink">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
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
    <div className="group rounded-xl border border-brand/10 bg-white/70 p-6 transition hover:border-brand/30 hover:shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-serif text-3xl font-bold text-brand">{code}</span>
        <div className="flex gap-1">
          {colors.map((color, i) => (
            <div
              key={i}
              className="h-6 w-6 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <h3 className="mb-1 font-serif text-lg font-bold text-ink">{title}</h3>
      <p className="mb-2 text-xs font-medium text-brand">{style}</p>
      <p className="text-xs text-muted-foreground">{example}</p>
    </div>
  );
}
