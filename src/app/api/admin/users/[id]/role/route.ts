// ============================================================
// 관리자 역할 변경 API
// POST /api/admin/users/[id]/role
// Body: { role: "user" | "admin" }
// - 자기 자신의 admin 권한은 해제할 수 없음 (락아웃 방지)
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const newRole = body?.role;
  if (newRole !== "user" && newRole !== "admin") {
    return NextResponse.json({ error: "role은 'user' 또는 'admin'" }, { status: 400 });
  }

  // 자기 자신의 admin 권한은 해제할 수 없음 (락아웃 방지)
  if (targetUserId === user.id && newRole !== "admin") {
    return NextResponse.json(
      { error: "본인의 관리자 권한은 해제할 수 없습니다" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    return NextResponse.json({ error: `역할 변경 실패: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true, user_id: targetUserId, role: newRole });
}
