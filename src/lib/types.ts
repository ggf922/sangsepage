// ============================================================
// 88km - Domain Types
// ============================================================

export type UserRole = "user" | "admin";
export type UserTier = "free" | "pro";
export type PageStatus = "draft" | "generating" | "completed" | "failed";
export type Language = "ko" | "en" | "zh" | "ja";
export type TransactionType = "charge" | "usage" | "refund" | "bonus" | "admin_adjust";

// 판매 채널
export type SaleChannelType = "smartstore" | "coupang" | "own_mall" | "gmarket" | "auction" | "11st" | "wemakeprice" | "tmon" | "other";

export interface SaleChannel {
  type: SaleChannelType;
  url?: string;
  price?: number;
  note?: string;
}

// 이미지 아이템 (상품 이미지)
export interface ProductImage {
  id: string;
  url: string;
  path: string; // Storage 내부 경로 (삭제용)
  role: "main" | "detail" | "lifestyle" | "ingredient" | "gif" | "other";
  order: number;
  width?: number;
  height?: number;
  size?: number; // bytes
  name?: string; // 원본 파일명
  mime_type?: string; // MIME 타입 (GIF 여부 판별용)
  gif_position?: GifPosition; // GIF일 때만 유효: 상세페이지 내 삽입 위치
  gif_caption?: string; // GIF 하단에 표시할 캡션 (선택)
}

// GIF 삽입 위치 (김치·식품 상세페이지 표준 슬롯)
export type GifPosition =
  | "after_hero" // 히어로 직후 (첫인상)
  | "after_intro" // 인트로 직후 (스토리 몰입)
  | "after_points" // 핵심 셀링포인트 직후 ⭐ 소비자 선호 1위
  | "after_detail" // 상세컷 직후 (질감·디테일)
  | "after_process" // 제조 과정 직후 (동작·움직임)
  | "after_lifestyle" // 라이프스타일 직후 (사용 장면)
  | "before_signature"; // 시그니처 직전 (마무리 감성)

// 원재료
export interface Ingredient {
  name: string;
  origin?: string;
  percentage?: number;
  note?: string;
}

// 상품 특징 (포인트)
export interface ProductFeature {
  icon?: string; // lucide icon name
  title: string;
  description?: string;
}

// 추가 정보 (spec, shipping 등)
export interface ProductExtraInfo {
  // Basic Spec
  weight?: string;
  volume?: string;
  size?: string;
  material?: string;
  manufacturer?: string;
  seller?: string;
  expiry?: string;
  storage?: string;
  usage?: string;
  precautions?: string;

  // 배송/AS
  shipping_method?: string;
  shipping_fee?: string;
  shipping_period?: string;
  return_policy?: string;
  refund_policy?: string;
  as_info?: string;

  // 브랜드
  brand_name?: string;
  brand_story?: string;

  // 인증/수상
  certifications?: string[];
  awards?: string[];

  // 추가 커스텀 필드
  custom?: Record<string, string>;
}

