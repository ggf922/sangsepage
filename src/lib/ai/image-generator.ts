// ============================================================
// Gemini Nano Banana 이미지 생성 엔진 (v2 - 품질 개선)
// gemini-2.5-flash-image (free tier) / gemini-3-pro-image (paid)
//
// 개선 사항:
// - 사진작가 브리프 스타일 프롬프트 (Camera/Lighting/Composition/Mood/Colors/Props/Post/Aspect/StyleRef)
// - 유저 업로드 사진을 inlineData로 참조 전달 (실제 상품과 훨씬 닮은 결과)
// ============================================================

import { createAdminClient } from "@/lib/supabase/server";
import type { Product, Template, ProductImage } from "@/lib/types";
import { generateShortId } from "@/lib/utils";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// 무료/표준 티어 (Nano Banana / Gemini 2.5 Flash Image - GA)
const MODEL_FREE = "gemini-2.5-flash-image";
// 유료 티어 (Nano Banana Pro / Gemini 3 Pro Image - GA)
const MODEL_PRO = "gemini-3-pro-image";

export type ImageRole =
  | "hero"
  | "detail_1"
  | "detail_2"
  | "detail_close" // NEW: 극단적 매크로 클로즈업 (질감/디테일)
  | "ingredient"
  | "process_shot" // NEW: 제조·사용 과정 컷
  | "comparison" // NEW: Before/After 또는 크기감·활용
  | "lifestyle"
  | "signature";

export interface GeneratedImageResult {
  role: ImageRole;
  url: string;
  path: string;
  prompt: string;
  width: number;
  height: number;
}

// ============================================================
// 참조 이미지 처리 (유저 업로드 사진 → base64 inlineData)
// ============================================================

interface ReferenceImage {
  mimeType: string;
  data: string; // base64
}

/**
 * 유저가 업로드한 상품 사진을 base64로 다운로드 (Gemini inlineData용)
 * - 실패해도 조용히 null 반환 (참조 없이도 프롬프트만으로 생성 가능)
 * - 최대 4MB (Gemini inlineData 제한 대응)
 */
async function fetchReferenceImage(imageUrl: string): Promise<ReferenceImage | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.warn(`[fetchReferenceImage] HTTP ${res.status} for ${imageUrl}`);
      return null;
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    // 4MB 초과 시 스킵 (참조 이미지가 너무 크면 프롬프트 전체가 실패할 수 있음)
    if (buf.byteLength > 4 * 1024 * 1024) {
      console.warn(`[fetchReferenceImage] 파일 너무 큼 (${buf.byteLength}B) - 스킵`);
      return null;
    }
    return {
      mimeType: contentType.split(";")[0].trim(),
      data: buf.toString("base64"),
    };
  } catch (e: any) {
    console.warn(`[fetchReferenceImage] 실패: ${e?.message ?? e}`);
    return null;
  }
}

/**
 * 특정 role에 어울리는 유저 업로드 사진을 우선순위대로 선택
 * - role별 매핑에 실패하면 main 사진 fallback
 */
function pickUserReferenceImages(product: Product, role: ImageRole): ProductImage[] {
  const imgs = (product.images ?? []) as ProductImage[];
  if (imgs.length === 0) return [];

  // GIF는 AI 참조 이미지로 사용하지 않음 (Gemini가 첫 프레임만 처리하고, 상세페이지 삽입 전용이므로)
  const staticImgs = imgs.filter(
    (i) => i.role !== "gif" && i.mime_type !== "image/gif"
  );
  if (staticImgs.length === 0) return [];

  const roleToProductRole: Record<ImageRole, Array<ProductImage["role"]>> = {
    hero: ["main", "lifestyle", "detail"],
    detail_1: ["detail", "main"],
    detail_2: ["detail", "other", "main"],
    detail_close: ["detail", "main"], // 매크로: detail 사진 우선
    ingredient: ["ingredient", "detail", "main"],
    process_shot: ["detail", "lifestyle", "main"],
    comparison: ["main", "lifestyle", "detail"],
    lifestyle: ["lifestyle", "main"],
    signature: ["main", "lifestyle"],
  };

  const wanted = roleToProductRole[role] || ["main"];
  const picked: ProductImage[] = [];
  const seen = new Set<string>();

  for (const wantRole of wanted) {
    const found = staticImgs
      .filter((i) => i.role === wantRole)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const im of found) {
      if (!seen.has(im.url)) {
        picked.push(im);
        seen.add(im.url);
      }
    }
    if (picked.length >= 2) break; // 최대 2장까지만 참조로 사용 (프롬프트 크기 관리)
  }

  return picked.slice(0, 2);
}

