# SangSePage - AI 상세페이지 자동 생성 SaaS

AI로 5초만에 프로급 상품 상세페이지를 자동 생성하는 웹 서비스입니다.

## 🎯 프로젝트 개요

- **이름**: SangSePage (상세페이지)
- **목표**: 이커머스 셀러들이 상품 정보만 입력하면 프로급 상세페이지를 AI가 자동 생성
- **주요 특징**:
  - ✅ 5가지 전문 스타일 (김치·생활용품·전자제품·건강식품·화장품)
  - ✅ 4개 언어 지원 (한국어·영어·중국어·일본어)
  - ✅ 860px 고정폭 (한국 이커머스 표준)
  - ✅ HTML/PDF/이미지 슬라이스 다운로드
  - ✅ 재수정 기능 (횟수 제한으로 크레딧 낭비 방지)
  - ✅ 포인트 시스템 (충전형 유료 서비스)

## 🌐 URLs

- **로컬 개발**: http://localhost:3000
- **프로덕션** (배포 후): https://sangsepage.vercel.app
- **GitHub**: https://github.com/ggf922/sangsepage

## 🏗️ 기술 스택

| 계층 | 기술 |
|---|---|
| **프론트엔드** | Next.js 15.5 (App Router) + React 19 + TailwindCSS |
| **백엔드** | Next.js API Routes (Serverless) |
| **인증** | Supabase Auth |
| **데이터베이스** | Supabase Postgres (RLS 활성화) |
| **파일 저장소** | Supabase Storage |
| **AI - 카피** | OpenAI GPT-4o |
| **AI - 이미지** | Google Gemini (Nano Banana Pro) |
| **결제** | 토스페이먼츠 (예정) |
| **배포** | Vercel |

## 📦 프로젝트 구조

```
webapp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 랜딩페이지
│   │   ├── auth/              # 로그인/회원가입
│   │   ├── dashboard/         # 사용자 대시보드
│   │   │   ├── products/      # 상품 관리
│   │   │   ├── pages/         # 생성된 상세페이지
│   │   │   ├── generate/      # 생성 마법사
│   │   │   └── mypage/        # 마이페이지 & 충전
│   │   └── admin/             # 관리자 페이지
│   │       ├── templates/     # 템플릿 CRUD
│   │       ├── users/         # 회원 관리
│   │       ├── points/        # 포인트 상품 관리
│   │       └── analytics/     # 통계
│   ├── components/            # 재사용 컴포넌트
│   ├── lib/
│   │   ├── supabase/         # Supabase 클라이언트
│   │   └── utils.ts
│   └── middleware.ts          # 인증 미들웨어
├── supabase/
│   └── migrations/            # DB 스키마 SQL
│       ├── 0001_initial_schema.sql
│       └── 0002_seed_data.sql
├── public/
└── package.json
```

## 🗄️ 데이터베이스 스키마

| 테이블 | 설명 |
|---|---|
| `users` | 사용자 프로필 (auth.users 확장) |
| `templates` | 5가지 스타일 템플릿 (관리자 CRUD) |
| `products` | 상품 정보 (사용자 CRUD) |
| `generated_pages` | 생성된 상세페이지 |
| `point_transactions` | 포인트 거래 내역 |
| `point_packages` | 충전 상품 (스타터/베이직/프로/에이전시) |

**RLS (Row Level Security)** 활성화로 사용자는 본인 데이터만 접근 가능.

## 💰 포인트 시스템

| 액션 | 소비 P |
|---|---|
| 상세페이지 최초 생성 | 30 P |
| 재수정 (부분) | 10 P |
| 다국어 추가 생성 | 20 P |
| 다운로드 | 0 P (무료) |

**신규가입 100P 무료** (상세페이지 3장 제작 가능)

## 🎨 5가지 스타일 템플릿

| 코드 | 이름 | 카테고리 | 톤 |
|---|---|---|---|
| A | 오가미 스타일 | 김치·식품 | 전통·감성 |
| B | 모던 미니멀 | 생활용품 | 미니멀·기능성 |
| C | 테크 프리미엄 | 전자제품 | 하이테크·전문 |
| D | 클린 내추럴 | 건강식품 | 신뢰·자연 |
| E | 럭셔리 뷰티 | 화장품 | 럭셔리·부드러움 |

## 🚀 로컬 개발 시작하기

### 1) 환경변수 설정

```bash
cp .env.example .env.local
# 실제 값을 입력하세요
```

필요한 환경변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

### 2) 의존성 설치

```bash
npm install
```

### 3) DB 마이그레이션

Supabase Dashboard → SQL Editor에서 순서대로 실행:
1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_seed_data.sql`

### 4) 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

## 📋 개발 로드맵

- [x] **Phase 1**: 프로젝트 세팅 (Next.js + TypeScript + TailwindCSS)
- [x] **Phase 2**: 인증 시스템 (로그인/회원가입/미들웨어)
- [x] **Phase 3**: 관리자 페이지 기본 구조
- [x] **Phase 4**: 대시보드 페이지 기본 구조
- [x] **Phase 5**: DB 스키마 & Seed 데이터
- [ ] **Phase 6**: 상품 정보 CRUD 폼 (이미지 업로드)
- [ ] **Phase 7**: AI 생성 엔진 (GPT-4o 카피 + Nano Banana 이미지)
- [ ] **Phase 8**: 미리보기 & 다운로드 (HTML/PDF)
- [ ] **Phase 9**: 재수정 기능 (횟수 제한)
- [ ] **Phase 10**: 토스페이먼츠 결제 연동
- [ ] **Phase 11**: 다국어 (i18n) 지원

## 🚢 배포

**Vercel + GitHub 자동 배포**

1. GitHub에 푸시하면 Vercel이 자동 감지
2. Vercel Dashboard에서 환경변수 설정
3. 자동 빌드 & 배포

## 📄 라이선스

Proprietary. All rights reserved.
