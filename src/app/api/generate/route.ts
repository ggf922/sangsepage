// ============================================================
// AI 상세페이지 생성 오케스트레이터
// POST /api/generate
// ============================================================
//
// Flow:
//   1. Auth check
//   2. Load product + template
//   3. Deduct 30P
//   4. Insert generating page row (status: generating)
//   5. generateCopy (GPT-4o mini)
//   6. generateAllImages (Gemini Nano Banana)
//   7. renderHTML (5 templates)
//   8. Update generated_pages (status: completed)
//   9. If any step fails after step 3: refundPoints + status: failed
//  10. Return page_id
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { deductPoints, refundPoints, incrementGenerated } from "@/lib/points";
import { generateCopy } from "@/lib/ai/copy-generator";
import { generateAllImages } from "@/lib/ai/image-generator";
import { renderHTML } from "@/lib/ai/html-renderer";
import { generateShortId } from "@/lib/utils";
import { POINT_COSTS, MAX_EDITS_DEFAULT } from "@/lib/types";
import type { Product, Template, Language } from "@/lib/types";

// 이 라우트는 Gemini 이미지 6장 + OpenAI 카피 생성으로
// 30초 ~ 90초까지 걸릴 수 있어 Vercel serverless timeout 확장 필요
export const maxDuration = 300; // 5분
export const dynamic = "force-dynamic";

interface GenerateRequestBody {
  product_id: string;
  template_id: string;
  language?: Language;
  use_pro_model?: boolean; // Nano Banana Pro 사용 여부
  premium_mode?: boolean; // 사용자가 '고급 모드(+15P)' 체크박스 선택
  source_page_id?: string; // 재생성 시 원본 페이지 ID (자동 Self-Critique ON)
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // ---------- 1. 요청 파싱 ----------
  let body: GenerateRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const {
    product_id,
    template_id,
    language = "ko",
    use_pro_model = false,
    premium_mode = false,
    source_page_id,
  } = body;

  if (!product_id || !template_id) {
    return NextResponse.json(
      { error: "product_id, template_id는 필수입니다." },
      { status: 400 }
    );
  }

  // ---------- 2. 인증 체크 ----------
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const admin = createAdminClient();

  // ---------- 2-B. 회원 프로필 로드 (tier 확인) ----------
  const { data: profileRow } = await admin
    .from("users")
    .select("tier, points")
    .eq("id", user.id)
    .single();

  const userTier: "free" | "pro" = profileRow?.tier === "pro" ? "pro" : "free";
  const isProUser = userTier === "pro";

  // ---------- 2-C. 재생성 여부 확인 ----------
  // source_page_id가 있으면 재생성 요청 → 원본이 본인 페이지인지 검증
  let regenerationCount = 0;
  let isRegeneration = false;

  if (source_page_id) {
    const { data: sourcePage } = await admin
      .from("generated_pages")
      .select("id, user_id, regeneration_count")
      .eq("id", source_page_id)
      .single();

    if (!sourcePage || sourcePage.user_id !== user.id) {
      return NextResponse.json(
        { error: "재생성 원본 페이지에 접근할 수 없습니다." },
        { status: 403 }
      );
    }
    isRegeneration = true;
    regenerationCount = (sourcePage.regeneration_count ?? 0) + 1;
  }

  // ---------- 2-D. Self-Critique 자동 적용 규칙 (3가지) ----------
  // ① Pro 회원 → 항상 ON
  // ② 사용자 명시적 선택 (고급 모드 체크박스) → ON
  // ③ 재생성 → ON
  const selfCritiqueEnabled = isProUser || premium_mode || isRegeneration;

  // ---------- 3. 상품 로드 (본인 소유 확인) ----------
  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", product_id)
    .eq("user_id", user.id)
    .single();

  if (productError || !productRow) {
    return NextResponse.json(
      { error: "상품을 찾을 수 없거나 접근 권한이 없습니다." },
      { status: 404 }
    );
  }

  const product = productRow as Product;

  // 상품 기본 검증
  if (!product.name?.trim()) {
    return NextResponse.json(
      { error: "상품명이 없습니다. 상품 정보를 먼저 완성해주세요." },
      { status: 400 }
    );
  }

  // ---------- 4. 템플릿 로드 ----------
  const { data: templateRow, error: templateError } = await supabase
    .from("templates")
    .select("*")
    .eq("id", template_id)
    .eq("is_active", true)
    .single();

