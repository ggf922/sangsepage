// ============================================================
// 포인트 거래 헬퍼 (Server-side only)
// ============================================================

import { createAdminClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/lib/types";

interface DeductPointsInput {
  user_id: string;
  amount: number;
  description: string;
  reference_id?: string;
  metadata?: Record<string, any>;
}

/**
 * 포인트 차감 (SERVICE_ROLE 사용, RLS 우회)
 * 잔액 부족 시 실패, 성공 시 트랜잭션 기록
 */
export async function deductPoints(input: DeductPointsInput): Promise<
  { success: true; balance_after: number } | { success: false; error: string }
> {
  const admin = createAdminClient();

  // 1. 현재 포인트 조회
  const { data: user, error: userError } = await admin
    .from("users")
    .select("points")
    .eq("id", input.user_id)
    .single();

  if (userError || !user) {
    return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
  }

  if (user.points < input.amount) {
    return {
      success: false,
      error: `포인트가 부족합니다. (보유: ${user.points}P, 필요: ${input.amount}P)`,
    };
  }

  const newBalance = user.points - input.amount;

  // 2. 포인트 차감
  const { error: updateError } = await admin
    .from("users")
    .update({ points: newBalance })
    .eq("id", input.user_id);

  if (updateError) {
    return { success: false, error: `포인트 차감 실패: ${updateError.message}` };
  }

  // 3. 거래 기록 (실패해도 차감은 유지, 로그로 처리)
  const { error: txError } = await admin.from("point_transactions").insert({
    user_id: input.user_id,
    type: "usage" as TransactionType,
    amount: -input.amount,
    balance_after: newBalance,
    description: input.description,
    reference_id: input.reference_id ?? null,
    metadata: input.metadata ?? {},
  });

  if (txError) {
    console.error("[deductPoints] transaction log failed:", txError);
  }

  return { success: true, balance_after: newBalance };
}

/**
 * 포인트 환불 (AI 생성 실패 시 자동 호출)
 */
export async function refundPoints(input: DeductPointsInput): Promise<
  { success: true; balance_after: number } | { success: false; error: string }
> {
  const admin = createAdminClient();

  const { data: user, error: userError } = await admin
    .from("users")
    .select("points")
    .eq("id", input.user_id)
    .single();

  if (userError || !user) {
    return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
  }

  const newBalance = user.points + input.amount;

  const { error: updateError } = await admin
    .from("users")
    .update({ points: newBalance })
    .eq("id", input.user_id);

  if (updateError) {
    return { success: false, error: `포인트 환불 실패: ${updateError.message}` };
  }

  await admin.from("point_transactions").insert({
    user_id: input.user_id,
    type: "refund" as TransactionType,
    amount: input.amount,
    balance_after: newBalance,
    description: input.description,
    reference_id: input.reference_id ?? null,
    metadata: input.metadata ?? {},
  });

  return { success: true, balance_after: newBalance };
}

/**
 * 생성 카운터 증가 (total_generated++)
 */
export async function incrementGenerated(user_id: string) {
  const admin = createAdminClient();
  const { data: user } = await admin
    .from("users")
    .select("total_generated")
    .eq("id", user_id)
    .single();

  if (user) {
    await admin
      .from("users")
      .update({ total_generated: (user.total_generated ?? 0) + 1 })
      .eq("id", user_id);
  }
}
