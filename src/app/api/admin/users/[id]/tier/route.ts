// ============================================================
// 관리자 회원 등급 변경 API (Free ↔ Pro)
// POST /api/admin/users/[id]/tier
// Body: { tier: "free" | "pro" }
// - Pro 회원은 Self-Critique가 항상 자동 적용됨
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
  const newTier = body?.tier;
  if (newTier !== "free" && newTier !== "pro") {
    return NextResponse.json({ error: "tier는 'free' 또는 'pro'" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 대상 회원의 현재 등급 확인 (감사 로그용)
  const { data: targetUser } = await admin
    .from("users")
    .select("email, tier")
    .eq("id", targetUserId)
    .single();

  const previousTier = targetUser?.tier ?? "free";

  const { error } = await admin
    .from("users")
    .update({ tier: newTier })
    .eq("id", targetUserId);

  if (error) {
    return NextResponse.json({ error: `등급 변경 실패: ${error.message}` }, { status: 500 });
  }

  // 감사 로그 (point_transactions에 0P 이벤트로 기록)
  if (previousTier !== newTier) {
    await admin.from("point_transactions").insert({
      user_id: targetUserId,
      type: "admin_adjust",
      amount: 0,
      balance_after: 0, // 실제 잔액과 무관한 이벤트 기록
      description: `[등급 변경] ${previousTier.toUpperCase()} → ${newTier.toUpperCase()}`,
      metadata: {
        admin_id: user.id,
        admin_email: profile?.email,
        previous_tier: previousTier,
        new_tier: newTier,
        target_email: targetUser?.email,
        event: "tier_change",
      },
    });
  }

  return NextResponse.json({
    success: true,
    user_id: targetUserId,
    tier: newTier,
    previous_tier: previousTier,
  });
}
