// ============================================================
// POST /api/pages/[id]/edit
// 상세페이지 부분 재생성 (카피 / 이미지 / 전체)
// ============================================================
//
// Flow:
//   1. Auth check + 본인 소유 확인
//   2. edit_count < max_edits 확인
//   3. 포인트 차감 (5P for copy_only, 10P for images/all)
//   4. 기존 페이지 로드 (product, template, 기존 copy/images)
//   5. mode 별 재생성:
//      - copy_only: copy만 재생성, images 유지
//      - images_only: images만 재생성, copy 유지
//      - all: 둘 다 재생성
//   6. HTML 재렌더링
//   7. UPDATE generated_pages (edit_count++)
//   8. 실패 시 포인트 환불
//
// Body:
//   { mode: "copy_only" | "images_only" | "all", instructions?: string }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { deductPoints, refundPoints } from "@/lib/points";
import { generateCopy } from "@/lib/ai/copy-generator";
import { generateAllImages } from "@/lib/ai/image-generator";
import { renderHTML } from "@/lib/ai/html-renderer";
import type { Product, Template, Language } from "@/lib/types";
import type { GeneratedCopy } from "@/lib/ai/copy-generator";
import type { GeneratedImageResult } from "@/lib/ai/image-generator";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

type EditMode = "copy_only" | "images_only" | "all";

const EDIT_COSTS: Record<EditMode, number> = {
  copy_only: 5,
  images_only: 10,
  all: 10,
};

interface EditRequestBody {
  mode: EditMode;
  instructions?: string; // 재생성 시 추가 지시사항 (미래 확장용)
  use_pro_model?: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: page_id } = await params;
  const startTime = Date.now();

  // ---------- 1. 요청 파싱 ----------
  let body: EditRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { mode, use_pro_model = false } = body;

  if (!mode || !["copy_only", "images_only", "all"].includes(mode)) {
    return NextResponse.json(
      { error: "mode는 copy_only, images_only, all 중 하나여야 합니다." },
      { status: 400 }
    );
  }

  // ---------- 2. 인증 ----------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const admin = createAdminClient();

  // ---------- 3. 페이지 로드 + 검증 ----------
  const { data: pageRow, error: pageError } = await supabase
    .from("generated_pages")
    .select(
      `
      *,
      product:products(*),
      template:templates(*)
    `
    )
    .eq("id", page_id)
    .eq("user_id", user.id)
    .single();

  if (pageError || !pageRow) {
    return NextResponse.json(
      { error: "페이지를 찾을 수 없거나 접근 권한이 없습니다." },
      { status: 404 }
    );
  }

  if (pageRow.status !== "completed") {
    return NextResponse.json(
      { error: "완료된 페이지만 수정할 수 있습니다." },
      { status: 400 }
    );
  }

  const editCount = pageRow.edit_count ?? 0;
  const maxEdits = pageRow.max_edits ?? 3;

  if (editCount >= maxEdits) {
    return NextResponse.json(
      { error: `수정 횟수를 모두 사용하셨습니다. (${editCount}/${maxEdits})` },
      { status: 403 }
    );
  }

  const product = pageRow.product as Product | null;
  const template = pageRow.template as Template | null;

  if (!product || !template) {
    return NextResponse.json(
      { error: "원본 상품 또는 템플릿을 찾을 수 없습니다." },
      { status: 400 }
    );
  }

  const language = (pageRow.language ?? "ko") as Language;
  const cost = EDIT_COSTS[mode];

  // ---------- 4. 포인트 차감 ----------
  const modeLabel =
    mode === "copy_only"
      ? "카피 재생성"
      : mode === "images_only"
        ? "이미지 재생성"
        : "전체 재생성";

  const deductResult = await deductPoints({
    user_id: user.id,
    amount: cost,
    description: `상세페이지 ${modeLabel} - ${product.name} (${editCount + 1}/${maxEdits}회차)`,
    reference_id: page_id,
    metadata: {
      page_id,
      mode,
      edit_count: editCount + 1,
    },
  });

  if (!deductResult.success) {
    return NextResponse.json({ error: deductResult.error }, { status: 402 });
  }

  // ---------- 5. 재생성 ----------
  try {
    console.log(`[edit] Starting ${mode} for page ${page_id}`);

    // 기존 데이터
    const oldCopy = pageRow.generated_copy as GeneratedCopy;
    const oldImages = (pageRow.generated_images ?? []) as GeneratedImageResult[];

    let newCopy: GeneratedCopy = oldCopy;
    let newImages: GeneratedImageResult[] = oldImages;

    // 5-1. 카피 재생성 (copy_only, all)
    if (mode === "copy_only" || mode === "all") {
      const copyStart = Date.now();
      console.log(`[edit] Regenerating copy...`);
      newCopy = await generateCopy(product, template, language);
      console.log(`[edit] Copy regenerated in ${Date.now() - copyStart}ms`);
    }

    // 5-2. 이미지 재생성 (images_only, all)
    if (mode === "images_only" || mode === "all") {
      const imgStart = Date.now();
      console.log(`[edit] Regenerating images (pro=${use_pro_model})...`);
      newImages = await generateAllImages(
        product,
        template,
        user.id,
        page_id,
        use_pro_model
      );
      console.log(
        `[edit] ${newImages.length} images regenerated in ${Date.now() - imgStart}ms`
      );
    }

    // 5-3. HTML 재렌더링
    const html_content = renderHTML({
      product,
      template,
      copy: newCopy,
      images: newImages,
    });

    // ---------- 6. DB 업데이트 ----------
    const { error: updateError } = await admin
      .from("generated_pages")
      .update({
        html_content,
        generated_copy: newCopy as any,
        generated_images: newImages as any,
        edit_count: editCount + 1,
        error_message: null,
      })
      .eq("id", page_id);

    if (updateError) {
      throw new Error(`페이지 저장 실패: ${updateError.message}`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`[edit] ✅ Complete in ${totalTime}ms - page_id: ${page_id}`);

    return NextResponse.json({
      success: true,
      page_id,
      mode,
      edit_count: editCount + 1,
      max_edits: maxEdits,
      remaining: maxEdits - (editCount + 1),
      duration_ms: totalTime,
      balance_after: deductResult.balance_after,
    });
  } catch (err: any) {
    const errorMessage = err?.message ?? String(err);
    console.error("[edit] ❌ pipeline failed:", errorMessage);

    // 포인트 환불
    const refundResult = await refundPoints({
      user_id: user.id,
      amount: cost,
      description: `[환불] ${modeLabel} 실패 - ${product.name}`,
      reference_id: page_id,
      metadata: { page_id, mode, error: errorMessage.slice(0, 200) },
    });

    return NextResponse.json(
      {
        error: `재생성 실패: ${errorMessage}`,
        refunded: refundResult.success,
        balance_after: refundResult.success ? refundResult.balance_after : null,
      },
      { status: 500 }
    );
  }
}
