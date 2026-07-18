// ============================================================
// GPT-4o 기반 상세페이지 카피 생성 엔진 (v2 - 품질 개선)
// - 모델 업그레이드: gpt-4o-mini → gpt-4o
// - 카테고리별 프롬프트 분기
// - Few-shot 예시 주입 (오가미·설화수·무인양품 스타일)
// ============================================================

import OpenAI from "openai";
import type { Product, Template, Language } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 카피 생성 모델: gpt-4o (감성/문학적 표현 우수, gpt-4o-mini 대비 15배 비용이지만 카피당 ~₩50)
// 필요시 환경변수 COPY_MODEL로 오버라이드 가능 (예: "gpt-4o-mini"로 원복)
const COPY_MODEL = process.env.COPY_MODEL || "gpt-4o";

// Self-critique 2-pass: 카피 생성 후 자체 검수로 진부한 표현·과장·hallucination 제거
// 우선순위:
//   1) generateCopy() 호출 시 explicit 파라미터 (Pro 회원, 재생성, 고급모드 체크박스)
//   2) 환경변수 COPY_SELF_CRITIQUE=true (전역 강제 ON)
// 기본은 OFF. 비용 2배, 품질 향상.
const SELF_CRITIQUE_GLOBAL = process.env.COPY_SELF_CRITIQUE === "true";

