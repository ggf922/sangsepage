// ============================================================
// 상세페이지 HTML 렌더러 (860px 고정폭 이커머스 표준)
// 5개 템플릿 지원: kimchi-ogami, household-modern, electronics-tech, health-natural, cosmetics-luxury
// ============================================================

import type { GeneratedCopy } from "./copy-generator";
import type { GeneratedImageResult } from "./image-generator";
import type { Product, Template, SaleChannel, ProductImage, GifPosition } from "@/lib/types";
import { SALE_CHANNEL_META } from "@/lib/types";

export interface RenderInput {
  product: Product;
  template: Template;
  copy: GeneratedCopy;
  images: GeneratedImageResult[];
}

export function renderHTML(input: RenderInput): string {
  const { template } = input;

  switch (template.code) {
    case "kimchi-ogami":
      return renderKimchiOgami(input);
    case "household-modern":
      return renderHouseholdModern(input);
    case "electronics-tech":
      return renderElectronicsTech(input);
    case "health-natural":
      return renderHealthNatural(input);
    case "cosmetics-luxury":
      return renderCosmeticsLuxury(input);
    default:
      return renderKimchiOgami(input);
  }
}

// ============================================================
// 공통 유틸
// ============================================================

function esc(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 원재료 비율값 정규화.
 * - undefined/null/0 → 빈 문자열 (표시 안 함)
 * - 숫자 → "N%" (소수점 있으면 그대로)
 * - 문자열이면서 이미 %/단위 붙어있으면 그대로 사용
 * - 순수 숫자 문자열이면 %를 붙임
 */
function formatPercentage(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value === 0) return "";
    return `${value}%`;
  }
  const s = String(value).trim();
  if (!s || s === "0") return "";
  // 이미 %가 붙었거나 g/ml/kg/L 같은 단위가 있으면 그대로
  if (/[%％]|[a-zA-Z가-힣]/.test(s)) return s;
  // 순수 숫자면 % 붙임
  if (/^\d+(\.\d+)?$/.test(s)) return `${s}%`;
  return s;
}

/**
 * 문장 끝 안전 처리:
 * - AI 답변이 문장 중간에 잘리는 것을 방지하기 위해, 마지막 글자가
 *   한글 조사·중간글자 등 애매한 문자로 끝나면 마침표를 붙여 자연스럽게 마감.
 * - 이미 . ! ? " ' … 등 종결 부호로 끝나면 그대로 둠.
 */
