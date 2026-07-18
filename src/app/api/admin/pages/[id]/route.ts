// ============================================================
// 관리자: 생성된 페이지 삭제 API
// DELETE /api/admin/pages/[id]
// - 관리자 권한 필요
// - generated_pages.source_page_id 는 ON DELETE SET NULL 이므로
//   재생성 파생 관계는 자동 정리됨
// - html_content는 DB 컬럼에 저장되므로 별도 스토리지 삭제 불필요
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pageId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다" },
      { status: 403 }
    );
  }

  if (!pageId) {
    return NextResponse.json({ error: "페이지 ID가 필요합니다" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 삭제 전 존재 여부 확인 (디버깅/로깅용)
  const { data: existing, error: fetchError } = await admin
    .from("generated_pages")
    .select("id, user_id, product_id, status, points_used")
    .eq("id", pageId)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "페이지를 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  const { error: deleteError } = await admin
    .from("generated_pages")
    .delete()
    .eq("id", pageId);

  if (deleteError) {
    return NextResponse.json(
      { error: `삭제 실패: ${deleteError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    deleted_id: pageId,
    was_status: existing.status,
    points_used: existing.points_used,
  });
}