// ============================================================
// 단일 이미지 생성
// ============================================================

/**
 * Gemini API를 실제로 호출하는 저수준 함수 (재시도/fallback 없음)
 * 재시도 가능한 에러(503/429/5xx)는 특별한 프로퍼티를 심어서 던짐
 */
async function callGeminiOnce(
  prompt: string,
  model: string,
  apiKey: string,
  referenceImages: ReferenceImage[]
): Promise<{ base64: string; mimeType: string }> {
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent`;

  const parts: any[] = [];
  for (const ref of referenceImages) {
    parts.push({
      inlineData: {
        mimeType: ref.mimeType,
        data: ref.data,
      },
    });
  }
  parts.push({ text: prompt });

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const status = response.status;
    console.error(`[Gemini image error ${status}] model=${model}`, errorText.slice(0, 300));

    let hint = "";
    if (status === 401 || status === 403) {
      hint = " (API 키 문제 — Vercel 환경변수 GEMINI_API_KEY 확인 필요)";
    } else if (status === 404) {
      hint = ` (모델 '${model}' 을 찾을 수 없음 — 모델명 확인 필요)`;
    } else if (status === 429) {
      hint = " (요청 한도 초과 — 잠시 후 다시 시도하세요)";
    } else if (status === 400) {
      hint = " (프롬프트 형식 오류 또는 지원하지 않는 요청)";
    } else if (status === 503) {
      hint = " (Google 서버 과부하 — 자동 재시도 중)";
    }

    const err: any = new Error(
      `Gemini 이미지 생성 실패 (${status})${hint}: ${errorText.slice(0, 200)}`
    );
    err.status = status;
    // 재시도 가능 여부 표시 (503, 429, 500, 502, 504)
    err.retryable = status === 503 || status === 429 || status === 500 || status === 502 || status === 504;
    throw err;
  }

  const data = await response.json();
  const respParts = data?.candidates?.[0]?.content?.parts;
  if (!respParts || !Array.isArray(respParts)) {
    throw new Error("Gemini 응답에서 이미지를 찾을 수 없습니다.");
  }

  const imagePart = respParts.find((p: any) => p.inlineData?.data);
  if (!imagePart) {
    throw new Error("응답에 이미지 데이터가 포함되어 있지 않습니다.");
  }

  return {
    base64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || "image/png",
  };
}

/**
 * 재시도 + fallback 지원 이미지 생성
 * - 각 모델마다 최대 3번 재시도 (지수 백오프: 2s, 4s, 8s)
 * - Pro 모델이 재시도 후에도 실패하면 Free 모델로 자동 fallback
 */
async function generateOneImage(
  prompt: string,
  role: ImageRole,
  user_id: string,
  page_id: string,
  useProModel = false,
  referenceImages: ReferenceImage[] = []
): Promise<GeneratedImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");

  const isAuthKey = apiKey.startsWith("AQ.");
  const isStandardKey = apiKey.startsWith("AIza");
  if (!isAuthKey && !isStandardKey) {
    console.warn(
      `[Gemini] Unrecognized API key prefix. Expected 'AQ.' (auth) or 'AIza' (standard).`
    );
  }

  // 시도할 모델 목록: Pro 사용자면 Pro 먼저, 실패 시 Free로 fallback
  const modelChain: string[] = useProModel ? [MODEL_PRO, MODEL_FREE] : [MODEL_FREE];

  const MAX_ATTEMPTS_PER_MODEL = 3;
  const RETRY_DELAYS = [2000, 4000, 8000]; // 2s → 4s → 8s

  let lastError: any = null;
  let result: { base64: string; mimeType: string } | null = null;
  let usedModel = "";

  outer: for (const model of modelChain) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        console.log(
          `[Gemini] ${role} 시도 ${attempt + 1}/${MAX_ATTEMPTS_PER_MODEL} — model=${model}`
        );
        result = await callGeminiOnce(prompt, model, apiKey, referenceImages);
        usedModel = model;
        break outer; // 성공 시 전체 루프 탈출
      } catch (err: any) {
        lastError = err;
        const status = err?.status;
        const retryable = err?.retryable;

        console.warn(
          `[Gemini] ${role} 실패 (attempt ${attempt + 1}, model=${model}, status=${status}): ${err?.message?.slice(0, 150)}`
        );

        // 재시도 불가능한 에러(400/401/403/404)는 즉시 다음 모델로 (또는 최종 실패)
        if (!retryable) {
          console.log(`[Gemini] ${role} 재시도 불가능 에러 — 모델 전환 시도`);
          break; // 이 모델의 재시도 루프 종료 → 다음 모델 시도
        }

        // 마지막 시도가 아니면 백오프 대기
        if (attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
          const delay = RETRY_DELAYS[attempt] ?? 8000;
          console.log(`[Gemini] ${role} ${delay}ms 대기 후 재시도...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    if (result) break;
    // 다음 모델로 fallback
    if (modelChain.indexOf(model) < modelChain.length - 1) {
      console.log(
        `[Gemini] ${role} — ${model} 최대 재시도 초과, ${modelChain[modelChain.indexOf(model) + 1]} 모델로 fallback`
      );
    }
  }

  if (!result) {
    // 모든 시도 실패
    throw lastError ?? new Error(`${role}: Gemini 이미지 생성 모든 시도 실패`);
  }

  console.log(`[Gemini] ${role} ✅ 성공 (used model=${usedModel})`);

  // 이미지 저장
  const ext = result.mimeType.split("/")[1] || "png";
  const admin = createAdminClient();
  const buffer = Buffer.from(result.base64, "base64");
  const path = `${user_id}/${page_id}/${role}-${generateShortId(6)}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("generated-images")
    .upload(path, buffer, {
      contentType: result.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
  }

  const { data: urlData } = admin.storage.from("generated-images").getPublicUrl(path);

  return {
    role,
    url: urlData.publicUrl,
    path,
    prompt,
    width: 860,
    height: role === "hero" ? 800 : 600,
  };
}

// ============================================================
// 프롬프트 빌더 (사진작가 브리프 스타일)
// ============================================================

interface StyleTokens {
  bgColor: string; // 예: "warm ivory (#f4ede0)"
  accentColor: string; // 예: "deep red (#a71d1d)"
  moodKeywords: string; // 예: "nostalgic, artisanal, heritage"
  propKeywords: string; // 예: "hanji paper, celadon ceramic, wooden utensils"
  styleRef: string; // 예: "Kinfolk magazine editorial food photography"
  fontMood: string; // 예: "serif elegance"
}

/** 템플릿 코드별 시각적 토큰 */
function getStyleTokens(templateCode: string, tokens: any): StyleTokens {
  const colors = tokens?.colors || {};
  switch (templateCode) {
    case "kimchi-ogami":
      return {
        bgColor: `warm ivory (${colors.background || "#f4ede0"})`,
        accentColor: `deep Korean red (${colors.primary || "#a71d1d"})`,
        moodKeywords: "nostalgic, artisanal, heritage, quietly proud, hand-crafted warmth",
        propKeywords:
          "hanji paper texture, celadon (청자) ceramic dishes, wooden ladle, linen cloth, dried herbs, aged onggi (옹기) pottery",
        styleRef:
          "Kinfolk magazine editorial food photography, Cereal magazine restraint, Korean traditional table setting (한상차림)",
        fontMood: "serif elegance meets rustic warmth",
      };
    case "household-modern":
      return {
        bgColor: `pure ivory (${colors.background || "#f5f5f5"})`,
        accentColor: `charcoal (${colors.primary || "#2d2d2d"})`,
        moodKeywords: "minimal, functional, calm, honest, restrained",
        propKeywords:
          "single geometric prop, natural linen, unfinished wood, negative space, no decorative clutter",
        styleRef:
          "Muji product catalog, Kinfolk still life, Japanese Wabi-Sabi minimalism",
        fontMood: "sans-serif clarity",
      };
    case "electronics-tech":
      return {
        bgColor: `deep matte black (${colors.background || "#0a0a0a"})`,
        accentColor: `neon cyber green (${colors.primary || "#00d47e"})`,
        moodKeywords: "cutting-edge, precise, powerful, dramatic, cinematic",
        propKeywords:
          "polished metal, LED under-glow, glass reflection, subtle smoke or particle, tech-lab environment",
        styleRef:
          "Apple keynote hero shot, Dyson product film, Sony flagship reveal, Behance electronics editorial",
        fontMood: "modern geometric sans",
      };
    case "health-natural":
      return {
        bgColor: `soft beige (${colors.background || "#f0ebe0"})`,
        accentColor: `sage green (${colors.primary || "#8fa88f"})`,
        moodKeywords: "clean, honest, botanical, calm, quietly scientific",
        propKeywords:
          "fresh herbs, sliced fruit, glass laboratory vials, natural linen, morning window light, dried flowers",
        styleRef:
          "Nutrafol brand photography, Ritual vitamins editorial, The New York Times Cooking styling",
        fontMood: "elegant serif with soft weight",
      };
    case "cosmetics-luxury":
      return {
        bgColor: `blush cream (${colors.background || "#faf4ee"})`,
        accentColor: `rose gold (${colors.accent || "#d4af7c"})`,
        moodKeywords: "luxurious, sensual, sculptural, ethereal, whisper-soft",
        propKeywords:
          "silk fabric drape, Carrara marble slab, pearl, subtle golden hour glow, morning mist",
        styleRef:
          "Sulwhasoo brand book, Sisley Paris editorial, Chanel Beauty campaign, Vogue Korea beauty spread",
        fontMood: "italic serif elegance",
      };
    default:
      return {
        bgColor: `${colors.background || "clean neutral"}`,
        accentColor: `${colors.primary || "brand"} accent`,
        moodKeywords: "premium, refined, aspirational",
        propKeywords: "minimal props, clean surfaces",
        styleRef: "premium Korean e-commerce editorial",
        fontMood: "modern serif",
      };
  }
}

/** 상품 → 시각적 설명 */
function buildProductVisualDesc(product: Product): string {
  const parts = [product.name];
  if (product.category) parts.push(`(${product.category})`);
  if (product.origin) parts.push(`from ${product.origin}`);
  const mainFeature = product.features?.[0];
  if (mainFeature) parts.push(`emphasizing "${mainFeature.title}"`);
  return parts.join(" ");
}

/**
 * 사진작가 브리프 스타일 프롬프트 빌더
 * 각 필드: Subject / Camera / Lighting / Composition / Mood / Colors / Props / Post / Aspect / StyleRef
 */
function buildBrief(opts: {
  subject: string;
  camera: string;
  lighting: string;
  composition: string;
  mood: string;
  colors: string;
  props: string;
  post: string;
  aspect: string;
  styleRef: string;
  hasReferenceImages: boolean;
}): string {
  const refHint = opts.hasReferenceImages
    ? "The attached reference photo(s) show the actual product — closely match its shape, color, packaging, label, and material texture. Recreate the product faithfully, then re-stage it with the brief below.\n\n"
    : "";

  return `${refHint}${opts.subject}

