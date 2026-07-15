import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, History, Coins, Receipt } from "lucide-react";
import { formatDate, formatKRW } from "@/lib/utils";
import { CHARGE_STATUS_META } from "@/lib/types";

const TX_TYPE_META: Record<string, { label: string; icon: string }> = {
  charge: { label: "충전", icon: "💰" },
  usage: { label: "사용", icon: "📄" },
  refund: { label: "환불", icon: "↩️" },
  bonus: { label: "보너스", icon: "🎁" },
  admin_adjust: { label: "관리자 조정", icon: "⚙️" },
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "charges" ? "charges" : "transactions";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: transactions }, { data: chargeRequests }] = await Promise.all([
    supabase
      .from("point_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("charge_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/mypage"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          마이페이지
        </Link>
        <h1 className="mb-1 flex items-center gap-2 font-serif text-3xl font-bold text-ink">
          <History className="h-8 w-8 text-brand" />
          포인트 내역
        </h1>
        <p className="text-muted-foreground">
          포인트 충전·사용 내역과 충전 신청 상태를 확인할 수 있습니다.
        </p>
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-1 border-b border-brand/10">
        <Link
          href="/dashboard/mypage/history?tab=transactions"
          className={
            tab === "transactions"
              ? "border-b-2 border-brand px-4 py-2 text-sm font-medium text-brand"
              : "border-b-2 border-transparent px-4 py-2 text-sm text-muted-foreground hover:text-ink"
          }
        >
          <span className="inline-flex items-center gap-1">
            <Coins className="h-4 w-4" />
            포인트 거래 내역
          </span>
        </Link>
        <Link
          href="/dashboard/mypage/history?tab=charges"
          className={
            tab === "charges"
              ? "border-b-2 border-brand px-4 py-2 text-sm font-medium text-brand"
              : "border-b-2 border-transparent px-4 py-2 text-sm text-muted-foreground hover:text-ink"
          }
        >
          <span className="inline-flex items-center gap-1">
            <Receipt className="h-4 w-4" />
            충전 신청 내역
          </span>
        </Link>
      </div>

      {/* 탭 내용 */}
      {tab === "transactions" && (
        <div className="rounded-xl border border-brand/10 bg-white">
          {!transactions || transactions.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              아직 포인트 거래 내역이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-brand/5">
              {transactions.map((tx: any) => {
                const meta = TX_TYPE_META[tx.type] ?? {
                  label: tx.type,
                  icon: "📌",
                };
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 hover:bg-ivory/40"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{meta.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-ink">
                            {tx.description}
                          </p>
                          <span className="rounded bg-brand/5 px-1.5 py-0.5 text-xs text-brand">
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          tx.amount > 0
                            ? "font-serif text-lg font-bold text-green-600"
                            : "font-serif text-lg font-bold text-red-600"
                        }
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()}P
                      </p>
                      <p className="text-xs text-muted-foreground">
                        잔액 {tx.balance_after?.toLocaleString()}P
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "charges" && (
        <div className="rounded-xl border border-brand/10 bg-white">
          {!chargeRequests || chargeRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="mx-auto mb-3 h-10 w-10 text-brand/30" />
              <p className="text-sm text-muted-foreground">
                아직 충전 신청 내역이 없습니다.
              </p>
              <Link
                href="/dashboard/mypage/charge"
                className="mt-4 inline-flex items-center gap-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                <Coins className="h-4 w-4" />
                충전하러 가기
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-brand/10 bg-ivory text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-4 text-left">신청일</th>
                    <th className="p-4 text-left">입금액</th>
                    <th className="p-4 text-left">포인트</th>
                    <th className="p-4 text-left">입금자명</th>
                    <th className="p-4 text-left">상태</th>
                    <th className="p-4 text-left">처리일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand/5">
                  {chargeRequests.map((req: any) => {
                    const meta =
                      CHARGE_STATUS_META[
                        req.status as keyof typeof CHARGE_STATUS_META
                      ] ?? CHARGE_STATUS_META.pending;
                    return (
                      <tr key={req.id} className="hover:bg-ivory/40">
                        <td className="p-4 text-sm text-ink">
                          {formatDate(req.created_at)}
                        </td>
                        <td className="p-4 text-sm font-medium text-ink">
                          {formatKRW(req.amount)}
                        </td>
                        <td className="p-4 text-sm font-medium text-brand">
                          {req.points.toLocaleString()} P
                        </td>
                        <td className="p-4 text-sm text-ink">
                          {req.depositor_name}
                        </td>
                        <td className="p-4 text-sm">
                          <span
                            className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              color: meta.color,
                              backgroundColor: meta.bgColor,
                            }}
                          >
                            {meta.label}
                          </span>
                          {req.admin_memo && req.status === "rejected" && (
                            <p className="mt-1 text-xs text-red-600">
                              {req.admin_memo}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {req.approved_at ? formatDate(req.approved_at) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
