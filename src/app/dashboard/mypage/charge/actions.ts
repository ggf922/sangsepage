"use server";

// ============================================================
// 회원 충전 신청 Server Actions
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface CreateChargeInput {
  package_id?: string | null;
  points: number; // 총 지급 예정 포인트 (기본+보너스)
  amount: number; // 입금액
  depositor_name: string;
  contact?: string;
  memo?: string;
}

/**
 * 충전 신청 생성 (pending)
 */
export async function createChargeRequest(input: CreateChargeInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "로그인이 필요합니다." };
  }

  // 입력 검증
  if (!input.depositor_name?.trim()) {
    return { success: false as const, error: "입금자명을 입력해주세요." };
  }
  if (input.amount <= 0 || input.points <= 0) {
    return { success: false as const, error: "충전 금액이 올바르지 않습니다." };
  }
  if (input.amount > 10_000_000) {
    return { success: false as const, error: "1회 최대 충전 금액은 1,000만원입니다." };
  }

  // 진행 중인 신청이 있는지 확인 (동시에 여러 개 방지)
  const { count: pendingCount } = await supabase
    .from("charge_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  if ((pendingCount ?? 0) >= 3) {
    return {
      success: false as const,
      error: "처리 대기중인 신청이 3건 이상 있습니다. 기존 신청 완료 후 다시 시도해주세요.",
    };
  }

  // 패키지 검증 (선택 시)
  if (input.package_id) {
    const { data: pkg } = await supabase
      .from("point_packages")
      .select("id, points, price, bonus_points, is_active")
      .eq("id", input.package_id)
      .single();

    if (!pkg || !pkg.is_active) {
      return { success: false as const, error: "선택한 패키지를 찾을 수 없습니다." };
    }

    const expectedPoints = pkg.points + pkg.bonus_points;
    if (pkg.price !== input.amount || expectedPoints !== input.points) {
      return {
        success: false as const,
        error: "패키지 정보가 일치하지 않습니다. 페이지를 새로고침 후 다시 시도해주세요.",
      };
    }
  }

  const { data: request, error } = await supabase
    .from("charge_requests")
    .insert({
      user_id: user.id,
      package_id: input.package_id ?? null,
      points: input.points,
      amount: input.amount,
      depositor_name: input.depositor_name.trim(),
      contact: input.contact?.trim() || null,
      memo: input.memo?.trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error || !request) {
    return {
      success: false as const,
      error: `신청 실패: ${error?.message ?? "알 수 없는 오류"}`,
    };
  }

  revalidatePath("/dashboard/mypage");
  revalidatePath("/dashboard/mypage/charge");
  revalidatePath("/dashboard/mypage/history");

  return { success: true as const, request_id: request.id };
}

/**
 * 회원 본인의 pending 신청 취소
 */
export async function cancelChargeRequest(request_id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "로그인이 필요합니다." };
  }

  const { data: request, error: loadError } = await supabase
    .from("charge_requests")
    .select("id, user_id, status")
    .eq("id", request_id)
    .single();

  if (loadError || !request) {
    return { success: false as const, error: "신청 내역을 찾을 수 없습니다." };
  }

  if (request.user_id !== user.id) {
    return { success: false as const, error: "본인의 신청만 취소할 수 있습니다." };
  }

  if (request.status !== "pending") {
    return { success: false as const, error: "대기 중인 신청만 취소할 수 있습니다." };
  }

  const { error: updateError } = await supabase
    .from("charge_requests")
    .update({ status: "cancelled" })
    .eq("id", request_id);

  if (updateError) {
    return { success: false as const, error: `취소 실패: ${updateError.message}` };
  }

  revalidatePath("/dashboard/mypage/charge");
  revalidatePath("/dashboard/mypage/history");

  return { success: true as const };
}
