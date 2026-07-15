"use server";

// ============================================================
// 관리자 충전 승인/거부 Server Actions (SERVICE_ROLE)
// ============================================================

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 요청자가 관리자인지 확인 (auth cookie 기반)
 */
async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "로그인이 필요합니다." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "관리자 권한이 필요합니다." };
  }

  return { ok: true as const, admin_id: user.id };
}

/**
 * 충전 신청 승인 → 포인트 지급 + 거래 기록 + charge_requests 업데이트
 */
export async function approveChargeRequest(request_id: string, admin_memo?: string) {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  const admin = createAdminClient();

  // 1. 신청 조회 (pending인지 확인)
  const { data: request, error: loadError } = await admin
    .from("charge_requests")
    .select("*")
    .eq("id", request_id)
    .single();

  if (loadError || !request) {
    return { success: false as const, error: "신청 내역을 찾을 수 없습니다." };
  }

  if (request.status !== "pending") {
    return {
      success: false as const,
      error: `이미 처리된 신청입니다. (현재 상태: ${request.status})`,
    };
  }

  // 2. 현재 포인트 조회
  const { data: userRow, error: userError } = await admin
    .from("users")
    .select("id, points")
    .eq("id", request.user_id)
    .single();

  if (userError || !userRow) {
    return { success: false as const, error: "회원 정보를 찾을 수 없습니다." };
  }

  const newBalance = (userRow.points ?? 0) + request.points;

  // 3. 포인트 지급
  const { error: updateUserError } = await admin
    .from("users")
    .update({ points: newBalance })
    .eq("id", request.user_id);

  if (updateUserError) {
    return {
      success: false as const,
      error: `포인트 지급 실패: ${updateUserError.message}`,
    };
  }

  // 4. 거래 기록 삽입
  const { data: tx, error: txError } = await admin
    .from("point_transactions")
    .insert({
      user_id: request.user_id,
      type: "charge",
      amount: request.points,
      balance_after: newBalance,
      description: `포인트 충전 - ${request.amount.toLocaleString()}원 (${request.depositor_name})`,
      reference_id: request.id,
      metadata: {
        charge_request_id: request.id,
        depositor_name: request.depositor_name,
        amount: request.amount,
        approved_by: auth.admin_id,
      },
    })
    .select()
    .single();

  if (txError) {
    console.error("[approveCharge] transaction log failed:", txError);
    // 롤백은 어려우므로 로그만 남기고 진행 (관리자가 확인 필요)
  }

  // 5. charge_requests 승인 처리
  const { error: approveError } = await admin
    .from("charge_requests")
    .update({
      status: "approved",
      approved_by: auth.admin_id,
      approved_at: new Date().toISOString(),
      admin_memo: admin_memo?.trim() || null,
      transaction_id: tx?.id ?? null,
    })
    .eq("id", request_id);

  if (approveError) {
    return {
      success: false as const,
      error: `승인 상태 업데이트 실패: ${approveError.message}`,
    };
  }

  revalidatePath("/admin/charges");
  revalidatePath("/dashboard/mypage");
  revalidatePath("/dashboard/mypage/charge");
  revalidatePath("/dashboard/mypage/history");

  return { success: true as const, balance_after: newBalance };
}

/**
 * 충전 신청 거부
 */
export async function rejectChargeRequest(request_id: string, admin_memo: string) {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false as const, error: auth.error };

  if (!admin_memo?.trim()) {
    return { success: false as const, error: "거부 사유를 입력해주세요." };
  }

  const admin = createAdminClient();

  const { data: request } = await admin
    .from("charge_requests")
    .select("status")
    .eq("id", request_id)
    .single();

  if (!request) {
    return { success: false as const, error: "신청 내역을 찾을 수 없습니다." };
  }

  if (request.status !== "pending") {
    return {
      success: false as const,
      error: `이미 처리된 신청입니다. (현재 상태: ${request.status})`,
    };
  }

  const { error } = await admin
    .from("charge_requests")
    .update({
      status: "rejected",
      approved_by: auth.admin_id,
      approved_at: new Date().toISOString(),
      admin_memo: admin_memo.trim(),
    })
    .eq("id", request_id);

  if (error) {
    return { success: false as const, error: `거부 처리 실패: ${error.message}` };
  }

  revalidatePath("/admin/charges");
  revalidatePath("/dashboard/mypage/charge");
  revalidatePath("/dashboard/mypage/history");

  return { success: true as const };
}
