// ============================================================
// 상세페이지 HTML 렌더러 (860px 고정폭 이커머스 표준)
// 5개 템플릿 지원: kimchi-ogami, household-modern, electronics-tech, health-natural, cosmetics-luxury
// ============================================================

import type { GeneratedCopy } from "./copy-generator";
import type { GeneratedImageResult } from "./image-generator";
import type { Product, Template, SaleChannel } from "@/lib/types";
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

function findImage(images: GeneratedImageResult[], role: string): string {
  return images.find((i) => i.role === role)?.url ?? "";
}

function findUserImage(product: Product, role: string): string {
  const imgs = (product.images ?? []) as any[];
  return imgs.find((i) => i.role === role)?.url ?? "";
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
  const ingredientImg = findImage(images, "ingredient");
  const lifestyleImg = findImage(images, "lifestyle");
  const signatureImg = findImage(images, "signature");

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
  body { font-family: 'Noto Sans KR', sans-serif; color: ${text}; background: ${bg}; line-height: 1.7; }
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

  <!-- 2. Intro -->
  <section class="section" style="background:${bgLight};text-align:center;">
    <h2 class="serif" style="font-size:32px;font-weight:700;color:${primary};margin-bottom:12px;">${esc(copy.intro.heading)}</h2>
    <div class="divider"></div>
    <p style="font-size:16px;color:${text};max-width:640px;margin:0 auto;line-height:2;">${esc(copy.intro.body)}</p>
  </section>

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

  <!-- 5. Detail Images -->
  ${detail1 ? `
  <section style="background:${bg};padding:0;">
    <img src="${detail1}" alt="상세컷 1" style="width:100%;">
  </section>
  ` : ""}

  <!-- 6. Ingredients -->
  ${copy.ingredients_intro && product.ingredients?.length ? `
  <section class="section" style="background:${bgLight};">
    <h2 class="serif" style="font-size:32px;font-weight:700;color:${primary};text-align:center;margin-bottom:12px;">${esc(copy.ingredients_intro.heading)}</h2>
    <div class="divider"></div>
    <p style="font-size:16px;color:${text};max-width:640px;margin:0 auto 40px;line-height:2;text-align:center;">${esc(copy.ingredients_intro.body)}</p>
    ${ingredientImg ? `<img src="${ingredientImg}" alt="원재료" style="width:100%;border-radius:8px;margin-bottom:32px;">` : ""}
    <div style="background:#fff;border-radius:12px;padding:32px;">
      <h3 style="font-size:18px;font-weight:700;color:${primary};margin-bottom:20px;text-align:center;letter-spacing:2px;">주요 원재료</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        ${product.ingredients.map(ing => `
        <div style="padding:16px;background:${bgLight};border-radius:8px;border-left:3px solid ${primary};">
          <div style="font-size:16px;font-weight:700;color:${text};margin-bottom:4px;">${esc(ing.name)}${ing.percentage ? ` <span style="font-size:12px;color:${primary};">${ing.percentage}%</span>` : ""}</div>
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

  <!-- 8. Process -->
  ${copy.process ? `
  <section class="section" style="background:${bg};">
    <h2 class="serif" style="font-size:32px;font-weight:700;color:${primary};text-align:center;margin-bottom:12px;">${esc(copy.process.heading)}</h2>
    <div class="divider"></div>
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

  <!-- 9. Lifestyle -->
  ${lifestyleImg ? `
  <section style="background:${bg};padding:0;">
    <img src="${lifestyleImg}" alt="라이프스타일" style="width:100%;">
  </section>
  ` : ""}

  <!-- 10. Signature -->
  <section class="section" style="background:${bgLight};text-align:center;">
    <h2 class="serif" style="font-size:36px;font-weight:800;color:${primary};margin-bottom:20px;line-height:1.4;">${esc(copy.signature.heading)}</h2>
    <div class="divider"></div>
    <p style="font-size:16px;color:${text};max-width:600px;margin:0 auto 32px;line-height:2;">${esc(copy.signature.body)}</p>
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
    <p style="font-size:15px;opacity:0.9;line-height:2;max-width:560px;margin:0 auto;">${esc(copy.shipping_summary.body)}</p>
  </section>

  <!-- Footer -->
  <footer style="background:${text};color:#fff;padding:32px 60px;text-align:center;">
    <p style="font-size:12px;opacity:0.6;margin:0;">본 상세페이지는 SangSePage AI로 제작되었습니다.</p>
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
  const lifestyleImg = findImage(images, "lifestyle");

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${esc(product.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Noto+Sans+KR:wght@300;400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Noto Sans KR', sans-serif; color: ${text}; background: ${bgLight}; line-height: 1.7; }
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

  <section class="section" style="background:${bg};text-align:center;">
    <h2 style="font-size:28px;font-weight:400;color:${text};margin-bottom:32px;">${esc(copy.intro.heading)}</h2>
    <p style="font-size:16px;color:#555;max-width:560px;margin:0 auto;line-height:2;font-weight:300;">${esc(copy.intro.body)}</p>
  </section>

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

  ${detail1 ? `<img src="${detail1}" alt="상세" style="width:100%;">` : ""}

  <section class="section" style="background:${bg};">
    <h2 style="font-size:24px;font-weight:400;color:${text};margin-bottom:32px;text-align:center;">${esc(copy.spec_summary.heading)}</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${copy.spec_summary.items.map(item => `
      <tr><td style="padding:16px 0;border-bottom:1px solid #ddd;font-size:14px;color:${text};font-weight:500;width:30%;">${esc(item.label)}</td>
      <td style="padding:16px 0;border-bottom:1px solid #ddd;font-size:14px;color:#666;">${esc(item.value)}</td></tr>
      `).join("")}
    </table>
  </section>

  ${lifestyleImg ? `<img src="${lifestyleImg}" alt="lifestyle" style="width:100%;">` : ""}

  <section class="section" style="background:${primary};color:#fff;text-align:center;">
    <h2 style="font-size:32px;font-weight:300;margin-bottom:20px;">${esc(copy.signature.heading)}</h2>
    <p style="font-size:15px;opacity:0.8;max-width:520px;margin:0 auto;line-height:2;font-weight:300;">${esc(copy.signature.body)}</p>
  </section>

  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bgLight};text-align:center;">
    <h3 style="font-size:16px;font-weight:500;margin-bottom:20px;">구매 채널</h3>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <footer style="background:${text};color:#fff;padding:24px 80px;text-align:center;font-size:11px;opacity:0.6;">© SangSePage AI</footer>

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
  const lifestyleImg = findImage(images, "lifestyle");

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${esc(product.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter','Noto Sans KR',sans-serif;color:#fff;background:${bg};line-height:1.7;}
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

  <section class="section" style="background:${bgLight};text-align:center;">
    <h2 style="font-size:36px;font-weight:700;color:${primary};margin-bottom:24px;">${esc(copy.intro.heading)}</h2>
    <p style="font-size:16px;color:#a3a3a3;max-width:640px;margin:0 auto;line-height:2;">${esc(copy.intro.body)}</p>
  </section>

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

  ${detail2 ? `<img src="${detail2}" alt="detail 2" style="width:100%;">` : ""}
  ${lifestyleImg ? `<img src="${lifestyleImg}" alt="lifestyle" style="width:100%;">` : ""}

  <section class="section" style="background:${primary};color:${bg};text-align:center;">
    <h2 style="font-size:40px;font-weight:900;margin-bottom:20px;letter-spacing:-1px;">${esc(copy.signature.heading)}</h2>
    <p style="font-size:15px;max-width:560px;margin:0 auto;line-height:2;font-weight:500;">${esc(copy.signature.body)}</p>
  </section>

  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bg};text-align:center;">
    <h3 style="font-size:14px;font-weight:500;color:${primary};letter-spacing:2px;margin-bottom:20px;">AVAILABLE ON</h3>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <footer style="background:#000;color:#666;padding:24px 60px;text-align:center;font-size:11px;">© SangSePage AI</footer>

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
  const lifestyleImg = findImage(images, "lifestyle");
  const signatureImg = findImage(images, "signature");

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${esc(product.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Nanum+Myeongjo:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Noto Sans KR',sans-serif;color:${text};background:${bg};line-height:1.7;}
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

  <section class="section" style="background:${bg};text-align:center;">
    <h2 class="serif" style="font-size:30px;font-weight:700;color:${primary};margin-bottom:24px;">${esc(copy.intro.heading)}</h2>
    <p style="font-size:16px;color:${text};max-width:600px;margin:0 auto;line-height:2;">${esc(copy.intro.body)}</p>
  </section>

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

  ${ingredientImg && product.ingredients?.length ? `
  <section class="section" style="background:${bg};">
    <h2 class="serif" style="font-size:28px;font-weight:700;color:${primary};text-align:center;margin-bottom:24px;">${copy.ingredients_intro ? esc(copy.ingredients_intro.heading) : "원재료"}</h2>
    <img src="${ingredientImg}" alt="원재료" style="width:100%;border-radius:12px;margin-bottom:24px;">
    ${copy.ingredients_intro ? `<p style="font-size:15px;color:${text};max-width:600px;margin:0 auto 32px;line-height:2;text-align:center;">${esc(copy.ingredients_intro.body)}</p>` : ""}
    <div style="background:${bgLight};border-radius:12px;padding:28px;">
      ${product.ingredients.map(ing => `
      <div style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.05);">
        <span style="font-weight:700;color:${primary};">${esc(ing.name)}</span>
        ${ing.percentage ? ` <span style="font-size:13px;color:#888;">${ing.percentage}%</span>` : ""}
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

  ${lifestyleImg ? `<img src="${lifestyleImg}" alt="lifestyle" style="width:100%;">` : ""}

  <section class="section" style="background:${primary};color:#fff;text-align:center;">
    <h2 class="serif" style="font-size:32px;font-weight:700;margin-bottom:20px;">${esc(copy.signature.heading)}</h2>
    <p style="font-size:15px;opacity:0.95;max-width:540px;margin:0 auto;line-height:2;">${esc(copy.signature.body)}</p>
  </section>

  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bg};text-align:center;">
    <h3 style="font-size:16px;font-weight:700;color:${primary};margin-bottom:20px;">구매하기</h3>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <footer style="background:${text};color:#fff;padding:24px 60px;text-align:center;font-size:11px;opacity:0.7;">© SangSePage AI</footer>

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
  const ingredientImg = findImage(images, "ingredient");
  const lifestyleImg = findImage(images, "lifestyle");
  const signatureImg = findImage(images, "signature");

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>${esc(product.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Nanum+Myeongjo:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Noto Sans KR',sans-serif;color:${text};background:${bg};line-height:1.8;font-weight:300;}
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

  <section class="section" style="background:${bg};text-align:center;">
    <h2 class="serif" style="font-size:32px;font-weight:400;color:${primary};margin-bottom:8px;font-style:italic;">${esc(copy.intro.heading)}</h2>
    <div class="divider"></div>
    <p style="font-size:15px;color:${text};max-width:560px;margin:24px auto 0;line-height:2.2;">${esc(copy.intro.body)}</p>
  </section>

  ${detail1 ? `<img src="${detail1}" alt="detail" style="width:100%;">` : ""}

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

  ${ingredientImg && product.ingredients?.length ? `
  <section class="section" style="background:${bg};">
    <h2 class="serif" style="font-size:28px;font-weight:400;color:${primary};text-align:center;margin-bottom:8px;font-style:italic;">${copy.ingredients_intro ? esc(copy.ingredients_intro.heading) : "Key Ingredients"}</h2>
    <div class="divider"></div>
    <img src="${ingredientImg}" alt="원료" style="width:100%;border-radius:4px;margin:32px 0;">
    ${copy.ingredients_intro ? `<p style="font-size:14px;color:${text};max-width:560px;margin:0 auto 32px;text-align:center;line-height:2.2;">${esc(copy.ingredients_intro.body)}</p>` : ""}
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

  ${lifestyleImg ? `<img src="${lifestyleImg}" alt="lifestyle" style="width:100%;">` : ""}

  <section class="section" style="background:${accent};color:${bgLight};text-align:center;">
    <h2 class="serif" style="font-size:34px;font-weight:400;margin-bottom:16px;font-style:italic;">${esc(copy.signature.heading)}</h2>
    <div style="width:40px;height:1px;background:#fff;opacity:0.5;margin:16px auto;"></div>
    <p style="font-size:14px;opacity:0.95;max-width:520px;margin:0 auto;line-height:2.2;font-weight:300;">${esc(copy.signature.body)}</p>
  </section>

  ${product.sale_channels?.length ? `
  <section class="section" style="background:${bg};text-align:center;">
    <p style="font-size:11px;letter-spacing:4px;color:${primary};text-transform:uppercase;margin-bottom:20px;">Available</p>
    <div>${renderChannelBadges(product.sale_channels)}</div>
  </section>
  ` : ""}

  <footer style="background:${text};color:#fff;padding:24px 60px;text-align:center;font-size:11px;opacity:0.7;">© SangSePage AI</footer>

</div></body></html>`;
}
