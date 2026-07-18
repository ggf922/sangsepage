// ============================================================
// POST /api/pages/[id]/edit
// 상세페이지 부분 재생성 (카피 / 이미지 / 전체)
// ============================================================
//
// Flow:
//   1. Auth check + 본인 소유 확인
//   2. 포인트 차감 (5P for copy_only, 10P for images/all, 3P+ for partial)
//      * 횟수 제한 없음 - 포인트만 있으면 무제한 수정 가능
//   3. 기존 페이지 로드 (product, template, 기존 copy/images)
//   4. mode 별 재생성 (사용자 instructions 반영):
//      - copy_only: copy만 재생성, images 유지
//      - images_only: images만 재생성, copy 유지
//      - all: 둘 다 재생성
//      - partial: 선택 섹션만 재생성
//   5. HTML 재렌더링
//   6. UPDATE generated_pages (edit_count++ - 통계용)
//   7. 실패 시 포인트 환불
//
// Body:
//   { mode, instructions?: string, copy_sections?, image_sections?, use_pro_model? }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { deductPoints, refundPoints } from "@/lib/points";
import { generateCopy } from "@/lib/ai/copy-generator";
import { generateAllImages, generateSelectedImages, type ImageRole } from "@/lib/ai/image-generator";
import { renderHTML } from "@/lib/ai/html-renderer";
import type { Product, Template, Language } from "@/lib/types";
import type { GeneratedCopy } from "@/lib/ai/copy-generator";
import type { GeneratedImageResult } from "@/lib/ai/image-generator";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

type EditMode = "copy_only" | "images_only" | "all" | "partial";

// 부분 수정에서 사용하는 카피 섹션 그룹
export type CopySection =
  | "hero"           // hero + intro
  | "points"        // points
  | "ingredients"   // ingredients_intro + process
  | "maker"         // maker_story + signature
  | "info";         // spec_summary + shipping_summary

// 부분 수정에서 사용하는 이미지 그룹
export type ImageSection =
  | "hero_img"      // hero
  | "detail_img"    // detail_1, detail_2, detail_close
  | "extra_img";    // ingredient, process_shot, comparison, lifestyle, signature

const IMAGE_SECTION_ROLES: Record<ImageSection, ImageRole[]> = {
  hero_img: ["hero"],
  detail_img: ["detail_1", "detail_2", "detail_close"],
  extra_img: ["ingredient", "process_shot", "comparison", "lifestyle", "signature"],
};

const EDIT_COSTS: Record<Exclude<EditMode, "partial">, number> = {
  copy_only: 5,
  images_only: 10,
  all: 10,
};

/**
 * 부분 수정 요금 계산:
 * - 카피 섹션 선택 있음 → +3P (섹션 몇 개든 정가)
 * - 이미지 섹션 선택 있음 → 선택된 그룹 수 × 3P (최소 3P)
 * 최소 3P.
 */
function computePartialCost(
  copySections: CopySection[],
  imageSections: ImageSection[]
): number {
  let cost = 0;
  if (copySections.length > 0) cost += 3;
  if (imageSections.length > 0) cost += imageSections.length * 3;
  return Math.max(cost, 3);
}

interface EditRequestBody {
  mode: EditMode;
  instructions?: string; // 사용자가 직접 입력한 재생성 지시사항 (예: "더 감성적으로 바꿔줘")
  use_pro_model?: boolean;
  copy_sections?: CopySection[];   // partial 모드에서만 사용
  image_sections?: ImageSection[]; // partial 모드에서만 사용
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

  const {
    mode,
    use_pro_model = false,
    copy_sections = [],
    image_sections = [],
    instructions: rawInstructions,
  } = body;

  // 사용자 지시사항 정규화 (최대 800자, 앞뒤 공백 제거)
  const userInstructions =
    typeof rawInstructions === "string"
      ? rawInstructions.trim().slice(0, 800)
      : "";

  if (!mode || !["copy_only", "images_only", "all", "partial"].includes(mode)) {
    return NextResponse.json(
      { error: "mode는 copy_only, images_only, all, partial 중 하나여야 합니다." },
      { status: 400 }
    );
  }

  // partial 모드는 최소 하나 이상 선택되어야 함
  if (
    mode === "partial" &&
    copy_sections.length === 0 &&
    image_sections.length === 0
  ) {
    return NextResponse.json(
      { error: "부분 수정: 최소 하나 이상의 섹션을 선택해주세요." },
      { status: 400 }
    );
  }

