// ============================================================
// SangSePage - Domain Types
// ============================================================

export type UserRole = "user" | "admin";
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
  role: "main" | "detail" | "lifestyle" | "ingredient" | "other";
  order: number;
  width?: number;
  height?: number;
  size?: number; // bytes
  name?: string; // 원본 파일명
}

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

// ============ Point Cost Constants ============
export const POINT_COSTS = {
  CREATE_PAGE: 30,
  EDIT_PAGE: 10,
  ADD_LANGUAGE: 20,
  SIGNUP_BONUS: 100,
} as const;

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
  other: { label: "기타", description: "기타 이미지" },
};
