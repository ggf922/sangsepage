import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  UserPlus,
  Package,
  Sparkles,
  Wand2,
  Download,
  Share2,
  Image as ImageIcon,
  FileText,
  Award,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Palette,
  Globe,
  Rocket,
  Trash2,
  Edit3,
  Infinity as InfinityIcon,
  MessageSquare,
  Film,
} from "lucide-react";

export const metadata: Metadata = {
  title: "이용 안내서 · 88km",
  description:
    "88km 사용법과 상세페이지 퀄러티를 높이는 방법을 자세히 안내합니다.",
};

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-ivory-light text-ink [word-break:keep-all]">
      {/* Header */}
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
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-[13px] font-medium text-ink/80 transition hover:text-brand"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-brand px-4 py-2 text-[13px] font-medium text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark hover:shadow-md hover:shadow-brand/30 sm:px-5"
            >
              무료 회원가입
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/[0.06]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand/[0.05] via-transparent to-transparent blur-3xl" />
        </div>
        <div className="container relative mx-auto px-6 py-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/60 px-4 py-1.5 text-[12px] font-medium tracking-wide text-brand">
            <FileText className="h-3.5 w-3.5" />
            GUIDE
          </div>
          <h1 className="mb-4 font-serif text-[44px] font-bold leading-tight tracking-tight md:text-[56px]">
            88km <span className="text-brand">이용 안내서</span>
          </h1>
          <p className="mx-auto max-w-2xl text-[16px] leading-relaxed text-ink/70">
            처음 사용하시는 분도 5분이면 첫 상세페이지를 완성할 수 있어요.
            <br />
            <span className="text-brand font-medium">퀄러티를 극대화하는 노하우</span>까지 아래에서 확인하세요.
          </p>

          {/* Quick nav */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#step-1"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-ink/80 transition hover:border-brand/30 hover:text-brand"
            >
              ① 회원가입
            </a>
            <a
              href="#step-2"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-ink/80 transition hover:border-brand/30 hover:text-brand"
            >
              ② 상품 등록
            </a>
            <a
              href="#step-3"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-ink/80 transition hover:border-brand/30 hover:text-brand"
            >
              ③ 페이지 생성
            </a>
            <a
              href="#step-4"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-ink/80 transition hover:border-brand/30 hover:text-brand"
            >
              ④ 편집·공유
            </a>
            <a
              href="#whats-new"
              className="rounded-full border border-brand/40 bg-gradient-to-r from-brand/10 to-brand/5 px-4 py-2 text-[13px] font-semibold text-brand transition hover:from-brand/15 hover:to-brand/10"
            >
              🆕 최신 업데이트
            </a>
            <a
              href="#quality"
              className="rounded-full border border-brand/30 bg-brand/5 px-4 py-2 text-[13px] font-semibold text-brand transition hover:bg-brand/10"
            >
              ⭐ 퀄러티 높이는 방법
            </a>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={<Sparkles className="h-5 w-5" />} value="30초" label="1장 평균 생성 시간" />
            <StatCard icon={<Gift className="h-5 w-5" />} value="45P / 장" label="약 4,500원(3$) · 외주의 1/40" />
            <StatCard icon={<Globe className="h-5 w-5" />} value="4개 국어" label="한/영/일/중 자동 번역" />
          </div>
        </div>
      </section>

      {/* Step 1 - Signup */}
      <Section id="step-1" step="STEP 1" title="회원가입 & 포인트 충전" icon={<UserPlus className="h-6 w-6" />}>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/80">
          <p>
            <Link href="/auth/signup" className="text-brand font-medium underline underline-offset-4 hover:text-brand-dark">
              회원가입 페이지
            </Link>
            에서 이메일과 비밀번호로 계정을 만들고, 대시보드에서 포인트를 충전하세요.
          </p>
          <Callout type="info" title="포인트로 결제한 만큼만 사용">
            상세페이지 1장은 <b>45P (약 4,500원 / 3$)</b>입니다.
            외주 대비 <b>40배 이상 저렴</b>한 가격으로 이용하실 수 있으며,
            생성이 실패하는 경우 포인트는 자동으로 환불됩니다.
          </Callout>
          <ol className="ml-4 list-decimal space-y-2 text-ink/75">
            <li>이메일 인증 링크를 클릭해 계정을 활성화합니다.</li>
            <li>대시보드 → <b>마이 페이지 → 포인트 충전</b>에서 필요한 만큼 충전하세요.</li>
            <li>다국어로 판매 예정이라면 헤더의 언어 스위처에서 언어를 선택하세요.</li>
          </ol>
        </div>
      </Section>

      {/* Step 2 - Product */}
      <Section id="step-2" step="STEP 2" title="상품 정보 등록" icon={<Package className="h-6 w-6" />} alt>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/80">
          <p>
            대시보드 → <b>&ldquo;새 상품 등록&rdquo;</b> 버튼을 누르면 아래 정보를 입력하는 폼이 나타납니다.
            이 정보의 <b>구체성과 사실성이 상세페이지 품질을 결정</b>하므로 최대한 자세히 적어주세요.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <FieldCard label="상품명" required>
              브랜드가 드러나는 정식 명칭 (예: <i>&ldquo;오가미 유기농 김치 1kg&rdquo;</i>)
            </FieldCard>
            <FieldCard label="카테고리" required>
              식품 / 뷰티 / 전자 / 건강 / 패션 등 — 카테고리별로 카피 톤이 달라집니다
            </FieldCard>
            <FieldCard label="핵심 특징 (feature)" required>
              최소 3개 이상. <i>&ldquo;서산 6쪽 마늘 사용&rdquo;</i> 처럼 <b>고유명사·수치</b>가 있을수록 좋아요
            </FieldCard>
            <FieldCard label="타깃 고객 (target)">
              연령·성별·라이프스타일 — <i>&ldquo;30대 워킹맘, 재료를 따지는 사람&rdquo;</i>
            </FieldCard>
            <FieldCard label="브랜드 스토리 (extra_info)">
              창업 배경·장인 이야기 — 신뢰 배지와 스토리 섹션에 활용됩니다
            </FieldCard>
            <FieldCard label="상품 이미지">
              1~5장 업로드. 이 이미지는 <b>AI 이미지 생성의 레퍼런스</b>로 사용됩니다
            </FieldCard>
          </div>

          <Callout type="tip" title="더 좋은 결과를 위한 팁">
            AI는 여러분이 <b>제공한 정보만 사용</b>합니다. 없는 사실을 지어내지 않기 때문에,
            자랑하고 싶은 인증·수상·리뷰·수치가 있으면 반드시 특징이나 브랜드 스토리 필드에 적어주세요.
          </Callout>
        </div>
      </Section>

      {/* Step 3 - Generate */}
      <Section id="step-3" step="STEP 3" title="상세페이지 생성" icon={<Wand2 className="h-6 w-6" />}>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/80">
          <p>
            등록한 상품 카드에서 <b>&ldquo;상세페이지 만들기&rdquo;</b>를 누르면 스타일을 고를 수 있어요.
          </p>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <StyleCard name="Editorial" desc="잡지 감성 · 스토리형" example="식품·수제" />
            <StyleCard name="Minimal" desc="여백·타이포 중심" example="라이프스타일·홈" />
            <StyleCard name="Bold" desc="애플·다이슨 스타일" example="테크·가전" />
            <StyleCard name="Info" desc="정보 강조 인포그래픽" example="건강기능식품" />
            <StyleCard name="Luxury" desc="설화수·프리미엄" example="뷰티·럭셔리" />
          </div>

          <div className="rounded-2xl border border-brand/15 bg-brand/[0.03] p-6">
            <div className="flex items-center gap-2 text-[13px] font-medium text-brand">
              <Sparkles className="h-4 w-4" />
              생성 프로세스 (약 30초)
            </div>
            <ol className="mt-3 space-y-2 text-[14px] text-ink/75">
              <li>
                <b>1) 카피 생성:</b> GPT-4o가 카테고리별 최적화 프롬프트로 헤드라인·후킹 문구·섹션 카피를 작성합니다.
              </li>
              <li>
                <b>2) 이미지 생성:</b> 9개 슬롯(히어로, 상세컷, 라이프스타일, 인포그래픽 등)을
                &ldquo;포토그래퍼 브리프&rdquo; 방식으로 생성합니다. 업로드하신 상품 사진을 레퍼런스로 사용합니다.
              </li>
              <li>
                <b>3) HTML 렌더링:</b> 선택한 스타일 템플릿에 신뢰 배지 + 브랜드 스토리를 결합해 완성합니다.
              </li>
            </ol>
          </div>

          <Callout type="info" title="포인트 차감 안내">
            페이지 1장당 <b>45P(약 4,500원 / 3$)가 차감</b>됩니다. 외주 대비 40배 이상 저렴된 가격입니다.
            생성이 실패하면 자동으로 <b>포인트가 환불</b>됩니다.
          </Callout>
        </div>
      </Section>

      {/* Step 4 - Edit/Share */}
      <Section id="step-4" step="STEP 4" title="편집 · 다운로드 · 공유" icon={<Share2 className="h-6 w-6" />} alt>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/80">
          <div className="grid gap-4 md:grid-cols-2">
            <FeatureBlock icon={<Wand2 className="h-5 w-5" />} title="실시간 편집">
              생성된 페이지의 텍스트·이미지·순서를 원하는 대로 수정할 수 있습니다.
              특정 섹션만 재생성도 가능해요.
            </FeatureBlock>
            <FeatureBlock icon={<Download className="h-5 w-5" />} title="이미지·HTML 다운로드">
              스마트스토어·쿠팡 등에 그대로 붙여 넣을 수 있도록
              <b>세로 슬라이드 이미지</b>와 <b>HTML 소스</b>를 모두 제공합니다.
            </FeatureBlock>
            <FeatureBlock icon={<Share2 className="h-5 w-5" />} title="공유 링크">
              <code className="rounded bg-brand/10 px-1.5 py-0.5 text-brand text-[12px]">88km.shop/p/&#123;id&#125;</code>{" "}
              형식의 공유 링크를 클라이언트·팀원에게 바로 보낼 수 있어요.
            </FeatureBlock>
            <FeatureBlock icon={<Globe className="h-5 w-5" />} title="4개 국어 자동 번역">
              한 번 만든 페이지를 <b>한/영/일/중</b> 4개 국어로 자동 번역해 글로벌 마켓에서도 사용 가능합니다.
            </FeatureBlock>
          </div>
        </div>
      </Section>

      {/* What's New — Turn 1~7 improvements */}
      <section id="whats-new" className="border-y-2 border-brand/15 bg-gradient-to-b from-brand/[0.04] via-white to-transparent">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-[12px] font-semibold tracking-wide text-brand">
              <Rocket className="h-3.5 w-3.5" />
              WHAT&apos;S NEW · 2026
            </div>
            <h2 className="mb-3 font-serif text-[36px] font-bold tracking-tight md:text-[44px]">
              🆕 최근 업데이트로 <span className="text-brand">더 똑똑해진 88km</span>
            </h2>
            <p className="mb-10 text-[16px] text-ink/70">
              사용자 피드백을 반영해 <b>편집 자유도·품질·편의성</b>을 대폭 강화했어요. 지금부터는 아래 기능을 모두 무제한으로 활용하실 수 있습니다.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <NewFeature
                icon={<Edit3 className="h-5 w-5" />}
                badge="편집"
                title="선택 섹션만 골라 재생성"
                cost="3P부터"
              >
                히어로, 상세컷, 스토리 등 원하는 <b>섹션 1개만</b> 골라 재생성할 수 있어요.
                섹션 1개는 3P, 여러 개를 골라도 <b>최대 10P</b>로 저렴하게. 전체 스타일은 유지되고 원하는 부분만 새로 뽑습니다.
              </NewFeature>

              <NewFeature
                icon={<InfinityIcon className="h-5 w-5" />}
                badge="편집"
                title="수정 횟수 무제한"
                cost="포인트만 있으면 OK"
              >
                기존 &ldquo;3회 제한&rdquo;이 완전히 사라졌습니다. 포인트가 남아 있는 한 <b>몇 번이든 반복해서 다듬을 수 있어요</b>.
                누적 수정 횟수는 표시만 되고, 차감되지 않습니다.
              </NewFeature>

              <NewFeature
                icon={<MessageSquare className="h-5 w-5" />}
                badge="편집"
                title="수정 지시사항 직접 입력"
                cost="자유 텍스트"
              >
                &ldquo;헤드라인을 더 감성적으로&rdquo;, &ldquo;신뢰 배지에 HACCP 강조&rdquo; 같은 <b>사용자 지시사항 텍스트박스</b>를 제공합니다.
                AI가 이 내용을 우선 반영해 재생성해요.
              </NewFeature>

              <NewFeature
                icon={<FileText className="h-5 w-5" />}
                badge="품질"
                title="입력한 상품 정보가 무조건 반영"
                cost="자동 · 무료"
              >
                &ldquo;상품 등록&rdquo;에서 적으신 특징·수치·인증은 상세페이지의 <b>&ldquo;제품 스펙&rdquo; 섹션에 강제 병합</b>됩니다.
                AI가 놓치거나 임의로 축약하지 않습니다.
              </NewFeature>

              <NewFeature
                icon={<Package className="h-5 w-5" />}
                badge="입력"
                title="&lsquo;판매사&rsquo; 필드 추가"
                cost="입력 · 무료"
              >
                브랜드사와 판매사가 다른 경우(위탁 판매·총판 등)를 위해 <b>판매사(seller)</b> 필드를 새로 지원합니다.
                신뢰 배지와 스펙 표에 자동 노출됩니다.
              </NewFeature>

              <NewFeature
                icon={<Film className="h-5 w-5" />}
                badge="이미지"
                title="GIF 업로드 · 삽입"
                cost="0.5MB 이하 권장"
              >
                움직이는 상품 사진(GIF)을 업로드해 상세페이지 안에 자연스럽게 배치할 수 있어요.
                &ldquo;켜지는 조명&rdquo;, &ldquo;돌아가는 팬&rdquo; 같은 모션을 그대로 담습니다.
              </NewFeature>

              <NewFeature
                icon={<Sparkles className="h-5 w-5" />}
                badge="품질"
                title="원재료 % 자동 표기"
                cost="자동 · 무료"
              >
                &ldquo;마늘 30&rdquo;처럼 숫자만 적어도 <b>&ldquo;마늘 30%&rdquo;</b>로 자동 보정합니다.
                합계가 100%가 아니면 알림도 뜹니다.
              </NewFeature>

              <NewFeature
                icon={<Globe className="h-5 w-5" />}
                badge="가독성"
                title="한글 자연 줄바꿈 + 문장 완결"
                cost="자동 · 무료"
              >
                모바일에서 어색하게 잘리던 한글 텍스트가 <b>어절 단위로 자연스럽게</b> 줄바꿈됩니다.
                문장 끝이 잘린 경우 자동으로 완결 처리해요.
              </NewFeature>

              <NewFeature
                icon={<Edit3 className="h-5 w-5" />}
                badge="편의"
                title="목록에서 바로 수정 버튼"
                cost="1-클릭"
              >
                &ldquo;내 페이지&rdquo; 목록 카드에서 <b>&ldquo;수정&rdquo; 버튼</b>을 바로 눌러 편집 화면으로 진입할 수 있어요.
                상세 페이지를 열지 않고도 빠르게 다듬을 수 있습니다.
              </NewFeature>

              <NewFeature
                icon={<Trash2 className="h-5 w-5" />}
                badge="관리"
                title="관리자 페이지 삭제"
                cost="관리자 전용"
              >
                운영자 계정에서 부적절한 페이지·테스트 페이지를 <b>안전하게 삭제</b>할 수 있습니다.
                삭제 시 이미지·번역·거래 이력이 함께 정리됩니다.
              </NewFeature>
            </div>

            <div className="mt-10 rounded-2xl border border-brand/20 bg-white p-6">
              <div className="mb-2 flex items-center gap-2 font-semibold text-brand">
                <Gift className="h-5 w-5" />
                요금 정책 조정 안내
              </div>
              <ul className="space-y-1.5 text-[14px] text-ink/80">
                <li>• <b>신규가입 보너스</b>: <b className="text-brand">폐지</b> — 안정적인 서비스 운영을 위해 무료 포인트 지급이 중단되었습니다</li>
                <li>• <b>페이지 생성</b>: 30P → <b className="text-brand">45P</b> (약 4,500원 / 3$) — 이미지·카피 품질 향상 반영</li>
                <li>• <b>재생성·부분 수정·고급 모드 등 나머지 요금은 그대로</b> 유지됩니다 (재생성 30P, 부분 3~10P, 고급 +15P)</li>
                <li>• 기존 가입 회원의 <b>보유 포인트는 변동 없이 그대로</b> 유지됩니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* QUALITY BOOSTER */}
      <section id="quality" className="border-y-2 border-brand/15 bg-gradient-to-b from-brand/[0.03] to-transparent">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-[12px] font-semibold tracking-wide text-brand">
              <Award className="h-3.5 w-3.5" />
              QUALITY BOOSTER
            </div>
            <h2 className="mb-3 font-serif text-[36px] font-bold tracking-tight md:text-[44px]">
              ⭐ 상세페이지 <span className="text-brand">퀄러티 높이는 방법</span>
            </h2>
            <p className="mb-10 text-[16px] text-ink/70">
              같은 45P라도, 이 6가지만 지키면 <b>외주 20만원짜리 수준</b>의 결과를 뽑을 수 있어요.
            </p>

            <div className="space-y-6">
              <QualityTip
                num="01"
                title="상품 특징을 &lsquo;구체적 수치·고유명사&rsquo;로"
                icon={<FileText className="h-5 w-5" />}
              >
                <p className="mb-3">
                  <b>❌ 나쁜 예:</b> <span className="text-ink/60">&ldquo;맛있는 김치&rdquo;, &ldquo;좋은 재료 사용&rdquo;</span>
                </p>
                <p className="mb-3">
                  <b>✅ 좋은 예:</b>{" "}
                  <span className="text-brand">
                    &ldquo;서산 6쪽 마늘 + 신안 천일염 3년 숙성&rdquo;, &ldquo;당일 담근 김치를 24시간 내 발송&rdquo;
                  </span>
                </p>
                <p className="text-[14px] text-ink/70">
                  숫자·지역명·인증명이 들어갈수록 AI는 이를 활용해 <b>후킹 문구·인포그래픽</b>을 훨씬 강력하게 만들어냅니다.
                </p>
              </QualityTip>

              <QualityTip
                num="02"
                title="고해상도 상품 사진 3~5장 업로드"
                icon={<ImageIcon className="h-5 w-5" />}
              >
                <ul className="space-y-2 text-[14px] text-ink/75">
                  <li>
                    <CheckCircle2 className="mr-1 inline h-4 w-4 text-brand" />
                    <b>정면 · 45도 · 클로즈업</b> 3가지 각도 이상
                  </li>
                  <li>
                    <CheckCircle2 className="mr-1 inline h-4 w-4 text-brand" />
                    가로 <b>1024px 이상</b>의 해상도 (스마트폰 기본 촬영 사이즈면 충분)
                  </li>
                  <li>
                    <CheckCircle2 className="mr-1 inline h-4 w-4 text-brand" />
                    <b>자연광</b>이나 <b>흰 배경</b>이 가장 잘 나옵니다. 잡동사니 없이 깔끔하게
                  </li>
                  <li>
                    <CheckCircle2 className="mr-1 inline h-4 w-4 text-brand" />
                    포장·라벨·인증마크가 보이는 사진 1장을 꼭 포함
                  </li>
                </ul>
                <p className="mt-3 text-[13px] text-ink/60">
                  ※ AI 이미지 생성 시 이 사진들을 &ldquo;참고 이미지&rdquo;로 사용해, 실제 상품과의 <b>일관성이 크게 향상</b>됩니다.
                </p>
              </QualityTip>

              <QualityTip
                num="03"
                title="브랜드 스토리 · 창업 배경을 꼭 적기"
                icon={<Sparkles className="h-5 w-5" />}
              >
                <p className="mb-3">
                  &ldquo;추가 정보(extra_info)&rdquo; 필드에 <b>2~3문장</b>이라도 브랜드 스토리를 적어주세요.
                  이 내용은 <b>&ldquo;메이커 스토리&rdquo; 섹션</b>과 <b>신뢰 배지</b>에 자연스럽게 녹아듭니다.
                </p>
                <div className="rounded-lg border border-black/10 bg-white p-4 text-[13px] text-ink/70">
                  <b className="text-brand">예시:</b> &ldquo;3대째 김치를 담그는 서산 종갓집. 어머니가 40년간 지켜온 레시피를
                  손자녀 세대에게도 전하고 싶어 2019년 오가미를 창업했습니다.&rdquo;
                </div>
              </QualityTip>

              <QualityTip
                num="04"
                title="인증·수상·리뷰 수치를 명시"
                icon={<Award className="h-5 w-5" />}
              >
                <p className="mb-3">
                  가지고 계신 <b>객관적 지표</b>는 특징 필드에 반드시 적어주세요. 신뢰 배지로 자동 변환됩니다.
                </p>
                <div className="grid gap-2 md:grid-cols-2 text-[13px] text-ink/75">
                  <div className="rounded border border-black/10 bg-white p-3">
                    ✓ HACCP · 유기농 · KC · FDA 등 <b>인증마크</b>
                  </div>
                  <div className="rounded border border-black/10 bg-white p-3">
                    ✓ &ldquo;누적 판매 <b>10,000개</b>&rdquo;, &ldquo;리뷰 <b>4.9점</b>&rdquo;
                  </div>
                  <div className="rounded border border-black/10 bg-white p-3">
                    ✓ &ldquo;<b>대상경제신문</b> 우수상품 선정&rdquo;
                  </div>
                  <div className="rounded border border-black/10 bg-white p-3">
                    ✓ &ldquo;<b>홈쇼핑 완판</b>&rdquo;, &ldquo;방송 노출&rdquo;
                  </div>
                </div>
              </QualityTip>

              <QualityTip
                num="05"
                title="카테고리에 맞는 스타일 선택"
                icon={<Palette className="h-5 w-5" />}
              >
                <div className="grid gap-2 md:grid-cols-2 text-[14px] text-ink/75">
                  <div>
                    <b className="text-brand">Editorial</b> — 식품, 수제품, 스토리 중심 브랜드
                  </div>
                  <div>
                    <b className="text-brand">Minimal</b> — 홈·리빙, 문구, 라이프스타일
                  </div>
                  <div>
                    <b className="text-brand">Bold</b> — 전자기기, 테크 · 성능이 자랑거리인 제품
                  </div>
                  <div>
                    <b className="text-brand">Info</b> — 건강기능식품, 성분·효능이 중요한 제품
                  </div>
                  <div>
                    <b className="text-brand">Luxury</b> — 프리미엄 뷰티, 고가 액세서리
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-ink/60">
                  ※ 잘못 고르셨다면 30P로 다른 스타일로 재생성해서 비교해 보세요. (재생성은 스타일 변경 시 30P 고정)
                </p>
              </QualityTip>

              <QualityTip
                num="06"
                title="Self-Critique(자기 검수) 모드 활용"
                icon={<Lightbulb className="h-5 w-5" />}
              >
                <p className="mb-3">
                  <b>&ldquo;자기 검수 모드&rdquo;</b>는 AI가 카피를 1차 생성한 뒤,
                  <b>자기가 쓴 초고를 다시 읽고 어색한 부분을 스스로 수정</b>하는 <b>2-Pass 프로세스</b>입니다.
                  사람으로 치면 &ldquo;초고 → 퇴고&rdquo; 과정을 한 번의 요청 안에서 자동으로 수행합니다.
                </p>
                <div className="grid gap-3 md:grid-cols-2 mb-3">
                  <div className="rounded-lg border border-black/10 bg-white p-4 text-[13px]">
                    <b className="text-ink/60">Pass 1 (초고)</b>
                    <div className="mt-1 text-ink/70">
                      &ldquo;맛있는 김치, 좋은 재료로 만들었습니다&rdquo;
                    </div>
                  </div>
                  <div className="rounded-lg border border-brand/30 bg-brand/[0.03] p-4 text-[13px]">
                    <b className="text-brand">Pass 2 (자기 검수 후)</b>
                    <div className="mt-1 text-ink/85">
                      &ldquo;3대째 지켜온 종갓집 레시피 — 첫 한 입에 알게 됩니다.&rdquo;
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-brand/5 border border-brand/20 p-4 text-[13px] text-ink/75 mb-3">
                  <b>검수 기준:</b> 반복 어휘 제거 · 후킹 문구 강화 · 구체적 표현 · 카테고리 톤 일치<br />
                  <b>ON일 때:</b> 소요 시간 2배(약 15~20초), 완성도 확연히 상승<br />
                  <b>OFF일 때:</b> 기본 1-Pass — 빠르고 저렴 (8~12초)
                </div>

                <p className="mt-4 mb-2 font-semibold text-ink">🎯 Self-Critique가 자동 적용되는 3가지 경우</p>
                <div className="space-y-2 text-[13px]">
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <span className="rounded-full bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 flex-shrink-0">1</span>
                    <div>
                      <b className="text-amber-900">★ Pro 회원</b> — Pro 등급 회원은{" "}
                      <b>모든 페이지 생성에서 자동으로 Self-Critique가 적용</b>됩니다.
                      추가 요금 없이 프리미엄 품질을 항상 사용하실 수 있습니다.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-brand/[0.03] border border-brand/20 p-3">
                    <span className="rounded-full bg-brand text-white text-[11px] font-bold px-2 py-0.5 flex-shrink-0">2</span>
                    <div>
                      <b className="text-brand">고급 모드 체크박스 (+15P)</b> — Free 회원도 페이지 생성 시
                      <b> &ldquo;AI 카피 재검수&rdquo; 체크박스</b>를 선택해 건별로 자유롭게 사용할 수 있습니다.
                      추가 15P만 부담하시면 됩니다 (기본 45P → 60P).
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <span className="rounded-full bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 flex-shrink-0">3</span>
                    <div>
                      <b className="text-blue-900">🔁 재생성 시 자동 무료 적용</b> — 첫 결과가 마음에 안 드셔서
                      결과 페이지의 <b>&ldquo;재생성&rdquo; 버튼</b>을 누르시면, 재생성 요금 <b>30P</b>만 차감하고
                      <b> Self-Critique는 무료로 자동 적용</b>됩니다. 재도전 시엔 더 정제된 카피가 나옵니다.
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-ink/60">
                  ※ 페이지 결과 화면에서 <b>&ldquo;✨ Self-Critique 2-Pass 적용됨&rdquo;</b> 배지로 실제 적용 여부를 확인할 수 있습니다.
                </p>
              </QualityTip>
            </div>

            {/* Anti-pattern */}
            <div className="mt-10 rounded-2xl border-2 border-red-300/40 bg-red-50/40 p-6">
              <div className="mb-3 flex items-center gap-2 text-red-700 font-semibold">
                <AlertTriangle className="h-5 w-5" />
                이렇게 하면 퀄러티가 떨어져요
              </div>
              <ul className="space-y-2 text-[14px] text-red-900/80">
                <li>• 특징 필드에 &ldquo;좋아요&rdquo;, &ldquo;맛있어요&rdquo; 같은 <b>추상적 표현</b>만 나열</li>
                <li>• <b>이미지 미업로드</b>로 참고할 소스가 없는 상태</li>
                <li>• 카테고리와 어울리지 않는 <b>스타일 선택</b> (예: 프리미엄 뷰티에 Bold 스타일)</li>
                <li>• 한 번 생성 후 결과가 마음에 안 들면 <b>정보 보강 없이 재생성</b>만 반복</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center font-serif text-[32px] font-bold tracking-tight">자주 묻는 질문</h2>
          <div className="space-y-3">
            <Faq q="1장에 정말 45P만 들어가나요?">
              네. 텍스트 + 9개 이미지 + 신뢰 배지 + 브랜드 스토리까지 포함해서 <b>45P(약 4,500원 / 3$) 고정</b>입니다.
              생성이 실패한 경우엔 자동 환불됩니다.
            </Faq>
            <Faq q="다른 사이트에서 만든 상품 사진을 그대로 써도 되나요?">
              저작권이 있는 이미지 사용은 지양해 주세요. 본인이 촬영한 원본을 업로드하시는 것을 권장합니다.
            </Faq>
            <Faq q="스마트스토어·쿠팡에 바로 붙일 수 있나요?">
              네. 세로 슬라이드 이미지와 HTML을 모두 제공하기 때문에 어느 오픈마켓이든 즉시 사용할 수 있어요.
            </Faq>
            <Faq q="포인트 유효기간이 있나요?">
              현재는 없습니다. 충전 후 언제든 사용하실 수 있어요.
            </Faq>
            <Faq q="영어/일본어 페이지도 자동으로 만들어지나요?">
              네. 상단 언어 스위처로 언어를 바꾸면 <b>4개 국어(한/영/일/중)</b>로 자동 번역된 페이지가 표시됩니다.
            </Faq>
            <Faq q="Pro 회원은 뭐가 다른가요?">
              <b>Pro 회원</b>은 모든 페이지 생성 시 <b>Self-Critique 2-Pass가 자동 적용</b>되어
              추가 요금 없이 항상 최고 품질의 카피를 받을 수 있습니다. 등급 승격은 관리자에게 문의해 주세요.
            </Faq>
            <Faq q="재생성이 뭔가요? 언제 사용하나요?">
              페이지 결과가 마음에 들지 않을 때 상세 화면의 <b>&ldquo;재생성&rdquo; 버튼</b>을 누르면
              같은 상품·스타일로 완전히 새로운 카피/이미지를 만듭니다. 이때{" "}
              <b>Self-Critique가 무료로 자동 적용</b>되어 첫 번보다 정제된 결과를 얻을 수 있습니다.
              비용은 <b>재생성 요금 30P</b>만 차감됩니다.
            </Faq>
            <Faq q="부분 수정은 얼마인가요? 몇 번까지 되나요?">
              필요한 섹션만 골라서 재생성하는 <b>&ldquo;선택 섹션 수정&rdquo;</b>은 섹션 1개당 <b>3P부터</b>,
              여러 섹션을 골라도 <b>최대 10P</b>로 저렴합니다.
              <b> 수정 횟수 제한은 없습니다</b> — 포인트만 남아 있으면 원하는 만큼 반복할 수 있어요.
            </Faq>
            <Faq q="고급 모드(+15P)는 어떻게 사용하나요?">
              페이지 생성 마법사의 <b>3단계 &ldquo;언어 선택&rdquo;</b>에서 &ldquo;AI가 카피를 스스로 재검수&rdquo;
              체크박스를 켜시면 됩니다. 총 <b>60P (기본 45P + 고급 15P)</b>가 차감되며, 진부한 표현 제거와
              후킹 강화가 자동으로 적용됩니다.
            </Faq>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/[0.06] bg-white/50">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="mb-3 font-serif text-[32px] font-bold tracking-tight md:text-[40px]">
            지금 바로 <span className="text-brand">무료로 1장</span> 만들어 보기
          </h2>
          <p className="mb-8 text-[15px] text-ink/70">회원가입 후 포인트 충전해서 바로 시작하세요</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-[15px] font-medium text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark hover:shadow-md hover:shadow-brand/30"
          >
            무료로 시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] bg-ivory-light">
        <div className="container mx-auto px-6 py-8 text-center text-[13px] text-ink/50">
          © {new Date().getFullYear()} 88km · 문의: modoomodoo88@gmail.com
        </div>
      </footer>
    </main>
  );
}

