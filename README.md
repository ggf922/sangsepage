# SangSePage - AI 상세페이지 자동 생성 SaaS

AI로 5초만에 프로급 상품 상세페이지를 자동 생성하는 웹 서비스입니다.

## 🎯 프로젝트 개요

- **이름**: SangSePage (상세페이지)
- **목표**: 셀러가 상품 정보만 입력하면 5가지 스타일 × 4개국어의 프로급 상세페이지를 AI로 자동 생성
- **표준**: 860px 고정폭 한국 이커머스 (스마트스토어/쿠팡/자사몰 즉시 사용 가능)
- **참고 디자인**: 오가미 열무물김치 상세페이지

## 🌐 URL

- **로컬 개발**: http://localhost:3000
- **GitHub 저장소**: https://github.com/ggf922/sangsepage
- **프로덕션 배포**: (Vercel 예정)

## ✅ 완료된 기능

### 회원/인증 시스템
- ✅ 이메일 회원가입 (가입 즉시 100P 무료 지급)
- ✅ 로그인/로그아웃 (Supabase Auth + @supabase/ssr)
- ✅ 마이페이지 (포인트 잔액, 프로필 정보)
- ✅ 이용 내역 (포인트 거래 + 충전 신청 탭 UI)

### 상품 관리 (Phase 6)
- ✅ 상품 등록/수정/삭제 (`/dashboard/products`)
- ✅ 이미지 업로드 (Supabase Storage, Storage RLS)
- ✅ 판매 채널 관리 (스마트스토어/쿠팡/자사몰 등 9종)
- ✅ 원재료/특징/추가정보 입력

### AI 생성 엔진 (Phase 7)
- ✅ 4단계 위저드 UI (상품 → 템플릿 → 언어 → 확인)
- ✅ OpenAI GPT-4o mini 카피 생성 (`response_format: json_object`)
- ✅ Gemini Nano Banana / Pro 이미지 생성
- ✅ 5가지 스타일 템플릿 (A~E: 김치·오가미 / 생활용품 / 전자제품 / 건강식품 / 화장품)
- ✅ 4개국어 카피 (ko/en/zh/ja)
- ✅ HTML 렌더러 (860px 고정폭)
- ✅ 생성 실패 시 자동 포인트 환불

### 편집 기능 (Phase 8)
- ✅ 3가지 재생성 모드
  - `copy_only` (5P): 카피만 재생성
  - `images_only` (10P): 이미지만 재생성
  - `all` (10P): 전체 재생성
- ✅ 편집 횟수 관리 (최대 3회, `edit_count` 트래킹)
- ✅ 실패 시 자동 환불
- ✅ Sticky 현재 미리보기 (55% 스케일)

### 결과 페이지
- ✅ 상태별 UI (생성중 / 완료 / 실패+환불안내)
- ✅ 860px iframe 미리보기
- ✅ HTML 파일 다운로드 (한글 안전 파일명)
- ✅ 공유 링크 복사

### 포인트 시스템
- ✅ 가입 축하 100P 자동 지급
- ✅ 페이지 생성 30P 차감
- ✅ 편집 5~10P 차감
- ✅ 언어 추가 20P (설계됨)
- ✅ 실패 시 자동 환불
- ✅ 거래 내역 (charge / usage / refund / bonus / admin_adjust)

### 무통장입금 충전 시스템
- ✅ 계좌 정보 표시: **케이뱅크 100 300 095296 큰바구니**
- ✅ 4가지 패키지 + 직접 금액 입력 (100원 = 1P)
- ✅ 회원 신청 → 관리자 승인 워크플로우
- ✅ 대기중 최대 3건 제한
- ✅ 취소 기능 (본인, pending 상태만)
- ✅ 관리자 승인 시 즉시 포인트 지급 + 거래 내역 기록
- ✅ 반려 시 관리자 메모 필수