// ============ DB Rows ============

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  tier: UserTier;
  points: number;
  total_generated: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  thumbnail_url: string | null;
  design_tokens: Record<string, any>;
  sections: string[];
  image_prompts: Record<string, string>;
  copy_prompts: Record<string, string>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  origin: string | null;
  price: number | null;
  sale_channels: SaleChannel[];
  ingredients: Ingredient[];
  features: ProductFeature[];
  brand_tone: string | null;
  extra_info: ProductExtraInfo;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface GeneratedPage {
  id: string;
  user_id: string;
  product_id: string | null;
  template_id: string | null;
  language: Language;
  share_id: string | null;
  html_content: string | null;
  html_print: string | null;
  generated_copy: Record<string, any>;
  generated_images: any[];
  edit_count: number;
  max_edits: number;
  points_used: number;
  status: PageStatus;
  error_message: string | null;
  // === Self-Critique / 재생성 추적 (0006 migration) ===
  regeneration_count: number; // 0 = 최초 생성, 1+ = 재생성
  source_page_id: string | null; // 재생성 시 원본 페이지 참조
  self_critique_used: boolean; // 실제 Self-Critique 적용 여부
  premium_requested: boolean; // 사용자가 고급 모드 체크박스 선택 여부
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  payment_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface PointPackage {
  id: string;
  code: string;
  name: string;
  points: number;
  price: number;
  bonus_points: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// ============ 포인트 충전 신청 (무통장입금) ============
export type ChargeStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ChargeRequest {
  id: string;
  user_id: string;
  package_id: string | null;
  points: number;
  amount: number;
  depositor_name: string;
  contact: string | null;
  memo: string | null;
  status: ChargeStatus;
  approved_by: string | null;
  approved_at: string | null;
  admin_memo: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

// 은행 계좌 정보 (충전 안내용)
export const BANK_ACCOUNT = {
  bank: "케이뱅크",
  number: "100 300 095296",
  holder: "큰바구니",
  fullText: "케이뱅크 100 300 095296 큰바구니",
} as const;

export const CHARGE_STATUS_META: Record<ChargeStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "입금 대기", color: "#0369a1", bgColor: "#dbeafe" },
  approved: { label: "충전 완료", color: "#15803d", bgColor: "#dcfce7" },
  rejected: { label: "거부됨", color: "#b91c1c", bgColor: "#fee2e2" },
  cancelled: { label: "취소됨", color: "#6b7280", bgColor: "#f3f4f6" },
};

// ============ Point Cost Constants ============
// 환율: 100원 = 1P
// - CREATE_PAGE 45P = 4,500원 (약 3$) — 1회 상세페이지 생성 비용
// - SIGNUP_BONUS 50P = 5,000원 — 신규가입 시 1회 무료 생성 + 소액 수정 여유
export const POINT_COSTS = {
  CREATE_PAGE: 45,
  EDIT_PAGE: 10,
  ADD_LANGUAGE: 20,
  SIGNUP_BONUS: 50,
  PREMIUM_MODE_SURCHARGE: 15, // Self-Critique 고급 모드 추가 요금 (Free 회원만 적용)
} as const;

// 회원 등급 메타
export const USER_TIER_META: Record<UserTier, { label: string; badge: string; color: string }> = {
  free: { label: "무료", badge: "Free", color: "#64748b" },
  pro: { label: "프로", badge: "Pro", color: "#a71d1d" },
};

export const MAX_EDITS_DEFAULT = 3;

// ============ 판매 채널 메타 ============
export const SALE_CHANNEL_META: Record<SaleChannelType, { label: string; color: string; icon: string }> = {
  smartstore: { label: "스마트스토어", color: "#03C75A", icon: "🟢" },
  coupang: { label: "쿠팡", color: "#FF6E14", icon: "🟠" },
  own_mall: { label: "자사몰", color: "#a71d1d", icon: "🏪" },
  gmarket: { label: "G마켓", color: "#00A63C", icon: "🟢" },
  auction: { label: "옥션", color: "#FFCA00", icon: "🟡" },
  "11st": { label: "11번가", color: "#FF0038", icon: "🔴" },
  wemakeprice: { label: "위메프", color: "#EE3236", icon: "🔴" },
  tmon: { label: "티몬", color: "#EE2144", icon: "🔴" },
  other: { label: "기타", color: "#666", icon: "🔗" },
};

export const IMAGE_ROLE_META: Record<ProductImage["role"], { label: string; description: string }> = {
  main: { label: "메인", description: "대표 이미지 (썸네일)" },
  detail: { label: "상세", description: "상세 컷 (본문)" },
  lifestyle: { label: "연출", description: "라이프스타일 컷" },
  ingredient: { label: "원재료", description: "원재료·성분 컷" },
  gif: { label: "GIF", description: "움직이는 GIF (상세페이지 삽입용)" },
  other: { label: "기타", description: "기타 이미지" },
};

export const GIF_POSITION_META: Record<GifPosition, { label: string; description: string; order: number }> = {
  after_hero: { label: "히어로 직후", description: "메인 이미지 바로 아래 · 첫인상 강화", order: 1 },
  after_intro: { label: "인트로 직후", description: "브랜드 스토리 다음 · 몰입감 강화", order: 2 },
  after_points: { label: "핵심 포인트 직후", description: "⭐ 셀링포인트 다음 · 소비자 선호 1위", order: 3 },
  after_detail: { label: "상세컷 직후", description: "상세 이미지 다음 · 질감·디테일", order: 4 },
  after_process: { label: "제조 과정 직후", description: "공정 스텝 다음 · 동작·움직임", order: 5 },
  after_lifestyle: { label: "라이프스타일 직후", description: "사용 장면 다음", order: 6 },
  before_signature: { label: "시그니처 직전", description: "마무리 섹션 앞 · 감성적 여운", order: 7 },
};
