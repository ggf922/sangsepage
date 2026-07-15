// ============================================================
// 관리자 포인트 지급/차감 API
// POST /api/admin/users/[id]/adjust-points
// Body: { amount: number, description: string }
// - amount 양수: 포인트 지급
// - amount 음수: 포인트 차감 (잔액 부족 시 실패)
// ============================================================

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;

  // 1. 관리자 인증
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

  // 2. 요청 파싱
  const body = await request.json().catch(() => null);
  if (!body || typeof body.amount !== "number" || !Number.isInteger(body.amount)) {
    return NextResponse.json(
      { error: "amount는 정수여야 합니다" },
      { status: 400 }
    );
  }
  if (body.amount === 0) {
    return NextResponse.json({ error: "amount는 0이 될 수 없습니다" }, { status: 400 });
  }
  if (Math.abs(body.amount) > 1_000_000) {
    return NextResponse.json(
      { error: "amount는 절대값 1,000,000 이하여야 합니다" },
      { status: 400 }
    );
  }
  const description = (body.description ?? "").toString().trim() || "관리자 포인트 조정";
  if (description.length > 200) {
    return NextResponse.json({ error: "설명은 200자 이내" }, { status: 400 });
  }

  // 3. 대상 유저 확인 & 잔액 조회
  const admin = createAdminClient();
  const { data: targetUser, error: fetchError } = await admin
    .from("users")
    .select("id, email, points")
    .eq("id", targetUserId)
    .single();

  if (fetchError || !targetUser) {
    return NextResponse.json({ error: "대상 유저를 찾을 수 없습니다" }, { status: 404 });
  }

  const newBalance = targetUser.points + body.amount;
  if (newBalance < 0) {
    return NextResponse.json(
      {
        error: `잔액 부족: 현재 ${targetUser.points}P, 차감 ${Math.abs(body.amount)}P 시 음수가 됩니다`,
      },
      { status: 400 }
    );
  }

  // 4. 잔액 업데이트 + 거래 로그 (감사용)
  const { error: updateError } = await admin
    .from("users")
    .update({ points: newBalance })
    .eq("id", targetUserId);

  if (updateError) {
    return NextResponse.json(
      { error: `포인트 업데이트 실패: ${updateError.message}` },
      { status: 500 }
    );
  }

  const { error: txError } = await admin.from("point_transactions").insert({
    user_id: targetUserId,
    type: "admin_adjust",
    amount: body.amount,
    balance_after: newBalance,
    description,
    metadata: {
      admin_id: user.id,
      admin_email: profile.email,
    },
  });

  if (txError) {
    // 로그만 남기고 실패로 처리하지 않음 (잔액 업데이트는 이미 성공)
    console.error("[adjust-points] transaction log failed:", txError);
  }

  return NextResponse.json({
    success: true,
    user_id: targetUserId,
    email: targetUser.email,
    delta: body.amount,
    balance_before: targetUser.points,
    balance_after: newBalance,
    description,
  });
}