function ensureSentenceEnd(text: string | null | undefined): string {
  const s = (text ?? "").trim();
  if (!s) return "";
  const last = s.slice(-1);
  if (/[.!?…”"'’)\]】」』.]/.test(last)) return s;
  // 한글 종결 어미(다/요/까/네/죠)로 끝나면 자연 문장 → 마침표 추가
  if (/[다요까네죠]$/.test(s)) return `${s}.`;
  // 그 외에도 문장이 있으면 마침표
  return `${s}.`;
}

function findImage(images: GeneratedImageResult[], role: string): string {
  return images.find((i) => i.role === role)?.url ?? "";
}

function findUserImage(product: Product, role: string): string {
  const imgs = (product.images ?? []) as any[];
  return imgs.find((i) => i.role === role)?.url ?? "";
}

// ============================================================
// GIF 렌더링 (상품 이미지에서 role='gif'인 것들을 특정 위치에 삽입)
// ============================================================

/**
 * 상품에서 특정 위치에 배치된 GIF들을 추출
 * (mime_type이 image/gif인 경우도 포함하여 하위 호환성 확보)
 */
function getGifsAtPosition(product: Product, position: GifPosition): ProductImage[] {
  const imgs = (product.images ?? []) as ProductImage[];
  return imgs
    .filter((img) => {
      const isGif = img.role === "gif" || img.mime_type === "image/gif";
      if (!isGif) return false;
      // 위치 지정이 없는 GIF는 기본 위치인 'after_points'에 표시
      const pos = img.gif_position ?? "after_points";
      return pos === position;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * 특정 위치의 GIF들을 HTML로 렌더링
 * - 배경색과 텍스트 색을 템플릿 팔레트에 맞춰 조정 가능
 * - GIF가 없으면 빈 문자열 반환 (렌더러에서 자연스럽게 스킵됨)
 */
function renderGifsAt(
  product: Product,
  position: GifPosition,
  opts: {
    bg?: string;
    text?: string;
    accent?: string;
    serifClass?: string;
    padded?: boolean; // true면 좌우 60px 여백, false면 전폭
  } = {}
): string {
  const gifs = getGifsAtPosition(product, position);
  if (gifs.length === 0) return "";

  const bg = opts.bg ?? "#faf5ea";
  const text = opts.text ?? "#2b1f18";
  const accent = opts.accent ?? "#a71d1d";
  const serifClass = opts.serifClass ?? "";
  const padded = opts.padded ?? true;

  return `
  <!-- GIF Slot: ${position} -->
  <section style="background:${bg};${padded ? "padding:48px 60px;" : "padding:0;"}text-align:center;">
    ${gifs
      .map((gif, idx) => {
        const isLast = idx === gifs.length - 1;
        return `
      <figure style="margin:0;${!isLast ? "margin-bottom:32px;" : ""}">
        <img
          src="${esc(gif.url)}"
          alt="${esc(gif.gif_caption || product.name)}"
          style="width:100%;${padded ? "max-width:740px;" : ""}margin:0 auto;border-radius:${padded ? "12px" : "0"};box-shadow:${padded ? "0 12px 40px rgba(0,0,0,0.08)" : "none"};display:block;"
          loading="lazy"
        >
        ${
          gif.gif_caption
            ? `<figcaption class="${serifClass}" style="margin-top:16px;font-size:14px;color:${text};opacity:0.7;font-style:italic;letter-spacing:0.5px;">
             <span style="display:inline-block;width:24px;height:1px;background:${accent};vertical-align:middle;margin-right:8px;opacity:0.6;"></span>
             ${esc(gif.gif_caption)}
             <span style="display:inline-block;width:24px;height:1px;background:${accent};vertical-align:middle;margin-left:8px;opacity:0.6;"></span>
           </figcaption>`
            : ""
        }
      </figure>`;
      })
      .join("")}
  </section>`;
}

function renderChannelBadges(channels: SaleChannel[]): string {
  if (!channels || channels.length === 0) return "";
  return channels
    .map((ch) => {
      const meta = SALE_CHANNEL_META[ch.type];
      const label = meta?.label ?? ch.type;
      const color = meta?.color ?? "#666";
      const priceStr = ch.price ? `${ch.price.toLocaleString()}원` : "";
      const inner = ch.url
        ? `<a href="${esc(ch.url)}" target="_blank" rel="noopener" style="color:#fff;text-decoration:none;display:block;">${esc(label)}${priceStr ? ` <span style="opacity:0.9;font-size:12px;">${priceStr}</span>` : ""}</a>`
        : `${esc(label)}${priceStr ? ` <span style="opacity:0.9;font-size:12px;">${priceStr}</span>` : ""}`;
      return `<span style="display:inline-block;padding:8px 16px;background:${color};color:#fff;border-radius:20px;font-size:14px;font-weight:500;margin:4px;">${inner}</span>`;
    })
    .join("");
}

function renderPoints(points: GeneratedCopy["points"], color: string): string {
  return points
    .map(
      (p) => `
    <div style="text-align:center;padding:24px 16px;background:rgba(255,255,255,0.6);border-radius:12px;">
      <div style="font-size:36px;margin-bottom:12px;">${esc(p.icon || "✨")}</div>
      <h3 style="font-size:18px;font-weight:700;color:${color};margin:0 0 8px;">${esc(p.title)}</h3>
      <p style="font-size:14px;color:#555;margin:0;line-height:1.6;">${esc(p.description)}</p>
    </div>`
    )
    .join("");
}

function renderSpecTable(items: GeneratedCopy["spec_summary"]["items"]): string {
  if (!items || items.length === 0) return "";
  return items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 16px;background:#faf5ea;font-weight:600;width:35%;border-bottom:1px solid rgba(0,0,0,0.05);">${esc(item.label)}</td>
      <td style="padding:12px 16px;color:#555;border-bottom:1px solid rgba(0,0,0,0.05);">${esc(item.value)}</td>
    </tr>`
    )
    .join("");
}

// ============================================================
// 신뢰 배지 (인증·수상) - 5개 템플릿 공통 유틸
// ============================================================

/**
 * 인증마크·수상 이력을 시각적 배지로 렌더링
 * - extra_info.certifications, extra_info.awards 활용
 * - 없으면 빈 문자열 반환 (섹션 자동 생략)
 */
function renderTrustBadges(product: Product, opts: {
  primary: string;
  bg: string;
  bgLight: string;
  text: string;
  serifClass?: string;
}): string {
  const info = product.extra_info || {};
  const certs = (info.certifications as string[] | undefined) ?? [];
  const awards = (info.awards as string[] | undefined) ?? [];
  if (certs.length === 0 && awards.length === 0) return "";

  const renderChips = (items: string[], icon: string) =>
    items
      .map(
        (v) => `
      <div style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:${opts.bgLight};border:1.5px solid ${opts.primary}22;border-radius:24px;margin:6px;font-size:13px;font-weight:600;color:${opts.text};">
        <span style="font-size:16px;">${icon}</span>
        <span>${esc(v)}</span>
      </div>`
      )
      .join("");

  return `
  <section class="section" style="background:${opts.bg};text-align:center;">
    <h2 ${opts.serifClass ? `class="${opts.serifClass}"` : ""} style="font-size:24px;font-weight:700;color:${opts.primary};margin-bottom:8px;">믿을 수 있는 이유</h2>
    <p style="font-size:13px;color:${opts.text};opacity:0.6;margin-bottom:24px;">공식 인증과 수상 이력으로 증명된 품질</p>
    <div style="max-width:720px;margin:0 auto;">
      ${renderChips(certs, "✓")}
      ${renderChips(awards, "★")}
    </div>
  </section>`;
}

// ============================================================
// 브랜드/만든 사람 스토리 섹션 - 5개 템플릿 공통 유틸
// ============================================================

/**
 * "만든 사람들" 브랜드 스토리 카드
 * - copy.maker_story 활용, 없으면 extra_info.brand_story fallback
 * - 이미지: process_shot 우선, 없으면 lifestyle
 */
function renderMakerStory(
  copy: GeneratedCopy,
  product: Product,
  images: GeneratedImageResult[],
  opts: {
    primary: string;
    bg: string;
    bgLight: string;
    text: string;
    accent: string;
    serifClass?: string;
  }
): string {
  const info = product.extra_info || {};
  const maker = copy.maker_story;
  const brandName = info.brand_name as string | undefined;
  const brandStory = info.brand_story as string | undefined;

  // 카피 우선, 없으면 extra_info로 조립, 그것도 없으면 렌더링 스킵
  const heading = maker?.heading ?? (brandName ? `${brandName}의 이야기` : "");
  const body = maker?.body ?? brandStory ?? "";
  if (!heading || !body) return "";

  const processImg = findImage(images, "process_shot") || findImage(images, "lifestyle");
  const quote = maker?.quote;
  const attribution = maker?.attribution;

  return `
  <section class="section" style="background:${opts.bg};">
    <div style="max-width:720px;margin:0 auto;">
      <h2 ${opts.serifClass ? `class="${opts.serifClass}"` : ""} style="font-size:32px;font-weight:700;color:${opts.primary};text-align:center;margin-bottom:8px;">${esc(heading)}</h2>
      <div style="width:40px;height:2px;background:${opts.primary};margin:16px auto 32px;"></div>
      ${processImg ? `<img src="${processImg}" alt="만든 사람들" style="width:100%;border-radius:8px;margin-bottom:32px;box-shadow:0 8px 32px rgba(0,0,0,0.08);">` : ""}
      <p style="font-size:16px;color:${opts.text};line-height:2;text-align:center;margin-bottom:${quote ? "32px" : "0"};">${esc(body)}</p>
      ${
        quote
          ? `
      <div style="background:${opts.bgLight};border-left:4px solid ${opts.primary};padding:24px 28px;border-radius:0 8px 8px 0;margin-top:32px;">
        <p ${opts.serifClass ? `class="${opts.serifClass}"` : ""} style="font-size:18px;font-style:italic;color:${opts.primary};line-height:1.7;margin-bottom:${attribution ? "12px" : "0"};">"${esc(quote)}"</p>
        ${attribution ? `<p style="font-size:13px;color:${opts.text};opacity:0.65;text-align:right;margin:0;">— ${esc(attribution)}</p>` : ""}
      </div>`
          : ""
      }
    </div>
  </section>`;
}

// ============================================================
// A: 김치·오가미 스타일
// ============================================================

function renderKimchiOgami(input: RenderInput): string {
  const { product, template, copy, images } = input;
  const tokens = (template.design_tokens ?? {}) as any;
  const colors = tokens.colors ?? {};
  const primary = colors.primary ?? "#a71d1d";
  const bg = colors.background ?? "#f4ede0";
  const bgLight = colors.backgroundLight ?? "#faf5ea";
  const text = colors.text ?? "#2b1f18";
  const accent = colors.accent ?? "#e8c98a";

  const heroImg = findImage(images, "hero") || findUserImage(product, "main");
  const detail1 = findImage(images, "detail_1") || findUserImage(product, "detail");
  const detail2 = findImage(images, "detail_2");
  const detailCloseImg = findImage(images, "detail_close");
  const ingredientImg = findImage(images, "ingredient");
  const processImg = findImage(images, "process_shot");
  const comparisonImg = findImage(images, "comparison");
  const lifestyleImg = findImage(images, "lifestyle");
  const signatureImg = findImage(images, "signature");

  const trustBadges = renderTrustBadges(product, {
    primary,
    bg: bgLight,
    bgLight: "#ffffff",
    text,
    serifClass: "serif",
  });
  const makerStory = renderMakerStory(copy, product, images, {
    primary,
    bg,
    bgLight,
    text,
    accent,
    serifClass: "serif",
  });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=860, initial-scale=1.0">
<title>${esc(copy.meta.seo_title || product.name)}</title>
<meta name="description" content="${esc(copy.meta.seo_description)}">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Nanum+Myeongjo:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans KR', sans-serif; color: ${text}; background: ${bg}; line-height: 1.7; word-break: keep-all; overflow-wrap: break-word; }
  p, li, span, h1, h2, h3, h4, h5, h6, div { word-break: keep-all; overflow-wrap: break-word; }
  .page { width: 860px; margin: 0 auto; background: ${bg}; }
  .serif { font-family: 'Nanum Myeongjo', serif; }
  .section { padding: 60px 60px; }
  .divider { width: 60px; height: 2px; background: ${primary}; margin: 24px auto; }
  img { max-width: 100%; display: block; }
</style>
</head>
<body>
<div class="page">

  <!-- 1. Hero -->
  <section style="position:relative;background:${bg};padding:80px 60px 60px;text-align:center;">
    ${copy.hero.badge ? `<div style="display:inline-block;padding:8px 20px;background:${primary};color:#fff;border-radius:20px;font-size:13px;letter-spacing:2px;font-weight:500;margin-bottom:24px;">${esc(copy.hero.badge)}</div>` : ""}
    <h1 class="serif" style="font-size:52px;font-weight:800;color:${primary};margin-bottom:20px;letter-spacing:-1px;line-height:1.2;">${esc(copy.hero.title)}</h1>
    <p style="font-size:20px;color:${text};opacity:0.75;margin-bottom:40px;font-weight:300;">${esc(copy.hero.subtitle)}</p>
    ${heroImg ? `<img src="${heroImg}" alt="${esc(product.name)}" style="width:100%;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,0.1);">` : ""}
  </section>

  <!-- GIF: after_hero -->
  ${renderGifsAt(product, "after_hero", { bg, text, accent: primary, serifClass: "serif" })}

  <!-- 2. Intro -->
  <section class="section" style="background:${bgLight};text-align:center;">
    <h2 class="serif" style="font-size:32px;font-weight:700;color:${primary};margin-bottom:12px;">${esc(copy.intro.heading)}</h2>
    <div class="divider"></div>
    <p style="font-size:16px;color:${text};max-width:640px;margin:0 auto;line-height:2;">${esc(ensureSentenceEnd(copy.intro.body))}</p>
  </section>

  <!-- GIF: after_intro -->
  ${renderGifsAt(product, "after_intro", { bg: bgLight, text, accent: primary, serifClass: "serif" })}

  <!-- 3. Spec Summary -->
  <section class="section" style="background:${bg};">
    <h2 class="serif" style="font-size:28px;font-weight:700;color:${primary};text-align:center;margin-bottom:32px;">${esc(copy.spec_summary.heading)}</h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
      ${renderSpecTable(copy.spec_summary.items)}
    </table>
  </section>

  <!-- 4. Points -->
  ${copy.points.length > 0 ? `
  <section class="section" style="background:${bgLight};">
    <h2 class="serif" style="font-size:32px;font-weight:700;color:${primary};text-align:center;margin-bottom:8px;">이 상품의 특별함</h2>
    <div class="divider"></div>
    <div style="display:grid;grid-template-columns:repeat(${Math.min(copy.points.length, 3)}, 1fr);gap:16px;margin-top:32px;">
      ${renderPoints(copy.points, primary)}
    </div>
  </section>
  ` : ""}

  <!-- GIF: after_points ⭐ 소비자 선호 1위 위치 -->
  ${renderGifsAt(product, "after_points", { bg, text, accent: primary, serifClass: "serif" })}

  <!-- 4b. Trust Badges (인증·수상) -->
  ${trustBadges}

  <!-- 5. Detail Images -->
  ${detail1 ? `
  <section style="background:${bg};padding:0;">
    <img src="${detail1}" alt="상세컷 1" style="width:100%;">
  </section>
  ` : ""}

  <!-- GIF: after_detail -->
  ${renderGifsAt(product, "after_detail", { bg, text, accent: primary, serifClass: "serif" })}

  <!-- 5b. Close-up Macro (질감·디테일) -->
  ${detailCloseImg ? `
  <section class="section" style="background:${bgLight};text-align:center;">
    <h2 class="serif" style="font-size:26px;font-weight:700;color:${primary};margin-bottom:8px;">가까이서 보다</h2>
    <div class="divider"></div>
    <img src="${detailCloseImg}" alt="클로즈업" style="width:100%;max-width:600px;margin:24px auto 0;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,0.1);">
  </section>
  ` : ""}

  <!-- 6. Ingredients -->
  ${copy.ingredients_intro && product.ingredients?.length ? `
  <section class="section" style="background:${bgLight};">
    <h2 class="serif" style="font-size:32px;font-weight:700;color:${primary};text-align:center;margin-bottom:12px;">${esc(copy.ingredients_intro.heading)}</h2>
    <div class="divider"></div>
    <p style="font-size:16px;color:${text};max-width:640px;margin:0 auto 40px;line-height:2;text-align:center;">${esc(ensureSentenceEnd(copy.ingredients_intro.body))}</p>
    ${ingredientImg ? `<img src="${ingredientImg}" alt="원재료" style="width:100%;border-radius:8px;margin-bottom:32px;">` : ""}
    <div style="background:#fff;border-radius:12px;padding:32px;">
      <h3 style="font-size:18px;font-weight:700;color:${primary};margin-bottom:20px;text-align:center;letter-spacing:2px;">주요 원재료</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        ${product.ingredients.map(ing => `
        <div style="padding:16px;background:${bgLight};border-radius:8px;border-left:3px solid ${primary};">
          <div style="font-size:16px;font-weight:700;color:${text};margin-bottom:4px;">${esc(ing.name)}${formatPercentage(ing.percentage) ? ` <span style="font-size:12px;color:${primary};">${formatPercentage(ing.percentage)}</span>` : ""}</div>
          ${ing.origin ? `<div style="font-size:13px;color:#666;margin-bottom:2px;">원산지: ${esc(ing.origin)}</div>` : ""}
          ${ing.note ? `<div style="font-size:13px;color:#666;">${esc(ing.note)}</div>` : ""}
        </div>
        `).join("")}
      </div>
    </div>
  </section>
  ` : ""}

  <!-- 7. Banner -->
  ${detail2 ? `
  <section style="background:${primary};padding:0;position:relative;">
    <img src="${detail2}" alt="배너" style="width:100%;opacity:0.85;">
  </section>
  ` : ""}

  <!-- 8. Process (스텝 다이어그램 + 사진) -->
  ${copy.process ? `
  <section class="section" style="background:${bg};">
    <h2 class="serif" style="font-size:32px;font-weight:700;color:${primary};text-align:center;margin-bottom:12px;">${esc(copy.process.heading)}</h2>
    <div class="divider"></div>
    ${processImg ? `<img src="${processImg}" alt="공정" style="width:100%;border-radius:8px;margin:32px 0;">` : ""}
    <div style="display:grid;grid-template-columns:repeat(${copy.process.steps.length}, 1fr);gap:16px;margin-top:40px;">
      ${copy.process.steps.map((step, i) => `
      <div style="text-align:center;">
        <div style="width:60px;height:60px;border-radius:50%;background:${primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;margin:0 auto 16px;font-family:'Nanum Myeongjo',serif;">${i + 1}</div>
        <h3 class="serif" style="font-size:18px;font-weight:700;color:${primary};margin-bottom:8px;">${esc(step.title)}</h3>
        <p style="font-size:13px;color:${text};opacity:0.75;line-height:1.6;">${esc(step.description)}</p>
      </div>
      `).join("")}
    </div>
  </section>
  ` : ""}

  <!-- GIF: after_process -->
  ${renderGifsAt(product, "after_process", { bg, text, accent: primary, serifClass: "serif" })}

  <!-- 8b. Maker Story (만든 사람들) -->
  ${makerStory}

  <!-- 8c. Comparison (크기/구성 비교) -->
  ${comparisonImg ? `
  <section class="section" style="background:${bgLight};text-align:center;">
    <h2 class="serif" style="font-size:26px;font-weight:700;color:${primary};margin-bottom:8px;">한눈에 보기</h2>
    <div class="divider"></div>
    <img src="${comparisonImg}" alt="구성 비교" style="width:100%;margin-top:24px;border-radius:8px;">
  </section>
  ` : ""}

  <!-- 9. Lifestyle -->
  ${lifestyleImg ? `
  <section style="background:${bg};padding:0;">
    <img src="${lifestyleImg}" alt="라이프스타일" style="width:100%;">
  </section>
  ` : ""}

  <!-- GIF: after_lifestyle -->
  ${renderGifsAt(product, "after_lifestyle", { bg, text, accent: primary, serifClass: "serif" })}

  <!-- GIF: before_signature -->
  ${renderGifsAt(product, "before_signature", { bg: bgLight, text, accent: primary, serifClass: "serif" })}

  <!-- 10. Signature -->
  <section class="section" style="background:${bgLight};text-align:center;">
    <h2 class="serif" style="font-size:36px;font-weight:800;color:${primary};margin-bottom:20px;line-height:1.4;">${esc(copy.signature.heading)}</h2>
    <div class="divider"></div>
    <p style="font-size:16px;color:${text};max-width:600px;margin:0 auto 32px;line-height:2;">${esc(ensureSentenceEnd(copy.signature.body))}</p>
    ${signatureImg ? `<img src="${signatureImg}" alt="시그니처" style="width:100%;max-width:640px;margin:0 auto;border-radius:8px;">` : ""}
  </section>

  <!-- 11. Sale Channels -->
  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bg};text-align:center;">
    <h2 class="serif" style="font-size:28px;font-weight:700;color:${primary};margin-bottom:24px;">구매 채널</h2>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <!-- 12. Shipping -->
  <section class="section" style="background:${primary};color:#fff;text-align:center;">
    <h2 class="serif" style="font-size:28px;font-weight:700;color:#fff;margin-bottom:16px;">${esc(copy.shipping_summary.heading)}</h2>
    <p style="font-size:15px;opacity:0.9;line-height:2;max-width:560px;margin:0 auto;">${esc(ensureSentenceEnd(copy.shipping_summary.body))}</p>
  </section>

  <!-- Footer -->
  <footer style="background:${text};color:#fff;padding:32px 60px;text-align:center;">
    <p style="font-size:12px;opacity:0.6;margin:0;">본 상세페이지는 88km AI로 제작되었습니다.</p>
  </footer>

</div>
</body>
</html>`;
}

// ============================================================
// B: 생활용품 (모던 미니멀)
// ============================================================

function renderHouseholdModern(input: RenderInput): string {
  const { product, template, copy, images } = input;
  const tokens = (template.design_tokens ?? {}) as any;
  const colors = tokens.colors ?? {};
  const primary = colors.primary ?? "#2d2d2d";
  const bg = colors.background ?? "#f5f5f5";
  const bgLight = colors.backgroundLight ?? "#ffffff";
  const text = colors.text ?? "#1a1a1a";

  const heroImg = findImage(images, "hero") || findUserImage(product, "main");
  const detail1 = findImage(images, "detail_1");
  const detailCloseImg = findImage(images, "detail_close");
  const comparisonImg = findImage(images, "comparison");
  const lifestyleImg = findImage(images, "lifestyle");

  const trustBadges = renderTrustBadges(product, { primary, bg, bgLight, text });
  const makerStory = renderMakerStory(copy, product, images, {
    primary, bg, bgLight, text, accent: primary,
  });

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${esc(product.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Noto+Sans+KR:wght@300;400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Noto Sans KR', sans-serif; color: ${text}; background: ${bgLight}; line-height: 1.7; word-break: keep-all; overflow-wrap: break-word; }
  p, li, span, h1, h2, h3, h4, h5, h6, div { word-break: keep-all; overflow-wrap: break-word; }
  .page { width: 860px; margin: 0 auto; }
  .section { padding: 80px 80px; }
  img { max-width: 100%; display: block; }
</style></head><body><div class="page">

  <section style="padding:120px 80px 80px;background:${bgLight};text-align:center;">
    <p style="font-size:12px;letter-spacing:3px;color:#999;text-transform:uppercase;margin-bottom:24px;">${esc(copy.hero.badge)}</p>
    <h1 style="font-size:56px;font-weight:300;color:${text};margin-bottom:20px;letter-spacing:-2px;">${esc(copy.hero.title)}</h1>
    <p style="font-size:18px;color:#666;font-weight:300;">${esc(copy.hero.subtitle)}</p>
  </section>

  ${heroImg ? `<img src="${heroImg}" alt="${esc(product.name)}" style="width:100%;">` : ""}

  <!-- GIF: after_hero -->
  ${renderGifsAt(product, "after_hero", { bg: bgLight, text, accent: primary })}

  <section class="section" style="background:${bg};text-align:center;">
    <h2 style="font-size:28px;font-weight:400;color:${text};margin-bottom:32px;">${esc(copy.intro.heading)}</h2>
    <p style="font-size:16px;color:#555;max-width:560px;margin:0 auto;line-height:2;font-weight:300;">${esc(ensureSentenceEnd(copy.intro.body))}</p>
  </section>

  <!-- GIF: after_intro -->
  ${renderGifsAt(product, "after_intro", { bg, text, accent: primary })}

  ${copy.points.length ? `
  <section class="section" style="background:${bgLight};">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;">
      ${copy.points.map(p => `
      <div>
        <div style="font-size:32px;margin-bottom:16px;">${esc(p.icon || "•")}</div>
        <h3 style="font-size:18px;font-weight:500;color:${text};margin-bottom:12px;">${esc(p.title)}</h3>
        <p style="font-size:14px;color:#666;line-height:1.8;font-weight:300;">${esc(p.description)}</p>
      </div>
      `).join("")}
    </div>
  </section>
  ` : ""}

  <!-- GIF: after_points -->
  ${renderGifsAt(product, "after_points", { bg: bgLight, text, accent: primary })}

  ${detail1 ? `<img src="${detail1}" alt="상세" style="width:100%;">` : ""}

  <!-- GIF: after_detail -->
  ${renderGifsAt(product, "after_detail", { bg, text, accent: primary })}

  <section class="section" style="background:${bg};">
    <h2 style="font-size:24px;font-weight:400;color:${text};margin-bottom:32px;text-align:center;">${esc(copy.spec_summary.heading)}</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${copy.spec_summary.items.map(item => `
      <tr><td style="padding:16px 0;border-bottom:1px solid #ddd;font-size:14px;color:${text};font-weight:500;width:30%;">${esc(item.label)}</td>
      <td style="padding:16px 0;border-bottom:1px solid #ddd;font-size:14px;color:#666;">${esc(item.value)}</td></tr>
      `).join("")}
    </table>
  </section>

  ${detailCloseImg ? `<img src="${detailCloseImg}" alt="close-up" style="width:100%;">` : ""}

  ${trustBadges}

  ${makerStory}

  ${comparisonImg ? `<img src="${comparisonImg}" alt="comparison" style="width:100%;">` : ""}

  ${lifestyleImg ? `<img src="${lifestyleImg}" alt="lifestyle" style="width:100%;">` : ""}

  <!-- GIF: after_lifestyle -->
  ${renderGifsAt(product, "after_lifestyle", { bg, text, accent: primary })}

  <!-- GIF: before_signature -->
  ${renderGifsAt(product, "before_signature", { bg: bgLight, text, accent: primary })}

  <section class="section" style="background:${primary};color:#fff;text-align:center;">
    <h2 style="font-size:32px;font-weight:300;margin-bottom:20px;">${esc(copy.signature.heading)}</h2>
    <p style="font-size:15px;opacity:0.8;max-width:520px;margin:0 auto;line-height:2;font-weight:300;">${esc(ensureSentenceEnd(copy.signature.body))}</p>
  </section>

  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bgLight};text-align:center;">
    <h3 style="font-size:16px;font-weight:500;margin-bottom:20px;">구매 채널</h3>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <footer style="background:${text};color:#fff;padding:24px 80px;text-align:center;font-size:11px;opacity:0.6;">© 88km AI</footer>

</div></body></html>`;
}

// ============================================================
// C: 전자제품 (테크 프리미엄) - 다크 테마
// ============================================================

function renderElectronicsTech(input: RenderInput): string {
  const { product, template, copy, images } = input;
  const tokens = (template.design_tokens ?? {}) as any;
  const colors = tokens.colors ?? {};
  const primary = colors.primary ?? "#00d47e";
  const bg = colors.background ?? "#0a0a0a";
  const bgLight = colors.backgroundLight ?? "#1a1a1a";

  const heroImg = findImage(images, "hero") || findUserImage(product, "main");
  const detail1 = findImage(images, "detail_1");
  const detail2 = findImage(images, "detail_2");
  const detailCloseImg = findImage(images, "detail_close");
  const comparisonImg = findImage(images, "comparison");
  const lifestyleImg = findImage(images, "lifestyle");

  // 다크 테마: 배지·스토리도 다크 톤으로
  const trustBadges = renderTrustBadges(product, {
    primary,
    bg: bgLight,
    bgLight: "#252525",
    text: "#e5e5e5",
  });
  const makerStory = renderMakerStory(copy, product, images, {
    primary,
    bg,
    bgLight,
    text: "#e5e5e5",
    accent: primary,
  });

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${esc(product.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter','Noto Sans KR',sans-serif;color:#fff;background:${bg};line-height:1.7;word-break:keep-all;overflow-wrap:break-word;}
  p,li,span,h1,h2,h3,h4,h5,h6,div{word-break:keep-all;overflow-wrap:break-word;}
  .page{width:860px;margin:0 auto;background:${bg};}
  .section{padding:80px 60px;}
  img{max-width:100%;display:block;}
</style></head><body><div class="page">

  <section style="padding:120px 60px 60px;background:${bg};text-align:center;">
    <div style="display:inline-block;padding:6px 16px;border:1px solid ${primary};color:${primary};font-size:11px;letter-spacing:3px;font-weight:500;margin-bottom:32px;">${esc(copy.hero.badge)}</div>
    <h1 style="font-size:64px;font-weight:900;color:#fff;margin-bottom:20px;letter-spacing:-2px;line-height:1.1;">${esc(copy.hero.title)}</h1>
    <p style="font-size:20px;color:#a3a3a3;font-weight:300;">${esc(copy.hero.subtitle)}</p>
  </section>

  ${heroImg ? `<img src="${heroImg}" alt="${esc(product.name)}" style="width:100%;">` : ""}

  <!-- GIF: after_hero -->
  ${renderGifsAt(product, "after_hero", { bg, text: "#e5e5e5", accent: primary })}

  <section class="section" style="background:${bgLight};text-align:center;">
    <h2 style="font-size:36px;font-weight:700;color:${primary};margin-bottom:24px;">${esc(copy.intro.heading)}</h2>
    <p style="font-size:16px;color:#a3a3a3;max-width:640px;margin:0 auto;line-height:2;">${esc(ensureSentenceEnd(copy.intro.body))}</p>
  </section>

  <!-- GIF: after_intro -->
  ${renderGifsAt(product, "after_intro", { bg: bgLight, text: "#e5e5e5", accent: primary })}

  <section class="section" style="background:${bg};">
    <h2 style="font-size:32px;font-weight:700;color:#fff;text-align:center;margin-bottom:40px;">SPECIFICATIONS</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      ${copy.spec_summary.items.map(item => `
      <div style="padding:24px;background:${bgLight};border-left:3px solid ${primary};">
        <div style="font-size:12px;color:${primary};letter-spacing:2px;margin-bottom:6px;text-transform:uppercase;">${esc(item.label)}</div>
        <div style="font-size:18px;color:#fff;font-weight:500;">${esc(item.value)}</div>
      </div>
      `).join("")}
    </div>
  </section>

  ${detail1 ? `<img src="${detail1}" alt="detail" style="width:100%;">` : ""}

  <!-- GIF: after_detail -->
  ${renderGifsAt(product, "after_detail", { bg, text: "#e5e5e5", accent: primary })}

  ${copy.points.length ? `
  <section class="section" style="background:${bgLight};">
    <h2 style="font-size:32px;font-weight:700;color:#fff;text-align:center;margin-bottom:48px;">FEATURES</h2>
    <div style="display:grid;grid-template-columns:repeat(${Math.min(copy.points.length, 2)}, 1fr);gap:24px;">
      ${copy.points.map(p => `
      <div style="padding:32px;background:${bg};border:1px solid #333;">
        <div style="font-size:32px;margin-bottom:16px;color:${primary};">${esc(p.icon || "◆")}</div>
        <h3 style="font-size:20px;font-weight:700;color:#fff;margin-bottom:12px;">${esc(p.title)}</h3>
        <p style="font-size:14px;color:#a3a3a3;line-height:1.8;">${esc(p.description)}</p>
      </div>
      `).join("")}
    </div>
  </section>
  ` : ""}

  <!-- GIF: after_points -->
  ${renderGifsAt(product, "after_points", { bg: bgLight, text: "#e5e5e5", accent: primary })}

  ${detail2 ? `<img src="${detail2}" alt="detail 2" style="width:100%;">` : ""}
  ${detailCloseImg ? `<img src="${detailCloseImg}" alt="close-up" style="width:100%;">` : ""}

  ${trustBadges}

  ${comparisonImg ? `<img src="${comparisonImg}" alt="comparison" style="width:100%;">` : ""}

  ${makerStory}

  ${lifestyleImg ? `<img src="${lifestyleImg}" alt="lifestyle" style="width:100%;">` : ""}

  <!-- GIF: after_lifestyle -->
  ${renderGifsAt(product, "after_lifestyle", { bg, text: "#e5e5e5", accent: primary })}

  <!-- GIF: before_signature -->
  ${renderGifsAt(product, "before_signature", { bg: bgLight, text: "#e5e5e5", accent: primary })}

  <section class="section" style="background:${primary};color:${bg};text-align:center;">
    <h2 style="font-size:40px;font-weight:900;margin-bottom:20px;letter-spacing:-1px;">${esc(copy.signature.heading)}</h2>
    <p style="font-size:15px;max-width:560px;margin:0 auto;line-height:2;font-weight:500;">${esc(ensureSentenceEnd(copy.signature.body))}</p>
  </section>

  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bg};text-align:center;">
    <h3 style="font-size:14px;font-weight:500;color:${primary};letter-spacing:2px;margin-bottom:20px;">AVAILABLE ON</h3>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <footer style="background:#000;color:#666;padding:24px 60px;text-align:center;font-size:11px;">© 88km AI</footer>

</div></body></html>`;
}

// ============================================================
// D: 건강식품 (클린 내추럴)
// ============================================================

function renderHealthNatural(input: RenderInput): string {
  const { product, template, copy, images } = input;
  const tokens = (template.design_tokens ?? {}) as any;
  const colors = tokens.colors ?? {};
  const primary = colors.primary ?? "#8fa88f";
  const bg = colors.background ?? "#f0ebe0";
  const bgLight = colors.backgroundLight ?? "#ffffff";
  const text = colors.text ?? "#3d3d3d";

  const heroImg = findImage(images, "hero") || findUserImage(product, "main");
  const ingredientImg = findImage(images, "ingredient");
  const detailCloseImg = findImage(images, "detail_close");
  const processImg = findImage(images, "process_shot");
  const comparisonImg = findImage(images, "comparison");
  const lifestyleImg = findImage(images, "lifestyle");
  const signatureImg = findImage(images, "signature");

  const trustBadges = renderTrustBadges(product, {
    primary, bg, bgLight, text, serifClass: "serif",
  });
  const makerStory = renderMakerStory(copy, product, images, {
    primary, bg, bgLight, text, accent: primary, serifClass: "serif",
  });

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${esc(product.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Nanum+Myeongjo:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Noto Sans KR',sans-serif;color:${text};background:${bg};line-height:1.7;word-break:keep-all;overflow-wrap:break-word;}
  p,li,span,h1,h2,h3,h4,h5,h6,div{word-break:keep-all;overflow-wrap:break-word;}
  .page{width:860px;margin:0 auto;background:${bg};}
  .section{padding:60px 60px;}
  .serif{font-family:'Nanum Myeongjo',serif;}
  img{max-width:100%;display:block;}
</style></head><body><div class="page">

  <section style="padding:80px 60px 60px;background:${bgLight};text-align:center;">
    ${copy.hero.badge ? `<div style="display:inline-block;padding:6px 18px;background:${primary};color:#fff;border-radius:16px;font-size:12px;letter-spacing:2px;margin-bottom:24px;">${esc(copy.hero.badge)}</div>` : ""}
    <h1 class="serif" style="font-size:48px;font-weight:700;color:${primary};margin-bottom:20px;">${esc(copy.hero.title)}</h1>
    <p style="font-size:18px;color:${text};opacity:0.7;">${esc(copy.hero.subtitle)}</p>
  </section>

  ${heroImg ? `<img src="${heroImg}" alt="${esc(product.name)}" style="width:100%;">` : ""}

  <!-- GIF: after_hero -->
  ${renderGifsAt(product, "after_hero", { bg, text, accent: primary, serifClass: "serif" })}

  <section class="section" style="background:${bg};text-align:center;">
    <h2 class="serif" style="font-size:30px;font-weight:700;color:${primary};margin-bottom:24px;">${esc(copy.intro.heading)}</h2>
    <p style="font-size:16px;color:${text};max-width:600px;margin:0 auto;line-height:2;">${esc(ensureSentenceEnd(copy.intro.body))}</p>
  </section>

  <!-- GIF: after_intro -->
  ${renderGifsAt(product, "after_intro", { bg, text, accent: primary, serifClass: "serif" })}

  ${copy.points.length ? `
  <section class="section" style="background:${bgLight};">
    <h2 class="serif" style="font-size:28px;font-weight:700;color:${primary};text-align:center;margin-bottom:40px;">건강한 이유</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      ${copy.points.map(p => `
      <div style="padding:28px;background:${bg};border-radius:16px;text-align:center;">
        <div style="font-size:40px;margin-bottom:16px;">${esc(p.icon || "🌿")}</div>
        <h3 style="font-size:17px;font-weight:700;color:${primary};margin-bottom:8px;">${esc(p.title)}</h3>
        <p style="font-size:13px;color:${text};opacity:0.75;line-height:1.7;">${esc(p.description)}</p>
      </div>
      `).join("")}
    </div>
  </section>
  ` : ""}

  <!-- GIF: after_points -->
  ${renderGifsAt(product, "after_points", { bg: bgLight, text, accent: primary, serifClass: "serif" })}

  ${ingredientImg && product.ingredients?.length ? `
  <section class="section" style="background:${bg};">
    <h2 class="serif" style="font-size:28px;font-weight:700;color:${primary};text-align:center;margin-bottom:24px;">${copy.ingredients_intro ? esc(copy.ingredients_intro.heading) : "원재료"}</h2>
    <img src="${ingredientImg}" alt="원재료" style="width:100%;border-radius:12px;margin-bottom:24px;">
    ${copy.ingredients_intro ? `<p style="font-size:15px;color:${text};max-width:600px;margin:0 auto 32px;line-height:2;text-align:center;">${esc(ensureSentenceEnd(copy.ingredients_intro.body))}</p>` : ""}
    <div style="background:${bgLight};border-radius:12px;padding:28px;">
      ${product.ingredients.map(ing => `
      <div style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.05);">
        <span style="font-weight:700;color:${primary};">${esc(ing.name)}</span>
        ${formatPercentage(ing.percentage) ? ` <span style="font-size:13px;color:#888;">${formatPercentage(ing.percentage)}</span>` : ""}
        ${ing.origin ? ` <span style="font-size:13px;color:#888;">· ${esc(ing.origin)}</span>` : ""}
      </div>
      `).join("")}
    </div>
  </section>
  ` : ""}

  <section class="section" style="background:${bgLight};">
    <h2 class="serif" style="font-size:24px;font-weight:700;color:${primary};text-align:center;margin-bottom:24px;">${esc(copy.spec_summary.heading)}</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${renderSpecTable(copy.spec_summary.items)}
    </table>
  </section>

  ${detailCloseImg ? `<img src="${detailCloseImg}" alt="close-up" style="width:100%;">` : ""}

  <!-- GIF: after_detail -->
  ${renderGifsAt(product, "after_detail", { bg, text, accent: primary, serifClass: "serif" })}

  ${trustBadges}

  ${makerStory}

  ${comparisonImg ? `<img src="${comparisonImg}" alt="comparison" style="width:100%;">` : ""}

  ${lifestyleImg ? `<img src="${lifestyleImg}" alt="lifestyle" style="width:100%;">` : ""}

  <!-- GIF: after_lifestyle -->
  ${renderGifsAt(product, "after_lifestyle", { bg, text, accent: primary, serifClass: "serif" })}

  <!-- GIF: before_signature -->
  ${renderGifsAt(product, "before_signature", { bg: bgLight, text, accent: primary, serifClass: "serif" })}

  <section class="section" style="background:${primary};color:#fff;text-align:center;">
    <h2 class="serif" style="font-size:32px;font-weight:700;margin-bottom:20px;">${esc(copy.signature.heading)}</h2>
    <p style="font-size:15px;opacity:0.95;max-width:540px;margin:0 auto;line-height:2;">${esc(ensureSentenceEnd(copy.signature.body))}</p>
  </section>

  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bg};text-align:center;">
    <h3 style="font-size:16px;font-weight:700;color:${primary};margin-bottom:20px;">구매하기</h3>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <footer style="background:${text};color:#fff;padding:24px 60px;text-align:center;font-size:11px;opacity:0.7;">© 88km AI</footer>

</div></body></html>`;
}

// ============================================================
// E: 화장품 (럭셔리 뷰티)
// ============================================================

function renderCosmeticsLuxury(input: RenderInput): string {
  const { product, template, copy, images } = input;
  const tokens = (template.design_tokens ?? {}) as any;
  const colors = tokens.colors ?? {};
  const primary = colors.primary ?? "#c9a5a0";
  const accent = colors.accent ?? "#d4af7c";
  const bg = colors.background ?? "#faf4ee";
  const bgLight = colors.backgroundLight ?? "#ffffff";
  const text = colors.text ?? "#3d2828";

  const heroImg = findImage(images, "hero") || findUserImage(product, "main");
  const detail1 = findImage(images, "detail_1");
  const detailCloseImg = findImage(images, "detail_close");
  const ingredientImg = findImage(images, "ingredient");
  const processImg = findImage(images, "process_shot");
  const comparisonImg = findImage(images, "comparison");
  const lifestyleImg = findImage(images, "lifestyle");
  const signatureImg = findImage(images, "signature");

  const trustBadges = renderTrustBadges(product, {
    primary, bg, bgLight, text, serifClass: "serif",
  });
  const makerStory = renderMakerStory(copy, product, images, {
    primary, bg, bgLight, text, accent, serifClass: "serif",
  });

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${esc(product.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Nanum+Myeongjo:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Noto Sans KR',sans-serif;color:${text};background:${bg};line-height:1.8;font-weight:300;word-break:keep-all;overflow-wrap:break-word;}
  p,li,span,h1,h2,h3,h4,h5,h6,div{word-break:keep-all;overflow-wrap:break-word;}
  .page{width:860px;margin:0 auto;background:${bg};}
  .section{padding:80px 60px;}
  .serif{font-family:'Nanum Myeongjo',serif;}
  .divider{width:40px;height:1px;background:${accent};margin:20px auto;}
  img{max-width:100%;display:block;}
</style></head><body><div class="page">

  <section style="padding:100px 60px 60px;background:${bgLight};text-align:center;">
    ${copy.hero.badge ? `<p style="font-size:11px;letter-spacing:4px;color:${accent};text-transform:uppercase;margin-bottom:32px;">${esc(copy.hero.badge)}</p>` : ""}
    <h1 class="serif" style="font-size:56px;font-weight:400;color:${text};margin-bottom:16px;letter-spacing:-1px;font-style:italic;">${esc(copy.hero.title)}</h1>
    <div class="divider"></div>
    <p style="font-size:15px;color:#8a7373;font-weight:300;letter-spacing:1px;">${esc(copy.hero.subtitle)}</p>
  </section>

  ${heroImg ? `<img src="${heroImg}" alt="${esc(product.name)}" style="width:100%;">` : ""}

  <!-- GIF: after_hero -->
  ${renderGifsAt(product, "after_hero", { bg, text, accent, serifClass: "serif" })}

  <section class="section" style="background:${bg};text-align:center;">
    <h2 class="serif" style="font-size:32px;font-weight:400;color:${primary};margin-bottom:8px;font-style:italic;">${esc(copy.intro.heading)}</h2>
    <div class="divider"></div>
    <p style="font-size:15px;color:${text};max-width:560px;margin:24px auto 0;line-height:2.2;">${esc(ensureSentenceEnd(copy.intro.body))}</p>
  </section>

  <!-- GIF: after_intro -->
  ${renderGifsAt(product, "after_intro", { bg, text, accent, serifClass: "serif" })}

  ${detail1 ? `<img src="${detail1}" alt="detail" style="width:100%;">` : ""}

  <!-- GIF: after_detail -->
  ${renderGifsAt(product, "after_detail", { bg, text, accent, serifClass: "serif" })}

  ${copy.points.length ? `
  <section class="section" style="background:${bgLight};">
    <h2 class="serif" style="font-size:26px;font-weight:400;color:${primary};text-align:center;margin-bottom:8px;font-style:italic;">Signature Benefits</h2>
    <div class="divider"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;">
      ${copy.points.map(p => `
      <div style="text-align:center;padding:0 20px;">
        <div style="font-size:28px;color:${accent};margin-bottom:16px;">${esc(p.icon || "◈")}</div>
        <h3 class="serif" style="font-size:18px;font-weight:700;color:${text};margin-bottom:12px;font-style:italic;">${esc(p.title)}</h3>
        <p style="font-size:13px;color:#8a7373;line-height:2;">${esc(p.description)}</p>
      </div>
      `).join("")}
    </div>
  </section>
  ` : ""}

  <!-- GIF: after_points -->
  ${renderGifsAt(product, "after_points", { bg: bgLight, text, accent, serifClass: "serif" })}

  ${ingredientImg && product.ingredients?.length ? `
  <section class="section" style="background:${bg};">
    <h2 class="serif" style="font-size:28px;font-weight:400;color:${primary};text-align:center;margin-bottom:8px;font-style:italic;">${copy.ingredients_intro ? esc(copy.ingredients_intro.heading) : "Key Ingredients"}</h2>
    <div class="divider"></div>
    <img src="${ingredientImg}" alt="원료" style="width:100%;border-radius:4px;margin:32px 0;">
    ${copy.ingredients_intro ? `<p style="font-size:14px;color:${text};max-width:560px;margin:0 auto 32px;text-align:center;line-height:2.2;">${esc(ensureSentenceEnd(copy.ingredients_intro.body))}</p>` : ""}
    <div style="background:${bgLight};padding:32px;">
      ${product.ingredients.slice(0, 6).map(ing => `
      <div style="padding:16px 0;border-bottom:1px solid rgba(0,0,0,0.05);display:flex;justify-content:space-between;align-items:center;">
        <span class="serif" style="font-size:15px;font-weight:700;color:${primary};font-style:italic;">${esc(ing.name)}</span>
        <span style="font-size:12px;color:#8a7373;">${ing.note ? esc(ing.note) : ing.origin ? esc(ing.origin) : ""}</span>
      </div>
      `).join("")}
    </div>
  </section>
  ` : ""}

  <section class="section" style="background:${bgLight};">
    <h2 class="serif" style="font-size:22px;font-weight:400;color:${primary};text-align:center;margin-bottom:24px;font-style:italic;">${esc(copy.spec_summary.heading)}</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${copy.spec_summary.items.map(item => `
      <tr><td style="padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.05);font-size:13px;color:${primary};font-weight:500;width:35%;letter-spacing:1px;">${esc(item.label)}</td>
      <td style="padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.05);font-size:13px;color:${text};">${esc(item.value)}</td></tr>
      `).join("")}
    </table>
  </section>

  ${detailCloseImg ? `<img src="${detailCloseImg}" alt="close-up" style="width:100%;">` : ""}

  ${trustBadges}

  ${makerStory}

  ${comparisonImg ? `<img src="${comparisonImg}" alt="comparison" style="width:100%;">` : ""}

  ${lifestyleImg ? `<img src="${lifestyleImg}" alt="lifestyle" style="width:100%;">` : ""}

  <!-- GIF: after_lifestyle -->
  ${renderGifsAt(product, "after_lifestyle", { bg, text, accent, serifClass: "serif" })}

  <!-- GIF: before_signature -->
  ${renderGifsAt(product, "before_signature", { bg: bgLight, text, accent, serifClass: "serif" })}

  <section class="section" style="background:${accent};color:${bgLight};text-align:center;">
    <h2 class="serif" style="font-size:34px;font-weight:400;margin-bottom:16px;font-style:italic;">${esc(copy.signature.heading)}</h2>
    <div style="width:40px;height:1px;background:#fff;opacity:0.5;margin:16px auto;"></div>
    <p style="font-size:14px;opacity:0.95;max-width:520px;margin:0 auto;line-height:2.2;font-weight:300;">${esc(ensureSentenceEnd(copy.signature.body))}</p>
  </section>

  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bg};text-align:center;">
    <p style="font-size:11px;letter-spacing:4px;color:${primary};text-transform:uppercase;margin-bottom:20px;">Available</p>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <footer style="background:${text};color:#fff;padding:24px 60px;text-align:center;font-size:11px;opacity:0.7;">© 88km AI</footer>

</div></body></html>`;
}
