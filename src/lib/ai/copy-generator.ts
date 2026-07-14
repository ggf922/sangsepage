// ============================================================
// GPT-4o mini 기반 상세페이지 카피 생성 엔진
// ============================================================

import OpenAI from "openai";
import type { Product, Template, Language } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedCopy {
  hero: {
    badge: string; // 상단 뱃지 (예: "국내산 100%")
    title: string; // 메인 타이틀 (예: "오가미 열무물김치")
    subtitle: string; // 서브 카피
    cta: string; // CTA 버튼 텍스트
  };
  intro: {
    heading: string; // 인트로 헤딩
    body: string; // 인트로 본문 (200~300자)
  };
  points: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  ingredients_intro?: {
    heading: string;
    body: string;
  };
  process?: {
    heading: string;
    steps: Array<{ title: string; description: string }>;
  };
  signature: {
    heading: string; // 마무리 시그니처 문구
    body: string;
  };
  spec_summary: {
    heading: string;
    items: Array<{ label: string; value: string }>;
  };
  shipping_summary: {
    heading: string;
    body: string;
  };
  meta: {
    seo_title: string;
    seo_description: string;
  };
}

const LANG_INSTRUCTIONS: Record<Language, string> = {
  ko: "한국어로 작성. 감성적이고 신뢰감 있는 톤. 존댓말 사용.",
  en: "Write in English. Confident, premium tone. Concise sentences.",
  zh: "用中文（简体）书写。优雅、可信赖的语气。",
  ja: "日本語で執筆。丁寧で信頼感のあるトーン。敬語を使用。",
};

const TONE_HINTS: Record<string, string> = {
  traditional: "전통적, 정성스러운, 손맛, 세월의 깊이가 느껴지는",
  modern: "모던하고 심플한, 군더더기 없는, 절제된",
  premium: "프리미엄, 고급스러운, 품격 있는, 특별한 경험",
  friendly: "친근하고 따뜻한, 편안한, 일상적인",
  tech: "테크놀로지 기반, 전문적, 데이터·근거 중심",
  natural: "자연친화적, 클린, 깨끗함, 정직함",
  luxury: "럭셔리, 감각적, 우아함, 세련된",
};

/**
 * 상품 정보와 템플릿을 바탕으로 GPT-4o mini에게 상세페이지 카피 생성 요청
 */
export async function generateCopy(
  product: Product,
  template: Template,
  language: Language = "ko"
): Promise<GeneratedCopy> {
  const toneHint = product.brand_tone
    ? TONE_HINTS[product.brand_tone] ?? product.brand_tone
    : "브랜드 톤 미지정";

  const productContext = buildProductContext(product);

  const systemPrompt = `당신은 한국 이커머스(스마트스토어·쿠팡·자사몰) 상세페이지 카피라이팅 전문가입니다.
15년 이상의 경력으로 오가미·설화수·무인양품 스타일의 카피를 작성해왔습니다.

작성 원칙:
1. 첫 문장에서 소비자의 감정을 사로잡을 것
2. 구체적인 근거·수치·원산지 등을 활용해 신뢰감 확보
3. 광고 문구 같은 진부한 표현("최고의", "역사와 전통") 지양
4. 상품의 실질적 가치를 스토리텔링으로 전달
5. 각 섹션마다 명확한 목적(Discovery → Interest → Desire → Action)

언어: ${LANG_INSTRUCTIONS[language]}
브랜드 톤: ${toneHint}
템플릿 스타일: ${template.name} - ${template.description}

응답은 반드시 아래 JSON 스키마를 정확히 따를 것. 다른 텍스트 없이 순수 JSON만 반환.`;

  const userPrompt = `다음 상품의 상세페이지 카피를 작성해주세요.

${productContext}

응답 JSON 스키마 (모든 필드 필수):
{
  "hero": {
    "badge": "상단에 표시할 짧은 뱃지 (10자 이내, 예: '국내산 100%')",
    "title": "메인 타이틀 (20자 이내, 상품명 또는 임팩트 있는 카피)",
    "subtitle": "서브 카피 (40자 이내)",
    "cta": "구매 유도 버튼 텍스트 (예: '지금 만나보기')"
  },
  "intro": {
    "heading": "인트로 섹션 헤딩 (25자 이내)",
    "body": "인트로 본문 (200~300자, 상품의 이야기·가치·차별점)"
  },
  "points": [
    { "icon": "이모지 하나", "title": "포인트 제목 (15자 이내)", "description": "설명 (50자 이내)" }
  ],
  "ingredients_intro": {
    "heading": "원재료 섹션 헤딩 (25자 이내)",
    "body": "원재료 스토리 (150자 이내)"
  },
  "process": {
    "heading": "제조·공정 섹션 헤딩 (25자 이내)",
    "steps": [
      { "title": "단계명 (10자 이내)", "description": "설명 (40자 이내)" }
    ]
  },
  "signature": {
    "heading": "브랜드 시그니처 헤딩 (25자 이내)",
    "body": "마무리 문구 (100자 이내, 브랜드의 약속·철학)"
  },
  "spec_summary": {
    "heading": "제품 정보 헤딩",
    "items": [
      { "label": "항목명", "value": "값" }
    ]
  },
  "shipping_summary": {
    "heading": "배송 정보 헤딩",
    "body": "배송 안내 (100자 이내)"
  },
  "meta": {
    "seo_title": "SEO 타이틀 (50자 이내)",
    "seo_description": "SEO 디스크립션 (120자 이내)"
  }
}

주의사항:
- points 배열은 상품의 features를 기반으로 3~5개 생성
- process가 명확하지 않은 상품(공산품 등)은 3~4단계로 사용/보관법을 대신 작성
- ingredients가 비어있으면 ingredients_intro는 비워도 됨 (null)
- spec_summary.items는 5~7개로 제한
- 모든 텍스트는 순수 텍스트 (HTML 태그 금지)`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("AI가 응답을 반환하지 않았습니다.");
  }

  try {
    const parsed = JSON.parse(content) as GeneratedCopy;
    return normalizeCopy(parsed);
  } catch (e) {
    console.error("[generateCopy] JSON parse failed:", content);
    throw new Error("AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.");
  }
}