CAMERA: ${opts.camera}
LIGHTING: ${opts.lighting}
COMPOSITION: ${opts.composition}
MOOD: ${opts.mood}
COLORS: ${opts.colors}
PROPS: ${opts.props}
POST-PROCESSING: ${opts.post}
ASPECT: ${opts.aspect}
STYLE REFERENCE: ${opts.styleRef}

STRICT RULES:
- Absolutely no text, no letters, no numbers, no logos, no watermarks anywhere in the image.
- No visible brand names or product labels with text (if reference photo has label text, blur it or replace with a plain color band).
- No human faces visible; hands may appear only if partial and softly out-of-focus.
- Photorealistic professional commercial photography, no illustration, no 3D render, no CGI look.`;
}

// ============================================================
// 6개 이미지 프롬프트 세트 생성
// ============================================================

export function buildImagePrompts(
  product: Product,
  template: Template
): Array<{ role: ImageRole; prompt: string }> {
  const tokens = template.design_tokens as any;
  const style = getStyleTokens(template.code, tokens);
  const subject = buildProductVisualDesc(product);
  const hasRefs = (product.images ?? []).length > 0;

  const commonColors = `Dominant background ${style.bgColor}, accent ${style.accentColor}. Naturally saturated, not oversaturated. No neon or artificial colors unless brand-specified.`;
  const commonPost = `Editorial finish, subtle film grain, gentle color grading, no HDR crunch, no plastic-smooth skin, no over-sharpened edges. Natural depth and dimension.`;

  return [
    {
      role: "hero",
      prompt: buildBrief({
        subject: `A hero product photograph for a Korean premium e-commerce detail page — a wide overhead flat-lay of ${subject}, centered as the emotional entry point.`,
        camera: "Medium-format digital, 50mm equivalent lens, top-down 90° overhead angle, camera height ~1.5m above surface, tripod-stable framing",
        lighting: "Soft window daylight from the upper-left, single 60° diffusion scrim, gentle shadow falloff to the right, 5200K color temperature, no direct sun, no on-camera flash",
        composition: "Golden-ratio composition, product occupying the upper-center 60% of frame, breathing negative space around, rule-of-thirds cross-point on the product's focal detail",
        mood: style.moodKeywords,
        colors: commonColors,
        props: style.propKeywords,
        post: commonPost,
        aspect: "4:3 landscape",
        styleRef: style.styleRef,
        hasReferenceImages: hasRefs,
      }),
    },
    {
      role: "detail_1",
      prompt: buildBrief({
        subject: `A dramatic macro close-up of ${subject}, revealing surface texture, material grain, and craftsmanship detail.`,
        camera: "100mm macro prime lens, f/2.8 shallow depth of field, camera parallel to subject, focus on the most tactile detail (texture, weave, crystal, cut, fiber)",
        lighting: "Directional side-light 45° from the right, single soft-box, subtle rim light behind the subject to separate from background, 4500K",
        composition: "Extremely tight framing, fills 90% of frame, foreground element sharp and background gently out-of-focus (bokeh), diagonal flow",
        mood: `${style.moodKeywords}, intimate, tactile, revealing`,
        colors: commonColors,
        props: "Minimal — only the product texture itself is the hero; supporting props kept far out of focus",
        post: commonPost,
        aspect: "3:2 landscape",
        styleRef: `${style.styleRef}, and Chef's Table series macro food styling`,
        hasReferenceImages: hasRefs,
      }),
    },
    {
      role: "detail_2",
      prompt: buildBrief({
        subject: `A 3/4 angle documentary shot of ${subject}, showing a different facet than the hero — the side profile, cross-section, or in-use moment.`,
        camera: "85mm portrait lens equivalent, f/4, camera angle 35° from horizontal, eye-level with subject",
        lighting: "Two-point setup — key light from left at 45°, subtle fill from right, natural window quality, 5000K",
        composition: "Off-center placement (rule-of-thirds), leading line from lower-left drawing the eye to the subject, layered depth (foreground, subject, softly blurred background)",
        mood: `${style.moodKeywords}, storytelling, natural, unposed`,
        colors: commonColors,
        props: style.propKeywords,
        post: commonPost,
        aspect: "16:9 wide banner",
        styleRef: style.styleRef,
        hasReferenceImages: hasRefs,
      }),
    },
    {
      role: "detail_close",
      prompt: buildBrief({
        subject: `An extreme macro close-up of ${subject} — filling the frame with a single revealing detail: the surface grain, fiber weave, crystal edge, glaze reflection, or texture pattern that shows craftsmanship or quality.`,
        camera: "100mm macro prime, 1:1 magnification, f/2.8 for razor-thin depth of field, tripod-mounted, focus stacking impression",
        lighting: "Single directional light source at grazing angle (10-15° from surface) to bring out surface texture, no fill light — let shadows deepen the sense of dimension, 4500K",
        composition: "Frame filled 100% with the texture/detail; no edges of the product visible; abstract-yet-recognizable; the focal micro-plane is dead-center-sharp with all else falling into buttery bokeh",
        mood: `${style.moodKeywords}, sensory, revealing the invisible, quality made tangible`,
        colors: commonColors,
        props: "None — only the product's surface fills the frame",
        post: commonPost,
        aspect: "1:1 square",
        styleRef: `${style.styleRef}, and Levon Biss microsculpture photography for its texture reveal`,
        hasReferenceImages: hasRefs,
      }),
    },
    {
      role: "ingredient",
      prompt: buildBrief({
        subject: `An ingredient/material composition still-life for ${subject}. ${
          product.ingredients?.length
            ? `Feature the raw ingredients arranged aesthetically: ${product.ingredients
                .slice(0, 4)
                .map((i) => i.name)
                .join(", ")}.`
            : "Feature the raw materials/components arranged aesthetically."
        }`,
        camera: "50mm lens, top-down overhead, tripod, f/5.6 for full sharpness across the flat-lay",
        lighting: "Soft overhead diffused daylight, single large scrim, gentle even illumination, no harsh shadows, 5500K",
        composition: "Ingredients arranged in an organic loose-grid, each with breathing space, some elements slightly overlapping for natural feel, focal ingredient at rule-of-thirds intersection",
        mood: `${style.moodKeywords}, honest, editorial, botanical`,
        colors: commonColors,
        props: "Wooden cutting board or linen fabric as base, small ceramic dishes, subtle sprinkle of related raw material (salt, herbs, sesame, powder — whatever fits the product)",
        post: commonPost,
        aspect: "3:2 landscape",
        styleRef: `${style.styleRef}, and Bon Appétit magazine ingredient spread`,
        hasReferenceImages: hasRefs,
      }),
    },
    {
      role: "process_shot",
      prompt: buildBrief({
        subject: `A candid documentary process shot showing ${subject} being made, crafted, or prepared for use — the human moment behind the product. Show partial hands (no faces), tools mid-action, or the exact instant of transformation. Movement blur on hands is acceptable and desirable for authenticity.`,
        camera: "35mm lens equivalent, f/4, medium-shot distance, slightly high angle (20° down), handheld feel with subtle motion",
        lighting: "Natural workshop or kitchen daylight, single window as key, ambient fill from environment, warm 4200K, slight fall-off to shadow for depth",
        composition: "Environmental frame — the subject being worked on is at rule-of-thirds intersection, hands or tools enter from one edge (usually left), workspace context visible but not distracting",
        mood: `${style.moodKeywords}, honest labor, hand-crafted, present-moment, quietly proud`,
        colors: `${commonColors} — allow natural workshop tones, subtle warmth`,
        props: `Workspace-appropriate — ${style.propKeywords}, plus tools of the trade (wooden board, ceramic vessel, cotton cloth, seasonal ingredients being handled)`,
        post: `${commonPost}, slight warmth push for humanity`,
        aspect: "3:2 landscape",
        styleRef: `${style.styleRef}, and The New York Times profile documentary photography, Chef's Table process cinematography`,
        hasReferenceImages: hasRefs,
      }),
    },
    {
      role: "comparison",
      prompt: buildBrief({
        subject: `A visual comparison or scale-reference shot for ${subject} — either (a) showing the product alongside a common object for size reference (a hand, a coffee cup, an apple), or (b) showing before/after or with/without in a side-by-side layout, or (c) showing multiple color/size variants arranged systematically.`,
        camera: "50mm lens equivalent, f/5.6 for full sharpness across all elements, straight-on eye-level angle, tripod-stable",
        lighting: "Even studio-quality daylight, dual soft-box or large window scrim, no dramatic shadow — the goal here is clear information transfer",
        composition: "Symmetrical or grid-based layout, elements clearly separated with equal breathing room, comparison objects perfectly aligned on a shared baseline",
        mood: `${style.moodKeywords}, informative, honest, systematic, editorial-catalog`,
        colors: commonColors,
        props: "Neutral scale references or comparison items only; nothing decorative that distracts from the comparison itself",
        post: commonPost,
        aspect: "3:2 landscape",
        styleRef: `${style.styleRef}, and Wirecutter comparison photography, Muji catalog product layout`,
        hasReferenceImages: hasRefs,
      }),
    },
    {
      role: "lifestyle",
      prompt: buildBrief({
        subject: `A lifestyle scene showing ${subject} in its natural Korean home-use context — the moment just before or during use, capturing daily-life warmth.`,
        camera: "35mm wide lens equivalent, f/4, slight elevation (30° down-angle), medium-shot distance",
        lighting: "Warm morning or golden-hour indoor daylight streaming through window, natural window as key light, soft ambient fill, 4200K warm tone",
        composition: "Environmental context — the product is present but not dead-center; surrounding elements (table setting, natural morning routine, seasonal touches) tell the story",
        mood: `${style.moodKeywords}, aspirational yet authentic, lived-in, quietly beautiful, morning calm or evening warmth`,
        colors: commonColors,
        props: `Korean home setting — ${style.propKeywords}, plus contextual props (a ceramic cup, an open book, seasonal fruit, folded linen)`,
        post: `${commonPost}, slight warm color cast for emotional resonance`,
        aspect: "16:9 wide banner",
        styleRef: `${style.styleRef}, and Kinfolk domestic scenes, Cereal home features`,
        hasReferenceImages: hasRefs,
      }),
    },
    {
      role: "signature",
      prompt: buildBrief({
        subject: `A closing signature image evoking the brand's essence — ${subject} rendered as a poetic still-life, minimal and atmospheric, the final visual note of the detail page.`,
        camera: "85mm lens, f/2.8, side-on angle 20° above horizontal, slight tilt for artistic composition",
        lighting: "Single-source moody lighting — window light with 70% falloff to dark, chiaroscuro depth, 4000K",
        composition: "Extreme negative space (product occupies only 30% of frame), asymmetric balance, contemplative silence, one hero element with one supporting shadow",
        mood: `${style.moodKeywords}, meditative, poetic, timeless, the emotional climax`,
        colors: `${commonColors} — allow deeper shadows and reduced saturation for artistic gravitas`,
        props: "Minimal — one or two carefully chosen supporting objects only, or none at all",
        post: `${commonPost}, deeper contrast, subtle vignette, film-emulation grade (Portra 400 or Kodak Ektar mood)`,
        aspect: "3:2 landscape",
        styleRef: `${style.styleRef}, and Peter Lippmann still-life, Irving Penn simplicity`,
        hasReferenceImages: hasRefs,
      }),
    },
  ];
}

