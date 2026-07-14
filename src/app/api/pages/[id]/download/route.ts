// ============================================================
// GET /api/pages/[id]/download
// HTML 파일 다운로드 (attachment)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: page, error } = await supabase
    .from("generated_pages")
    .select(
      `
      html_content,
      user_id,
      status,
      created_at,
      product:products(name)
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !page) {
    return NextResponse.json({ error: "페이지를 찾을 수 없습니다." }, { status: 404 });
  }

  if (page.status !== "completed" || !page.html_content) {
    return NextResponse.json(
      { error: "아직 생성이 완료되지 않았습니다." },
      { status: 400 }
    );
  }

  const productName = (page.product as any)?.name ?? "detail-page";
  const safeName = productName.replace(/[^\w가-힣ㄱ-ㅎㅏ-ㅣ-]+/g, "-");
  const filename = `${safeName}-${id.slice(0, 8)}.html`;

  return new NextResponse(page.html_content, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
