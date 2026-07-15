import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Coins, Building2, History } from "lucide-react";
import { BANK_ACCOUNT } from "@/lib/types";
import ChargeForm from "./charge-form";
import PendingList from "./pending-list";

export default async function ChargePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: packages }, { data: pendingRequests }] =
    await Promise.all([
      supabase.from("users").select("points, name, email").eq("id", user.id).single(),
      supabase
        .from("point_packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("charge_requests")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

  const points = profile?.points ?? 0;
  const defaultDepositor = profile?.name ?? "";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/mypage"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          마이페이지
        </Link>
        <h1 className="mb-1 flex items-center gap-2 font-serif text-3xl font-bold text-ink">
          <Coins className="h-8 w-8 text-brand" />
          포인트 충전
        </h1>
        <p className="text-muted-foreground">
          무통장입금 후 관리자 확인이 완료되면 포인트가 지급됩니다. (평일 기준 1~24시간)
        </p>
      </div>

      {/* 현재 포인트 & 히스토리 링크 */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-brand/10 bg-ivory p-5">
        <div>
          <p className="text-xs text-muted-foreground">보유 포인트</p>
          <p className="font-serif text-3xl font-bold text-brand">
            {points.toLocaleString()} P
          </p>
        </div>
        <Link
          href="/dashboard/mypage/history"
          className="inline-flex items-center gap-1 rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-ink hover:bg-white/70"
        >
          <History className="h-4 w-4" />
          전체 내역
        </Link>
      </div>

      {/* 은행 계좌 안내 (강조) */}
      <div className="mb-6 overflow-hidden rounded-xl border-2 border-brand bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-brand/10 bg-brand/5 px-5 py-3">
          <Building2 className="h-5 w-5 text-brand" />
          <h2 className="font-serif text-lg font-bold text-ink">입금 계좌 안내</h2>
        </div>
        <div className="p-5">
          <div className="mb-4 rounded-lg bg-gradient-to-r from-brand/5 to-transparent p-5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">은행</p>
                <p className="font-serif text-2xl font-bold text-ink">
                  {BANK_ACCOUNT.bank}
                </p>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-xs text-muted-foreground">계좌번호</p>
                <p className="font-mono text-2xl font-bold tracking-wider text-brand">
                  {BANK_ACCOUNT.number}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">예금주</p>
                <p className="font-serif text-2xl font-bold text-ink">
                  {BANK_ACCOUNT.holder}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="mb-2 font-medium">📌 입금 시 주의사항</p>
            <ul className="list-inside list-disc space-y-1 text-amber-800">
              <li>
                아래 <strong>충전 신청</strong>을 먼저 완료한 후 입금해주세요.
              </li>
              <li>
                <strong>입금자명</strong>이 신청서와 다르면 확인이 지연됩니다.
              </li>
              <li>정확한 금액을 입금해주세요. 오차 입금 시 확인이 어렵습니다.</li>
              <li>
                평일 <strong>09:00~18:00</strong> 사이 접수 건은 당일 처리, 그 외 시간은
                다음 영업일에 처리됩니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 진행 중인 신청 (pending) */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 font-serif text-lg font-bold text-ink">
            처리 대기중인 신청 ({pendingRequests.length}건)
          </h2>
          <PendingList requests={pendingRequests as any} />
        </div>
      )}

      {/* 충전 신청 폼 */}
      <ChargeForm
        packages={packages ?? []}
        defaultDepositor={defaultDepositor}
      />
    </div>
  );
}