### 관리자 시스템
- ✅ **대시보드** (`/admin`) - 통계 카드 + 대기 충전 배너 + 최근 신청
- ✅ **회원 관리** (`/admin/users`) - 최근 100명 목록
- ✅ **템플릿 관리** (`/admin/templates`) - CRUD, 활성/비활성 토글
- ✅ **페이지 모니터링** (`/admin/pages`) - 상태 필터, 사용 포인트, 편집 횟수
- ✅ **충전 승인** (`/admin/charges`) - 상태 필터 탭, 승인/반려 모달, 매출 총계
- ✅ **포인트 패키지** (`/admin/points`) - 4개 패키지 관리
- ✅ **통계 대시보드** (`/admin/analytics`)
  - KPI 카드 (누적 매출/회원/생성/사용 포인트)
  - 최근 7일 매출/생성 막대 차트
  - 인기 템플릿 랭킹
  - 언어별 분포
  - 상위 사용자 TOP 10
  - 포인트 흐름 요약
- ✅ 사이드바 대기중 충전 신청 뱃지 카운트

### 국제화 (Phase 11)
- ✅ 4개국어 지원: 한국어(기본) / English / 中文 / 日本語
- ✅ 언어 스위처 (홈페이지 / 로그인 / 대시보드 / 관리자 우상단)
- ✅ 쿠키 기반 로케일 유지 (1년)
- ✅ Server Component `getI18n()` + Client Component `useT()` 훅
- ✅ `<html lang>` 동적 매핑 (ko / en / zh-CN / ja)
- ✅ 전체 번역 사전 (common/brand/auth/nav/points/charge/products/generate/pages/admin/templates)

## 🚧 진행 예정

- [ ] Vercel 프로덕션 배포 및 환경변수 설정
- [ ] 커스텀 도메인 연결
- [ ] Toss Payments 결제 자동화 (현재는 무통장입금)
- [ ] 각 사용자 개별 페이지의 전체 번역 확장 (현재는 레이아웃/네비/공용 UI만)
- [ ] 이메일 알림 (승인 완료, 반려)
- [ ] 페이지 공유 URL (비회원 접근용)

## 🔗 주요 URI

### 인증
| 경로 | 설명 |
|------|------|
| `/auth/signup` | 회원가입 (100P 무료 지급) |
| `/auth/login` | 로그인 |
| `/auth/callback` | Supabase Auth 콜백 |

### 대시보드 (로그인 필수)
| 경로 | 설명 |
|------|------|
| `/dashboard` | 대시보드 홈 |
| `/dashboard/products` | 상품 목록 |
| `/dashboard/products/new` | 새 상품 등록 |
| `/dashboard/products/[id]/edit` | 상품 수정 |
| `/dashboard/generate` | 페이지 생성 위저드 |
| `/dashboard/pages` | 내 생성 페이지 목록 |
| `/dashboard/pages/[id]` | 결과 페이지 (미리보기/다운로드) |
| `/dashboard/pages/[id]/edit` | 페이지 편집 |
| `/dashboard/mypage` | 마이페이지 |
| `/dashboard/mypage/charge` | 포인트 충전 신청 |
| `/dashboard/mypage/history` | 이용 내역 (거래+충전 탭) |

