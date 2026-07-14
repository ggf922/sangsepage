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

  const { product_id, template_id, language = "ko", use_pro_model = false } = body;

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
  const cost = POINT_COSTS.CREATE_PAGE;

  const deductResult = await deductPoints({
    user_id: user.id,
    amount: cost,
    description: `상세페이지 생성 - ${product.name} (${template.name})`,
    metadata: {
      product_id,
      template_id,
      language,
      template_code: template.code,
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

    // 7-1. 카피 생성 (GPT-4o mini)
    const copyStart = Date.now();
    console.log(`[generate] Calling generateCopy...`);
    const copy = await generateCopy(product, template, language);
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
    });
  } catch (err: any) {
    const errorMessage = err?.message ?? String(err);
    console.error("[generate] ❌ AI pipeline failed:", errorMessage);

    // 실패 상태로 업데이트
    await admin
      .from("generated_pages")
      .update({
        status: "failed",
        error_message: errorMessage.slice(0, 500),
      })
      .eq("id", page_id);

    // 포인트 환불
    const refundResult = await refundPoints({
      user_id: user.id,
      amount: cost,
      description: `[환불] 상세페이지 생성 실패 - ${product.name}`,
      reference_id: page_id,
      metadata: {
        product_id,
        template_id,
        error: errorMessage.slice(0, 200),
      },
    });

    return NextResponse.json(
      {
        error: `생성 실패: ${errorMessage}`,
        page_id,
        refunded: refundResult.success,
        balance_after: refundResult.success ? refundResult.balance_after : null,
      },
      { status: 500 }
    );
  }
}