/** 상품 정보를 프롬프트용 텍스트로 조립 */
function buildProductContext(product: Product): string {
  const parts: string[] = [];

  parts.push(`【상품명】 ${product.name}`);
  if (product.category) parts.push(`【카테고리】 ${product.category}`);
  if (product.origin) parts.push(`【원산지】 ${product.origin}`);
  if (product.price) parts.push(`【판매가】 ${product.price.toLocaleString()}원`);

  if (product.features && product.features.length > 0) {
    parts.push(`\n【핵심 셀링포인트】`);
    product.features.forEach((f, i) => {
      parts.push(`${i + 1}. ${f.title}${f.description ? ` - ${f.description}` : ""}`);
    });
  }

  if (product.ingredients && product.ingredients.length > 0) {
    parts.push(`\n【원재료】`);
    product.ingredients.forEach((ing) => {
      const bits = [ing.name];
      if (ing.origin) bits.push(`원산지: ${ing.origin}`);
      if (ing.percentage) bits.push(`${ing.percentage}%`);
      if (ing.note) bits.push(ing.note);
      parts.push(`- ${bits.join(" · ")}`);
    });
  }

  if (product.sale_channels && product.sale_channels.length > 0) {
    parts.push(`\n【판매 채널】 ${product.sale_channels.map((c) => c.type).join(", ")}`);
  }

  const info = product.extra_info || {};
  const infoEntries = Object.entries(info).filter(
    ([, v]) => v && (typeof v === "string" ? v.trim() : true)
  );
  if (infoEntries.length > 0) {
    parts.push(`\n【추가 정보】`);
    for (const [key, value] of infoEntries) {
      const label = INFO_LABELS[key] || key;
      if (Array.isArray(value)) {
        parts.push(`- ${label}: ${value.join(", ")}`);
      } else if (typeof value === "object") {
        continue;
      } else {
        parts.push(`- ${label}: ${value}`);
      }
    }
  }

  return parts.join("\n");
}

const INFO_LABELS: Record<string, string> = {
  weight: "중량",
  volume: "용량",
  size: "사이즈",
  material: "재질/소재",
  manufacturer: "제조사",
  expiry: "유통기한",
  storage: "보관방법",
  usage: "사용방법",
  precautions: "주의사항",
  shipping_method: "배송방법",
  shipping_fee: "배송비",
  shipping_period: "배송기간",
  return_policy: "교환/반품",
  refund_policy: "환불",
  as_info: "AS",
  brand_name: "브랜드",
  brand_story: "브랜드 스토리",
  certifications: "인증",
  awards: "수상",
};

/** 누락된 필드 기본값 채우기 */
function normalizeCopy(copy: Partial<GeneratedCopy>): GeneratedCopy {
  return {
    hero: {
      badge: copy.hero?.badge ?? "",
      title: copy.hero?.title ?? "",
      subtitle: copy.hero?.subtitle ?? "",
      cta: copy.hero?.cta ?? "지금 구매하기",
    },
    intro: {
      heading: copy.intro?.heading ?? "",
      body: copy.intro?.body ?? "",
    },
    points: copy.points ?? [],
    ingredients_intro: copy.ingredients_intro,
    process: copy.process,
    signature: {
      heading: copy.signature?.heading ?? "",
      body: copy.signature?.body ?? "",
    },
    spec_summary: {
      heading: copy.spec_summary?.heading ?? "제품 정보",
      items: copy.spec_summary?.items ?? [],
    },
    shipping_summary: {
      heading: copy.shipping_summary?.heading ?? "배송 안내",
      body: copy.shipping_summary?.body ?? "",
    },
    meta: {
      seo_title: copy.meta?.seo_title ?? "",
      seo_description: copy.meta?.seo_description ?? "",
    },
  };
}