### API
| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/api/generate` | POST | 페이지 생성 오케스트레이터 |
| `/api/pages/[id]/edit` | POST | 편집 오케스트레이터 |
| `/api/pages/[id]/preview` | GET | HTML 미리보기 (auth-gated) |
| `/api/pages/[id]/download` | GET | HTML 파일 다운로드 |
| `/api/upload/product-image` | POST | 상품 이미지 업로드 |

### 관리자 (role='admin' 필수)
| 경로 | 설명 |
|------|------|
| `/admin` | 관리자 대시보드 |
| `/admin/users` | 회원 관리 |
| `/admin/templates` | 템플릿 CRUD |
| `/admin/templates/new` | 새 템플릿 |
| `/admin/templates/[id]/edit` | 템플릿 편집 |
| `/admin/templates/[id]/preview` | 템플릿 미리보기 |
| `/admin/pages` | 페이지 모니터링 |
| `/admin/charges` | 충전 승인 |
| `/admin/points` | 포인트 패키지 |
| `/admin/analytics` | 통계 대시보드 |

## 🗂️ 데이터 아키텍처

### Supabase Postgres 테이블
- `users` - 회원 정보 (id, email, name, role, points)
- `products` - 상품 정보 (JSONB: sales_channels, images, ingredients, features, extra_info)
- `templates` - 5가지 스타일 템플릿 (JSONB: colors, layout_config)
- `generated_pages` - 생성된 상세페이지 (status, html_content, points_used, edit_count, max_edits=3)
- `point_transactions` - 포인트 거래 내역 (type: charge/usage/refund/bonus/admin_adjust)
- `point_packages` - 4가지 충전 패키지
- `charge_requests` - 무통장입금 신청 (status: pending/approved/rejected/cancelled)

### Supabase Storage
- `product-images` 버킷 - 사용자 업로드 상품 이미지 (RLS 적용)
- `generated-images` 버킷 - AI 생성 이미지 (사용자별 폴더 분리)

### 마이그레이션 상태
- ✅ `0001_initial_schema.sql` - 기본 테이블
- ✅ `0002_seed_data.sql` - 5개 템플릿 + 4개 포인트 패키지 시드
- ✅ `0003_storage_policies.sql` - Storage RLS
- ✅ `0004_charge_requests.sql` - 충전 신청 테이블

## 👤 사용자 가이드

### 첫 방문자
1. 홈페이지에서 우상단 언어 선택 (🇰🇷/🇺🇸/🇨🇳/🇯🇵)
2. "무료 시작" 또는 "회원가입" 클릭
3. 이메일/비밀번호/이름 입력 → 가입 즉시 **100P** 자동 지급

### 상세페이지 생성 (30P)
1. 대시보드 → 상품 관리에서 상품 등록 (이미지, 판매채널, 특징 등)
2. "+ 새로 만들기" 클릭 → 위저드 진행
   - Step 1: 상품 선택
   - Step 2: 5개 템플릿 중 선택
   - Step 3: 언어 (ko/en/zh/ja) + 이미지 품질 (Nano Banana / Pro)
   - Step 4: 확인 후 "생성하기"
3. AI가 카피 + 이미지 생성 (약 30~60초 소요)
4. 결과 페이지에서 미리보기 + HTML 다운로드

### 페이지 편집 (5~10P, 최대 3회)
1. 내 페이지 → 편집할 페이지 클릭
2. "페이지 수정" 클릭
3. 3가지 모드 중 선택:
   - 카피만 재생성 (5P)
   - 이미지만 재생성 (10P)
   - 전체 재생성 (10P)

### 포인트 충전 (무통장입금)
1. 마이페이지 → 포인트 충전
2. 패키지 선택 또는 직접 금액 입력
3. 입금자명 입력 → "충전 신청"
4. **케이뱅크 100 300 095296 큰바구니** 계좌로 입금
5. 관리자 승인 후 즉시 포인트 지급 (영업일 기준 1일)

## 🛠️ 배포 정보

- **플랫폼**: Vercel (예정) / 현재는 Novita Sandbox
- **런타임**: Next.js 15.5.20 App Router (Server Actions + Server Components)
- **상태**: 🟡 개발 완료, 프로덕션 배포 대기 중
- **기술 스택**:
  - Next.js 15.5.20 + React 19
  - TailwindCSS + shadcn/ui + Radix UI
  - Supabase (Auth + Postgres + Storage + RLS)
  - OpenAI GPT-4o mini (카피 생성)
  - Google Gemini Nano Banana / Pro (이미지 생성)
  - PM2 (프로세스 관리)
- **최근 업데이트**: 2026-07-15

## 🚀 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# PM2로 프로덕션 실행
pm2 start ecosystem.config.cjs
```

### 환경변수 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
GEMINI_API_KEY=...
```

## 📊 커밋 히스토리 (주요)

- `6fee00f` feat(i18n): Phase 11 - 4개국어 국제화 기반 구축 (ko/en/zh/ja)
- `2ed94ec` feat(admin): 실제 통계 대시보드 및 페이지 모니터링 구현
- `9a9c485` feat(phase8): 상세페이지 수정 기능 (3가지 재생성 모드)
- `518f8fd` feat: 무통장입금 충전 시스템 (관리자 승인 방식)
- `d770725` feat(phase7): AI generation engine complete
- `0e7b40c` feat(phase6): complete Product CRUD