  const VALID_COPY_SECTIONS = ["hero", "points", "ingredients", "maker", "info"];
  const VALID_IMAGE_SECTIONS = ["hero_img", "detail_img", "extra_img"];
  const badCopy = copy_sections.find((s) => !VALID_COPY_SECTIONS.includes(s));
  const badImage = image_sections.find((s) => !VALID_IMAGE_SECTIONS.includes(s));
  if (badCopy || badImage) {
    return NextResponse.json(
      { error: `잘못된 섹션 값: ${badCopy ?? badImage}` },
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

  // 수정 횟수 제한 제거 — 포인트가 차감되므로 원하는 만큼 수정 가능
  // (edit_count는 통계용으로만 증가시킴)

  const product = pageRow.product as Product | null;
  const template = pageRow.template as Template | null;

  if (!product || !template) {
    return NextResponse.json(
      { error: "원본 상품 또는 템플릿을 찾을 수 없습니다." },
      { status: 400 }
    );
  }

  const language = (pageRow.language ?? "ko") as Language;
  const cost =
    mode === "partial"
      ? computePartialCost(copy_sections, image_sections)
      : EDIT_COSTS[mode];

  // ---------- 4. 포인트 차감 ----------
  const modeLabel =
    mode === "copy_only"
      ? "카피 재생성"
      : mode === "images_only"
        ? "이미지 재생성"
        : mode === "all"
          ? "전체 재생성"
          : "부분 수정";

  const deductResult = await deductPoints({
    user_id: user.id,
    amount: cost,
    description: `상세페이지 ${modeLabel} - ${product.name} (${editCount + 1}회차)`,
    reference_id: page_id,
    metadata: {
      page_id,
      mode,
      edit_count: editCount + 1,
      ...(userInstructions ? { user_instructions: userInstructions.slice(0, 200) } : {}),
      ...(mode === "partial"
        ? { copy_sections, image_sections }
        : {}),
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
      console.log(`[edit] Regenerating copy (full)...`, userInstructions ? `with user instructions` : "");
      newCopy = await generateCopy(product, template, language, {
        userInstructions,
      });
      console.log(`[edit] Copy regenerated in ${Date.now() - copyStart}ms`);
    }

    // 5-2. 이미지 재생성 (images_only, all)
    if (mode === "images_only" || mode === "all") {
      const imgStart = Date.now();
      console.log(`[edit] Regenerating images (pro=${use_pro_model})...`, userInstructions ? `with user instructions` : "");
      newImages = await generateAllImages(
        product,
        template,
        user.id,
        page_id,
        use_pro_model,
        userInstructions
      );
      console.log(
        `[edit] ${newImages.length} images regenerated in ${Date.now() - imgStart}ms`
      );
    }

    // 5-3. 부분 재생성 (partial)
    if (mode === "partial") {
      // (a) 선택된 카피 섹션이 있으면 카피 전체를 다시 생성한 뒤,
      //     선택되지 않은 섹션은 기존 값을 유지 (섹션별 재생성).
      if (copy_sections.length > 0) {
        const copyStart = Date.now();
        console.log(
          `[edit] Regenerating copy (partial): sections=${copy_sections.join(",")}`,
          userInstructions ? `with user instructions` : ""
        );
        const freshCopy = await generateCopy(product, template, language, {
          userInstructions,
        });

        // 섹션 → 카피 필드 매핑
        const merged: GeneratedCopy = { ...oldCopy } as GeneratedCopy;
        for (const section of copy_sections) {
          switch (section) {
            case "hero":
              merged.hero = freshCopy.hero;
              merged.intro = freshCopy.intro;
              break;
            case "points":
              merged.points = freshCopy.points;
              break;
            case "ingredients":
              merged.ingredients_intro = freshCopy.ingredients_intro;
              merged.process = freshCopy.process;
              break;
            case "maker":
              merged.maker_story = freshCopy.maker_story;
              merged.signature = freshCopy.signature;
              break;
            case "info":
              merged.spec_summary = freshCopy.spec_summary;
              merged.shipping_summary = freshCopy.shipping_summary;
              break;
          }
        }
        newCopy = merged;
        console.log(
          `[edit] Copy partial-merged in ${Date.now() - copyStart}ms`
        );
      }

      // (b) 선택된 이미지 섹션의 role들만 재생성, 나머지는 기존 유지
      if (image_sections.length > 0) {
        const imgStart = Date.now();
        const targetRoles: ImageRole[] = [];
        for (const s of image_sections) {
          for (const r of IMAGE_SECTION_ROLES[s]) targetRoles.push(r);
        }
        console.log(
          `[edit] Regenerating images (partial): roles=${targetRoles.join(",")}`
        );
        newImages = await generateSelectedImages(
          product,
          template,
          user.id,
          page_id,
          targetRoles,
          oldImages,
          use_pro_model,
          userInstructions
        );
        console.log(
          `[edit] ${targetRoles.length} image roles regenerated in ${Date.now() - imgStart}ms`
        );
      }
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