export interface GeneratedCopy {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  intro: {
    heading: string;
    body: string;
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
  maker_story?: {
    heading: string; // 예: "만든 사람들"
    body: string; // 100~200자 브랜드/만든 사람 이야기
    quote?: string; // 짧은 인용 (50자 이내, 만든 사람의 한 마디)
    attribution?: string; // 예: "오가미 김치명인 김순자"
  };
  signature: {
    heading: string;
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

// ============================================================
// 카테고리별 카피 가이드 (Few-shot 예시 + 강조점 분기)
// ============================================================

interface CategoryGuide {
  emphasis: string;
  examples: string;
  avoid: string;
}

const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  // 김치·발효식품·전통식품
  kimchi: {
    emphasis: `**사람·손·시간**을 강조하세요. 만든 사람의 정성, 원재료의 계절감, 발효의 시간이 핵심입니다.
- 원산지·산지를 구체적으로 (예: "해남 배추", "신안 천일염")
- 만드는 사람의 흔적 (예: "3代를 이어온", "새벽 4시부터")
- 감각적 묘사 (예: "아삭한 식감", "시원한 국물")`,
    examples: `[좋은 예시 - 오가미 스타일]
badge: "국내산 100%"
title: "어머니의 손끝, 그대로"
subtitle: "3代를 이어온 전라도식 열무김치"
intro.heading: "새벽 4시, 배추가 도착합니다"
intro.body: "해남에서 자란 겨울배추를 가장 신선할 때 손으로 다듬어 담습니다. 화학첨가물 없이, 오직 천일염과 정성만으로. 그렇게 담근 김치가 우리 식탁에 오르기까지 꼬박 5일이 걸립니다."
signature.heading: "오래도록 곁에 두고 싶은 맛"
points 예시:
- icon: "🌾", title: "국내산 배추만", description: "해남·강진 계약 재배 농가에서만 수확"
- icon: "🧂", title: "신안 천일염", description: "3년 이상 간수를 뺀 정제되지 않은 소금"
- icon: "⏰", title: "5일간의 숙성", description: "저온에서 천천히 익혀 깊은 감칠맛"`,
    avoid: "- '최고의 김치' (진부함)\n- '엄선된 재료' (구체성 없음)\n- '전통의 맛' (뻔한 클리셰)",
  },

  // 화장품·뷰티
  cosmetics: {
    emphasis: `**감각·변화·시간**을 강조하세요. 발림·향·질감 같은 감각 언어와 사용 후 변화가 핵심입니다.
- 감각 묘사 (예: "실크처럼 스며드는", "5분 후")
- 유효 성분과 임상 근거 (예: "아데노신 3% 함유", "8주 사용 후 87% 만족")
- 브랜드 철학 (예: "6년근 인삼", "설악산 자작나무")`,
    examples: `[좋은 예시 - 설화수·시슬리 스타일]
badge: "6년근 홍삼 농축액"
title: "시간을 담다"
subtitle: "피부가 다시 태어나는 5분"
intro.heading: "결이 다른 흡수력"
intro.body: "6년의 인고 끝에 얻은 홍삼 사포닌 15%. 두드리지 않아도 스며듭니다. 아침, 세안 후 두 방울로 시작하세요. 저녁이 되면 결의 차이를 느낄 수 있습니다."
points 예시:
- icon: "🌿", title: "6년근 홍삼 15%", description: "국내 GMP 인증 시설에서 저온 추출"
- icon: "💧", title: "24시간 보습", description: "임상 결과 8주 사용 후 87% 만족"
- icon: "✨", title: "실크 텍스처", description: "무거움 없는 산뜻한 마무리"`,
    avoid: "- '피부가 좋아집니다' (막연함)\n- '럭셔리한 성분' (근거 부재)\n- '기적의 크림' (과장)",
  },

  // 전자제품·테크
  electronics: {
    emphasis: `**스펙·성능·차별화 기술**을 강조하세요. 데이터와 벤치마크가 핵심입니다.
- 정량 스펙 (예: "0.001초 반응", "AMOLED 3200×1440")
- 인증·표준 (예: "IPX7 방수", "블루투스 5.3")
- 실사용 시나리오 (예: "8시간 연속 재생", "-20°C에서도 작동")`,
    examples: `[좋은 예시 - Dyson·Apple 스타일]
badge: "0.1초 응답속도"
title: "속도가 성능이다"
subtitle: "게이머를 위한 240Hz OLED"
intro.heading: "1000fps에서 진짜가 드러난다"
intro.body: "0.03ms GtG 응답속도, 240Hz 주사율, HDR 1000 nit. 눈이 인식하지 못하는 프레임까지 잡아냅니다. 승부가 갈리는 그 순간, 이 화면이 답합니다."
points 예시:
- icon: "⚡", title: "0.03ms GtG", description: "OLED 픽셀 응답, LCD 대비 100배 빠름"
- icon: "🎯", title: "240Hz Native", description: "DisplayPort 2.1로 4K 240Hz 무손실"
- icon: "🎨", title: "DCI-P3 98%", description: "영화 제작 표준 색역 완벽 커버"`,
    avoid: "- '최고의 성능' (측정 불가)\n- '혁신적인 기술' (형용사 나열)\n- '프리미엄 디자인' (구체성 부족)",
  },

  // 건강식품·영양제
  health: {
    emphasis: `**원료·근거·인증**을 강조하세요. 성분 함량과 시험 결과가 핵심입니다.
- 원료 함량 (예: "오메가3 EPA 1000mg", "유산균 500억 CFU")
- 제조·품질 인증 (예: "GMP 인증", "미국 NSF 인증")
- 근거 (예: "임상 8주", "HPLC 분석 결과")`,
    examples: `[좋은 예시 - 뉴트리원·나우푸드 스타일]
badge: "노르웨이 rTG 오메가3"
title: "혈액이 흐르는 방식"
subtitle: "EPA·DHA 1200mg, 하루 한 알"
intro.heading: "왜 rTG 형태여야 하는가"
intro.body: "일반 EE 형태보다 3배 높은 체내 흡수율. 노르웨이 심해에서 잡은 안초비만 사용하며, 중금속·PCB 검사에서 모두 불검출을 기록했습니다. IFOS 5-star 인증으로 순도를 증명합니다."
points 예시:
- icon: "🐟", title: "rTG 형태", description: "체내 흡수율 EE 대비 3배 높음"
- icon: "🏅", title: "IFOS 5-star", description: "국제 오메가3 인증 최고 등급"
- icon: "🔬", title: "중금속 불검출", description: "수은·납·카드뮴 모두 검출한계 미만"`,
    avoid: "- '건강에 좋습니다' (근거 없음)\n- '고품질 원료' (구체성 부족)\n- '효과 만점' (과장·의약품 오인)",
  },

  // 생활용품·주방·리빙
  household: {
    emphasis: `**용도·편의성·디자인**을 강조하세요. 실사용 상황과 미감이 핵심입니다.
- 실사용 상황 (예: "1인 가구에", "설거지 시간 30% 절약")
- 소재·안전성 (예: "SUS304 스테인리스", "BPA-Free")
- 미감 (예: "무광 마감", "군더더기 없는 라인")`,
    examples: `[좋은 예시 - 무인양품·이케아 스타일]
badge: "일본 SUS304 스테인리스"
title: "덜어내니 아름다워졌다"
subtitle: "손잡이가 없는 냄비"
intro.heading: "그 자리에 있어야 할 이유"
intro.body: "손잡이를 없앴습니다. 그러자 세척이 쉬워졌고, 서랍에 겹쳐 담을 수 있게 되었으며, 인덕션에서 국물도 따르기 편해졌습니다. 없는 것이 나은 물건도 있습니다."
points 예시:
- icon: "◯", title: "겹쳐 담는 수납", description: "3개 세트가 냄비 하나 공간에"
- icon: "△", title: "인덕션 대응", description: "3층 인캡슐레이션 바닥"
- icon: "▢", title: "SUS304 스텐", description: "일본산 스테인리스, 녹슬지 않음"`,
    avoid: "- '실용적입니다' (막연함)\n- '고급스러운 디자인' (형용사)\n- '주부의 필수품' (진부함)",
  },
};

/** 상품 카테고리 → 가이드 매핑 */
function pickCategoryGuide(product: Product, template: Template): CategoryGuide {
  const templateCode = template.code || "";
  const category = (product.category || "").toLowerCase();

  // 템플릿 코드 우선
  if (templateCode.includes("kimchi")) return CATEGORY_GUIDES.kimchi;
  if (templateCode.includes("cosmetics")) return CATEGORY_GUIDES.cosmetics;
  if (templateCode.includes("electronics")) return CATEGORY_GUIDES.electronics;
  if (templateCode.includes("health")) return CATEGORY_GUIDES.health;
  if (templateCode.includes("household")) return CATEGORY_GUIDES.household;

  // 카테고리 문자열 fallback
  if (/김치|반찬|발효|장류|전통/.test(category)) return CATEGORY_GUIDES.kimchi;
  if (/화장품|뷰티|스킨|메이크업|미용/.test(category)) return CATEGORY_GUIDES.cosmetics;
  if (/가전|전자|테크|디지털|IT/.test(category)) return CATEGORY_GUIDES.electronics;
  if (/건강|영양제|보조식품|헬스/.test(category)) return CATEGORY_GUIDES.health;
  if (/생활|주방|리빙|가구|용품/.test(category)) return CATEGORY_GUIDES.household;

  // 기본값: 김치 스타일 (오가미 톤이 브랜드 시그니처)
  return CATEGORY_GUIDES.kimchi;
}

// ============================================================
// 카피 생성
// ============================================================

export interface GenerateCopyOptions {
  /** Self-Critique 2-pass 강제 ON/OFF. undefined면 환경변수(COPY_SELF_CRITIQUE) 사용 */
  selfCritique?: boolean;
}

export async function generateCopy(
  product: Product,
  template: Template,
  language: Language = "ko",
  options: GenerateCopyOptions = {}
): Promise<GeneratedCopy> {
  const toneHint = product.brand_tone
    ? TONE_HINTS[product.brand_tone] ?? product.brand_tone
    : "브랜드 톤 미지정";

  const productContext = buildProductContext(product);
  const guide = pickCategoryGuide(product, template);

  const systemPrompt = `당신은 한국 이커머스(스마트스토어·쿠팡·자사몰) 상세페이지 카피라이팅 전문가입니다.
15년 이상의 경력으로 오가미·설화수·무인양품·마켓컬리 상세페이지 카피를 작성해왔습니다.

# 작성 원칙 (반드시 지켜야 하는 5가지)
1. 첫 문장에서 소비자의 감정을 사로잡을 것 — 상황·장면·감각으로 시작하기
2. 구체적인 근거·수치·원산지·인증·시간을 활용해 신뢰감 확보
3. 광고 문구 같은 진부한 표현("최고의", "역사와 전통", "고객 만족 1위", "완벽한") 절대 금지
4. 상품의 실질적 가치를 스토리텔링으로 전달 — "왜 이 상품이어야 하는가"
5. 각 섹션마다 명확한 목적 (Discovery → Interest → Desire → Action)

# 이번 상품 카테고리 특화 가이드
${guide.emphasis}

# 카테고리 참고 예시
${guide.examples}

# 이런 표현은 절대 쓰지 마세요
${guide.avoid}
- "당신을 위해" (뻔함), "특별한 선물" (진부), "지금 만나보세요" (판에 박힘)
- 3개 이상의 형용사 나열 ("고급스럽고 우아하고 특별한" → 하나만 선택)
- 근거 없는 수치 ("100% 만족" 같은 검증 불가 표현)

# 설정
언어: ${LANG_INSTRUCTIONS[language]}
브랜드 톤: ${toneHint}
템플릿: ${template.name} - ${template.description}

응답은 반드시 아래 JSON 스키마를 정확히 따를 것. 다른 텍스트 없이 순수 JSON만 반환.`;

  const userPrompt = `다음 상품의 상세페이지 카피를 작성해주세요.

${productContext}

응답 JSON 스키마 (모든 필드 필수):
{
  "hero": {
    "badge": "상단에 표시할 짧은 뱃지 (10자 이내, 예: '국내산 100%')",
    "title": "메인 타이틀 (20자 이내, 감성적·임팩트 있는 카피 — 단순 상품명 지양)",
    "subtitle": "서브 카피 (40자 이내, 타이틀을 뒷받침하는 구체적 정보)",
    "cta": "구매 유도 버튼 텍스트 (예: '지금 만나보기', '오늘 시작하기')"
  },
  "intro": {
    "heading": "인트로 섹션 헤딩 (25자 이내, 장면·상황·감각으로 시작)",
    "body": "인트로 본문 (200~300자, 상품의 이야기·가치·차별점을 스토리텔링으로)"
  },
  "points": [
    { "icon": "이모지 하나", "title": "포인트 제목 (15자 이내)", "description": "설명 (50자 이내, 구체적 근거 포함)" }
  ],
  "ingredients_intro": {
    "heading": "원재료 섹션 헤딩 (25자 이내)",
    "body": "원재료 스토리 (150자 이내, 원산지·품질 근거)"
  },
  "process": {
    "heading": "제조·공정 섹션 헤딩 (25자 이내)",
    "steps": [
      { "title": "단계명 (10자 이내)", "description": "설명 (40자 이내)" }
    ]
  },
  "maker_story": {
    "heading": "만든 사람 섹션 헤딩 (20자 이내, 예: '만든 사람들', '이 상품이 태어난 곳')",
    "body": "만든 사람·브랜드 이야기 (100~200자, 브랜드 스토리·인물·장소·철학을 스토리텔링으로. 상품의 【추가 정보】에 brand_name/brand_story가 있으면 반드시 활용, 없으면 상품 특성에 어울리는 가상의 스토리 대신 원산지·제조사 정보로 대체)",
    "quote": "만든 사람의 한 마디 인용 (50자 이내, 신뢰감 있는 짧은 문장)",
    "attribution": "인용 화자 (예: '오가미 김치명인 김순자', '설악산 자연농원 대표', 정보 없으면 카테고리에 맞게 '제조사 대표')"
  },
  "signature": {
    "heading": "브랜드 시그니처 헤딩 (25자 이내, 마무리 임팩트)",
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
- points 배열은 상품의 features를 기반으로 3~5개 생성 (각 포인트에 반드시 구체적 수치·원산지·인증 등 근거 포함)
- process가 명확하지 않은 상품(공산품 등)은 3~4단계로 사용/보관법을 대신 작성
- ingredients가 비어있으면 ingredients_intro는 비워도 됨 (null)
- spec_summary.items는 5~7개로 제한
- 모든 텍스트는 순수 텍스트 (HTML 태그 금지)
- 위 카테고리 예시를 참고하되, 절대 그대로 복사하지 말고 이 상품에 맞게 새로 쓰기`;

  const response = await openai.chat.completions.create({
    model: COPY_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8, // 창의성 살짝 상향 (0.7 → 0.8)
    max_tokens: 3500, // 상세한 예시로 인해 여유롭게
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("AI가 응답을 반환하지 않았습니다.");
  }

  let parsed: GeneratedCopy;
  try {
    parsed = JSON.parse(content) as GeneratedCopy;
  } catch (e) {
    console.error("[generateCopy] JSON parse failed:", content);
    throw new Error("AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.");
  }

  // === Self-critique 2-pass (선택적 활성화) ===
  // 우선순위: options.selfCritique (명시적) > SELF_CRITIQUE_GLOBAL (환경변수)
  const shouldSelfCritique =
    options.selfCritique !== undefined ? options.selfCritique : SELF_CRITIQUE_GLOBAL;

  if (shouldSelfCritique) {
    try {
      console.log("[generateCopy] Self-Critique 2-pass 활성화");
      parsed = await selfCritiqueAndRefine(parsed, systemPrompt);
    } catch (e: any) {
      console.warn(`[generateCopy] self-critique 실패 (원본 카피 유지): ${e?.message ?? e}`);
      // 실패해도 1-pass 결과 그대로 반환 (안전 폴백)
    }
  }

  return normalizeCopy(parsed);
}

/**
 * Self-critique 2-pass:
 * 1-pass에서 나온 카피를 GPT가 스스로 검수·수정
 * - 진부한 표현 찾아내기 ("최고의", "완벽한", "특별한" 등)
 * - 근거 없는 과장 축소
 * - 원본 데이터에 없는 사실 날조 방지 (hallucination 제거)
 * - JSON 구조는 유지
 */
async function selfCritiqueAndRefine(
  draft: GeneratedCopy,
  originalSystemPrompt: string
): Promise<GeneratedCopy> {
  const critiqueSystem = `당신은 한국 이커머스 상세페이지 카피의 시니어 에디터입니다.
초안 카피를 검수하여 아래 원칙에 따라 개선합니다.

# 검수 원칙 (엄격히 적용)
1. 진부한 광고 표현 찾아 제거·교체
   - 대상: "최고의", "완벽한", "특별한 경험", "고객 만족 1위", "당신만을 위한",
           "역사와 전통", "지금 만나보세요", "감동을 선사", "혁신적인" 등
   - 교체 방향: 구체적 사실·수치·감각 언어로

2. 근거 없는 과장 축소
   - "100% 만족", "부작용 제로", "기적의 효과" 같은 검증 불가 표현 제거
   - 확실한 것만 남기기

3. 사실 날조(hallucination) 제거
   - 원본 상품 데이터에 없는 인증·수상·수치·인물명을 만들어냈다면 삭제
   - 확실치 않은 것은 삭제, 있는 것만 유지

4. 문장 리듬 개선
   - 3개 이상 형용사 나열 → 하나만 남기고 삭제
   - 문장이 너무 길면 짧게 끊기
   - "~입니다" 남발 → 다양한 종결어미 사용

5. JSON 구조·필드명은 절대 변경하지 말 것 (내용만 수정)

# 출력
개선된 JSON을 반환. 원본 초안과 동일한 스키마·필드명 유지.
다른 텍스트 없이 순수 JSON만.`;

  const critiquePrompt = `아래는 상세페이지 카피 초안입니다. 검수 원칙에 따라 개선된 버전을 JSON으로 반환하세요.

# 참고: 원본 카피 생성 시 사용된 프롬프트 (톤·스타일 유지용)
${originalSystemPrompt.slice(0, 800)}...

# 초안 카피 (개선 대상)
${JSON.stringify(draft, null, 2)}

# 요청
위 초안에서 진부한 표현·과장·날조를 제거하고, 구체적이고 감각적인 표현으로 개선하세요.
JSON 구조는 그대로 유지하고, 개선된 카피만 JSON으로 반환하세요.`;

  const response = await openai.chat.completions.create({
    model: COPY_MODEL,
    messages: [
      { role: "system", content: critiqueSystem },
      { role: "user", content: critiquePrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5, // 검수는 낮은 창의성 (규칙 기반)
    max_tokens: 3500,
  });

  const refined = response.choices[0].message.content;
  if (!refined) {
    throw new Error("Self-critique 응답 없음");
  }
  return JSON.parse(refined) as GeneratedCopy;
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
  seller: "판매사",
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
    maker_story: copy.maker_story,
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