/* ============= Sub-components ============= */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </div>
      <div className="font-serif text-[28px] font-bold text-brand">{value}</div>
      <div className="mt-1 text-[13px] text-ink/60">{label}</div>
    </div>
  );
}

function Section({
  id,
  step,
  title,
  icon,
  children,
  alt,
}: {
  id: string;
  step: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  alt?: boolean;
}) {
  return (
    <section id={id} className={alt ? "bg-white/50 border-y border-black/[0.04]" : ""}>
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold tracking-widest text-brand">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              {icon}
            </div>
            {step}
          </div>
          <h2 className="mb-6 font-serif text-[30px] font-bold tracking-tight md:text-[36px]">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </section>
  );
}

function Callout({
  type,
  title,
  children,
}: {
  type: "info" | "tip" | "warn";
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50/50 text-blue-900",
    tip: "border-brand/20 bg-brand/[0.04] text-ink",
    warn: "border-amber-200 bg-amber-50/50 text-amber-900",
  }[type];
  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <div className="mb-1 flex items-center gap-2 text-[14px] font-semibold">
        {type === "info" && <CheckCircle2 className="h-4 w-4" />}
        {type === "tip" && <Lightbulb className="h-4 w-4 text-brand" />}
        {type === "warn" && <AlertTriangle className="h-4 w-4" />}
        {title}
      </div>
      <div className="text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}

function FieldCard({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/[0.08] bg-white p-4">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[13px] font-semibold text-ink">{label}</span>
        {required && (
          <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
            필수
          </span>
        )}
      </div>
      <div className="text-[13px] leading-relaxed text-ink/70">{children}</div>
    </div>
  );
}

function StyleCard({
  name,
  desc,
  example,
}: {
  name: string;
  desc: string;
  example: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.08] bg-white p-4">
      <div className="mb-1 font-serif text-[18px] font-bold text-brand">{name}</div>
      <div className="text-[13px] text-ink/70">{desc}</div>
      <div className="mt-2 text-[12px] text-ink/50">추천: {example}</div>
    </div>
  );
}

