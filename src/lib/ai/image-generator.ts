// ============================================================
// Gemini Nano Banana 이미지 생성 엔진
// gemini-2.5-flash-image (free tier) / gemini-3-pro-image (paid)
// ============================================================

import { createAdminClient } from "@/lib/supabase/server";
import type { Product, Template } from "@/lib/types";
import { generateShortId } from "@/lib/utils";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// 무료 티어 (Nano Banana / Gemini 2.5 Flash Image)
const MODEL_FREE = "gemini-2.5-flash-image";
// 유료 티어 (Nano Banana Pro / Gemini 3 Pro Image)
const MODEL_PRO = "gemini-3-pro-image";

export type ImageRole =
  | "hero"
  | "detail_1"
  | "detail_2"
  | "ingredient"
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

/**
 * 하나의 이미지 프롬프트로 Gemini 이미지 생성 후 Supabase Storage 업로드
 */
async function generateOneImage(
  prompt: string,
  role: ImageRole,
  user_id: string,
  page_id: string,
  useProModel = false
): Promise<GeneratedImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");

  const model = useProModel ? MODEL_PRO : MODEL_FREE;
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Gemini image error ${response.status}]`, errorText);
    throw new Error(`Gemini 이미지 생성 실패 (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();

  // 응답에서 이미지 데이터 추출
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts || !Array.isArray(parts)) {
    throw new Error("Gemini 응답에서 이미지를 찾을 수 없습니다.");
  }

  const imagePart = parts.find((p: any) => p.inlineData?.data);
  if (!imagePart) {
    throw new Error("응답에 이미지 데이터가 포함되어 있지 않습니다.");
  }

  const base64 = imagePart.inlineData.data;
  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const ext = mimeType.split("/")[1] || "png";

  // Supabase Storage 업로드
  const admin = createAdminClient();
  const buffer = Buffer.from(base64, "base64");
  const path = `${user_id}/${page_id}/${role}-${generateShortId(6)}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("generated-images")
    .upload(path, buffer, {
      contentType: mimeType,
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

/**
 * 상품과 템플릿을 바탕으로 여러 이미지의 프롬프트를 자동 생성
 */
export function buildImagePrompts(
  product: Product,
  template: Template
): Array<{ role: ImageRole; prompt: string }> {
  const tokens = template.design_tokens as any;
  const styleHint = getStyleHint(template.code, tokens);
  const productDesc = buildProductVisualDesc(product);

  return [
    {
      role: "hero",
      prompt: `A premium Korean e-commerce hero image for a detail page. Product: ${productDesc}. Style: ${styleHint}. Shot: overhead flat lay or elegant product hero, soft natural lighting, minimalist composition, no text overlay, ${tokens?.colors?.background || 'ivory'} background tone. 4:3 aspect ratio, ultra-high quality product photography, editorial style.`,
    },
    {
      role: "detail_1",
      prompt: `Detailed close-up product shot: ${productDesc}. Style: ${styleHint}. Focus on texture and material details, dramatic lighting, shallow depth of field. No text. Premium commercial photography.`,
    },
    {
      role: "detail_2",
      prompt: `Alternative angle product shot: ${productDesc}. Style: ${styleHint}. Different angle from previous, showing another aspect of the product. Clean background, professional lighting.`,
    },
    {
      role: "ingredient",
      prompt: `Ingredient/material composition shot for ${productDesc}. ${
        product.ingredients?.length
          ? `Featuring: ${product.ingredients.slice(0, 3).map((i) => i.name).join(", ")}.`
          : ""
      } Fresh, natural, arranged aesthetically on a wooden or fabric surface. Style: ${styleHint}. No text.`,
    },
    {
      role: "lifestyle",
      prompt: `Lifestyle scene featuring ${productDesc}. Warm, inviting Korean home or table setting. ${styleHint}. Aspirational but authentic, showing the product in its natural use context. No text or people faces.`,
    },
    {
      role: "signature",
      prompt: `Elegant closing/signature image for the brand. Minimal, atmospheric, evocative of the brand's essence. ${styleHint}. Could feature the product silhouette in soft focus, natural elements, or brand-appropriate objects. No text, no logos.`,
    },
  ];
}

/** 템플릿별 이미지 스타일 힌트 */
function getStyleHint(templateCode: string, tokens: any): string {
  const colors = tokens?.colors || {};
  switch (templateCode) {
    case "kimchi-ogami":
      return `Traditional Korean food aesthetic. Warm ivory (#f4ede0) and deep red (#a71d1d) tones. Hanji paper texture background, celadon ceramic props, wooden utensils. Nostalgic, artisanal, heritage feel. Editorial food photography like Kinfolk magazine.`;
    case "household-modern":
      return `Muji-inspired minimal aesthetic. Pure white background, soft neutral tones, geometric composition, single subject focus. Clean, functional, calm. Studio product photography.`;
    case "electronics-tech":
      return `High-tech premium look. Dark background (#0a0a0a) with neon green accent (#00d47e). Dramatic rim lighting, glossy surfaces, metallic details. Apple/Dyson product shoot style.`;
    case "health-natural":
      return `Clean natural health aesthetic. Sage green (#8fa88f) and beige tones. Botanical elements, soft daylight, organic textures. Wellness brand photography.`;
    case "cosmetics-luxury":
      return `Luxury beauty aesthetic. Rose (#c9a5a0) and gold (#d4af7c) tones on cream background. Soft diffused lighting, silk fabric, marble surfaces. High-end cosmetic editorial style.`;
    default:
      return `Premium Korean e-commerce style with ${colors.background || "clean"} background and ${colors.primary || "brand"} accent color.`;
  }
}

/** 상품을 시각적 프롬프트용 텍스트로 변환 */
function buildProductVisualDesc(product: Product): string {
  const parts = [product.name];
  if (product.category) parts.push(`(${product.category} product)`);
  if (product.origin) parts.push(`from ${product.origin}`);

  const mainFeature = product.features?.[0];
  if (mainFeature) parts.push(`emphasizing ${mainFeature.title}`);

  return parts.join(" ");
}

/**
 * 상품 이미지 6장을 병렬로 생성
 */
export async function generateAllImages(
  product: Product,
  template: Template,
  user_id: string,
  page_id: string,
  useProModel = false
): Promise<GeneratedImageResult[]> {
  const prompts = buildImagePrompts(product, template);

  // 병렬 생성 (Gemini 무료 티어: 분당 10 req 제한 있음, 조금 조절)
  const results: GeneratedImageResult[] = [];
  const errors: string[] = [];

  // 3개씩 배치로 처리
  const BATCH_SIZE = 3;
  for (let i = 0; i < prompts.length; i += BATCH_SIZE) {
    const batch = prompts.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map(({ role, prompt }) =>
        generateOneImage(prompt, role, user_id, page_id, useProModel)
      )
    );

    for (let j = 0; j < settled.length; j++) {
      const s = settled[j];
      if (s.status === "fulfilled") {
        results.push(s.value);
      } else {
        errors.push(`${batch[j].role}: ${s.reason?.message ?? "Unknown"}`);
      }
    }

    // 다음 배치 전에 살짝 딜레이 (rate limit 방지)
    if (i + BATCH_SIZE < prompts.length) {
      await new Promise((r) => setTimeout(r, 1500));
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