  if (templateError || !templateRow) {
    return NextResponse.json(
      { error: "템플릿을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const template = templateRow as Template;

  // ---------- 5. 포인트 차감 ----------
  // 기본 30P, 고급 모드(+15P), 단 Pro 회원과 재생성은 추가 요금 없음
  let cost = POINT_COSTS.CREATE_PAGE;
  const premiumSurchargeApplied = premium_mode && !isProUser && !isRegeneration;
  if (premiumSurchargeApplied) {
    cost += POINT_COSTS.PREMIUM_MODE_SURCHARGE;
  }

  const modeLabels: string[] = [];
  if (isProUser) modeLabels.push("Pro혜택");
  else if (premium_mode) modeLabels.push("고급모드+15P");
  if (isRegeneration) modeLabels.push(`재생성#${regenerationCount}`);
  if (selfCritiqueEnabled) modeLabels.push("SelfCritique");

  const modeSuffix = modeLabels.length > 0 ? ` [${modeLabels.join(",")}]` : "";

  const deductResult = await deductPoints({
    user_id: user.id,
    amount: cost,
    description: `상세페이지 생성 - ${product.name} (${template.name})${modeSuffix}`,
    metadata: {
      product_id,
      template_id,
      language,
      template_code: template.code,
      user_tier: userTier,
      premium_mode,
      self_critique: selfCritiqueEnabled,
      is_regeneration: isRegeneration,
      regeneration_count: regenerationCount,
      source_page_id: source_page_id ?? null,
    },
  });

  if (!deductResult.success) {
    return NextResponse.json({ error: deductResult.error }, { status: 402 });
  }

  // ---------- 6. generated_pages 행 생성 (generating 상태) ----------
  const share_id = generateShortId(10);

  const { data: pageRow, error: insertError } = await admin
    .from("generated_pages")
    .insert({
      user_id: user.id,
      product_id,
      template_id,
      language,
      share_id,
      status: "generating",
      points_used: cost,
      max_edits: MAX_EDITS_DEFAULT,
      edit_count: 0,
      // === Self-Critique / 재생성 추적 ===
      regeneration_count: regenerationCount,
      source_page_id: source_page_id ?? null,
      self_critique_used: selfCritiqueEnabled,
      premium_requested: premium_mode,
    })
    .select()
    .single();

  if (insertError || !pageRow) {
    // 페이지 생성 실패 → 포인트 환불
    await refundPoints({
      user_id: user.id,
      amount: cost,
      description: `[환불] 페이지 생성 초기화 실패 - ${insertError?.message ?? "알 수 없는 오류"}`,
      metadata: { product_id, template_id },
    });
    return NextResponse.json(
      { error: `페이지 생성 실패: ${insertError?.message}` },
      { status: 500 }
    );
  }

  const page_id = pageRow.id as string;

  // ---------- 7. AI 파이프라인 ----------
  try {
    console.log(`[generate] Starting AI pipeline for page ${page_id}`);

    // 7-1. 카피 생성 (GPT-4o) — Self-Critique 여부 명시적 전달
    const copyStart = Date.now();
    console.log(
      `[generate] Calling generateCopy... (tier=${userTier}, premium=${premium_mode}, ` +
      `regen=${isRegeneration}, selfCritique=${selfCritiqueEnabled})`
    );
    const copy = await generateCopy(product, template, language, {
      selfCritique: selfCritiqueEnabled,
    });
    console.log(`[generate] Copy generated in ${Date.now() - copyStart}ms`);

    // 7-2. 이미지 생성 (Gemini Nano Banana × 6장)
    const imgStart = Date.now();
    console.log(`[generate] Calling generateAllImages (pro=${use_pro_model})...`);
    const images = await generateAllImages(
      product,
      template,
      user.id,
      page_id,
      use_pro_model
    );
    console.log(
      `[generate] ${images.length} images generated in ${Date.now() - imgStart}ms`
    );

    // 7-3. HTML 렌더링
    const renderStart = Date.now();
    const html_content = renderHTML({
      product,
      template,
      copy,
      images,
    });
    console.log(`[generate] HTML rendered in ${Date.now() - renderStart}ms (${html_content.length} chars)`);

    // ---------- 8. DB 업데이트 (완료) ----------
    const { error: updateError } = await admin
      .from("generated_pages")
      .update({
        status: "completed",
        html_content,
        generated_copy: copy as any,
        generated_images: images as any,
        error_message: null,
      })
      .eq("id", page_id);

    if (updateError) {
      throw new Error(`페이지 저장 실패: ${updateError.message}`);
    }

    // 카운터 증가 (실패해도 진행)
    await incrementGenerated(user.id);

    const totalTime = Date.now() - startTime;
    console.log(`[generate] ✅ Complete in ${totalTime}ms - page_id: ${page_id}`);

    return NextResponse.json({
      success: true,
      page_id,
      share_id,
      status: "completed",
      duration_ms: totalTime,
      image_count: images.length,
      balance_after: deductResult.balance_after,
      points_used: cost,
      self_critique_used: selfCritiqueEnabled,
      user_tier: userTier,
      is_regeneration: isRegeneration,
    });
  } catch (err: any) {
    const errorMessage = err?.message ?? String(err);
    console.error("[generate] ❌ AI pipeline failed:", errorMessage);
    console.error("[generate] Error stack:", err?.stack);

    // 실패 상태로 업데이트 (실패해도 환불은 진행)
    try {
      await admin
        .from("generated_pages")
        .update({
          status: "failed",
          error_message: errorMessage.slice(0, 500),
        })
        .eq("id", page_id);
    } catch (updateErr: any) {
      console.error("[generate] ⚠️ failed to update page status:", updateErr?.message);
    }

    // ---------- 포인트 환불 (최대 3회 재시도) ----------
    // 환불이 반드시 성공하도록 재시도 로직 추가
    let refundResult: { success: boolean; balance_after?: number; error?: string } = {
      success: false,
      error: "환불 시도 안 됨",
    };
    let refundAttempts = 0;
    const MAX_REFUND_ATTEMPTS = 3;

    while (refundAttempts < MAX_REFUND_ATTEMPTS) {
      refundAttempts++;
      try {
        console.log(
          `[generate] 💰 환불 시도 ${refundAttempts}/${MAX_REFUND_ATTEMPTS} — user=${user.id}, amount=${cost}P`
        );
        const attemptResult = await refundPoints({
          user_id: user.id,
          amount: cost,
          description: `[환불] 상세페이지 생성 실패 - ${product.name}${
            refundAttempts > 1 ? ` (재시도 #${refundAttempts})` : ""
          }`,
          reference_id: page_id,
          metadata: {
            product_id,
            template_id,
            error: errorMessage.slice(0, 200),
            refund_attempt: refundAttempts,
          },
        });

        if (attemptResult.success) {
          refundResult = {
            success: true,
            balance_after: attemptResult.balance_after,
          };
          console.log(
            `[generate] ✅ 환불 성공 (attempt ${refundAttempts}) — new balance: ${attemptResult.balance_after}P`
          );
          break;
        } else {
          console.error(
            `[generate] ❌ 환불 실패 (attempt ${refundAttempts}): ${attemptResult.error}`
          );
          refundResult = { success: false, error: attemptResult.error };
        }
      } catch (refundErr: any) {
        console.error(
          `[generate] ❌ 환불 예외 (attempt ${refundAttempts}):`,
          refundErr?.message,
          refundErr?.stack
        );
        refundResult = {
          success: false,
          error: refundErr?.message ?? "환불 중 예외 발생",
        };
      }

      // 마지막 시도가 아니면 1초 대기 후 재시도
      if (refundAttempts < MAX_REFUND_ATTEMPTS && !refundResult.success) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // 환불이 완전히 실패한 경우 — 관리자 알림용 로그 (Vercel logs에서 확인)
    if (!refundResult.success) {
      console.error(
        `[generate] 🚨🚨🚨 환불 완전 실패! 수동 처리 필요 — user=${user.id}, amount=${cost}P, page_id=${page_id}, reason=${refundResult.error}`
      );
      // 관리자 감시를 위한 별도 테이블 기록 시도 (있으면 사용, 없으면 무시)
      try {
        await admin.from("point_transactions").insert({
          user_id: user.id,
          type: "refund_failed" as any,
          amount: cost,
          balance_after: -1, // 실패 표시
          description: `[환불실패-수동처리필요] ${product.name}`,
          reference_id: page_id,
          metadata: {
            product_id,
            error: errorMessage.slice(0, 200),
            refund_error: refundResult.error,
            manual_refund_required: true,
          },
        });
      } catch {
        // 로깅 실패는 무시 (이미 콘솔에 남았음)
      }
    }

    return NextResponse.json(
      {
        error: `생성 실패: ${errorMessage}`,
        page_id,
        refunded: refundResult.success,
        balance_after: refundResult.success ? refundResult.balance_after : null,
        refund_error: refundResult.success ? undefined : refundResult.error,
      },
      { status: 500 }
    );
  }
}