// ============================================================
// 병렬 생성 (참조 이미지 사전 로드 포함)
// ============================================================

export async function generateAllImages(
  product: Product,
  template: Template,
  user_id: string,
  page_id: string,
  useProModel = false
): Promise<GeneratedImageResult[]> {
  const prompts = buildImagePrompts(product, template);

  // === 참조 이미지 사전 로드 ===
  // 유저가 상품 사진을 올렸다면, 각 role별로 어울리는 참조 사진을 base64로 다운로드해서 캐싱
  // (한 번만 다운로드하고 여러 role에서 재사용)
  const productImages = (product.images ?? []) as ProductImage[];
  const uniqueUrls = new Set<string>();
  const ALL_ROLES: ImageRole[] = [
    "hero",
    "detail_1",
    "detail_2",
    "detail_close",
    "ingredient",
    "process_shot",
    "comparison",
    "lifestyle",
    "signature",
  ];
  for (const role of ALL_ROLES) {
    for (const im of pickUserReferenceImages(product, role)) {
      uniqueUrls.add(im.url);
    }
  }

  const refCache: Record<string, ReferenceImage | null> = {};
  if (uniqueUrls.size > 0) {
    console.log(`[generateAllImages] 참조 이미지 ${uniqueUrls.size}장 사전 로드 중...`);
    await Promise.all(
      Array.from(uniqueUrls).map(async (url) => {
        refCache[url] = await fetchReferenceImage(url);
      })
    );
    const loaded = Object.values(refCache).filter(Boolean).length;
    console.log(`[generateAllImages] 참조 이미지 ${loaded}/${uniqueUrls.size}장 로드 완료`);
  }

  // === 병렬 생성 ===
  // Pro 모델(유료): 9장 전체 병렬 (Gemini 유료 티어 rate limit 여유 있음)
  // Free 모델: 3장씩 3배치 + 1.5초 딜레이 (rate limit 회피)
  const BATCH_SIZE = useProModel ? 9 : 3;
  const BATCH_DELAY = useProModel ? 0 : 1500;

  const results: GeneratedImageResult[] = [];
  const errors: string[] = [];

  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    const batch = prompts.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(({ role, prompt }) => {
        // 이 role에 어울리는 참조 이미지 뽑기
        const refPicks = pickUserReferenceImages(product, role);
        const refs: ReferenceImage[] = [];
        for (const p of refPicks) {
          const cached = refCache[p.url];
          if (cached) refs.push(cached);
        }
        return generateOneImage(prompt, role, user_id, page_id, useProModel, refs);
      })
    );

    for (let j = 0; j < settled.length; j++) {
      const s = settled[j];
      if (s.status === "fulfilled") {
        results.push(s.value);
      } else {
        errors.push(`${batch[j].role}: ${s.reason?.message ?? "Unknown"}`);
      }
    }

    if (i + BATCH_SIZE < prompts.length && BATCH_DELAY > 0) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY));
    }
  }

  if (results.length === 0) {
    throw new Error(`모든 이미지 생성 실패:\n${errors.join("\n")}`);
  }

  if (errors.length > 0) {
    console.warn("[generateAllImages] partial failures:", errors);
  }

  return results;
}