function FeatureBlock({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
      <div className="mb-2 flex items-center gap-2 text-brand">
        {icon}
        <span className="font-semibold text-ink">{title}</span>
      </div>
      <div className="text-[14px] leading-relaxed text-ink/70">{children}</div>
    </div>
  );
}

function QualityTip({
  num,
  title,
  icon,
  children,
}: {
  num: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="font-serif text-[32px] font-bold text-brand/30 leading-none">{num}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-brand mb-1">{icon}</div>
          <h3 className="font-serif text-[20px] font-bold text-ink">{title}</h3>
        </div>
      </div>
      <div className="ml-14 text-[14px] leading-relaxed text-ink/80">{children}</div>
    </div>
  );
}

function NewFeature({
  icon,
  badge,
  title,
  cost,
  children,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  cost: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm transition hover:border-brand/30 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
            {icon}
          </div>
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
            {badge}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-ink/50">{cost}</span>
      </div>
      <h3 className="mb-2 font-serif text-[17px] font-bold text-ink">{title}</h3>
      <div className="text-[13px] leading-relaxed text-ink/70">{children}</div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-black/[0.08] bg-white p-5 open:shadow-sm">
      <summary className="cursor-pointer list-none font-semibold text-ink flex items-center justify-between">
        <span>Q. {q}</span>
        <span className="text-brand transition group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-3 text-[14px] leading-relaxed text-ink/75">{children}</div>
    </details>
  );
}
