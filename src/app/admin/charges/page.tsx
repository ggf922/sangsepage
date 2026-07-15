import { createAdminClient } from "@/lib/supabase/server";
import { Coins, Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { formatDate, formatKRW } from "@/lib/utils";
import { CHARGE_STATUS_META } from "@/lib/types";
import Link from "next/link";
import ChargeActionButtons from "./charge-action-buttons";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminChargesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status ?? "pending";

  const admin = createAdminClient();

  // 상태별 카운트
  const [
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
    { count: cancelledCount },
  ] = await Promise.all([
    admin
      .from("charge_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("charge_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    admin
      .from("charge_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),
    admin
      .from("charge_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled"),
  ]);

  // 목록 조회
  let query = admin
    .from("charge_requests")
    .select(
      `
      *,
      user:users!charge_requests_user_id_fkey(id, email, name, points),
      package:point_packages(name, code)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: requests, error } = await query;

  // 승인 완료된 총 매출
  const { data: revenueData } = await admin
    .from("charge_requests")
    .select("amount")
    .eq("status", "approved");
  const totalRevenue =
    revenueData?.reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 font-serif text-3xl font-bold text-slate-900">
          <Coins className="h-8 w-8 text-brand" />
          포인트 충전 승인
        </h1>
        <p className="text-slate-500">
          회원 무통장입금 신청을 확인하고 승인/거부할 수 있습니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          label="대기중"
          value={pendingCount ?? 0}
          color="blue"
          highlight
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="승인 완료"
          value={approvedCount ?? 0}
          color="green"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          label="거부"
          value={rejectedCount ?? 0}
          color="red"
        />
        <StatCard
          icon={<Ban className="h-5 w-5 text-slate-500" />}
          label="취소"
          value={cancelledCount ?? 0}
          color="slate"
        />
      </div>

      {/* 총 매출 */}
      <div className="mb-6 rounded-xl border border-brand/20 bg-gradient-to-r from-brand to-brand-dark p-5 text-white">
        <p className="text-sm opacity-80">누적 승인 매출</p>
        <p className="font-serif text-3xl font-bold">{formatKRW(totalRevenue)}</p>
      </div>

      {/* 필터 탭 */}
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        <FilterTab
          href="/admin/charges?status=pending"
          active={statusFilter === "pending"}
          count={pendingCount ?? 0}
        >
          대기중
        </FilterTab>
        <FilterTab
          href="/admin/charges?status=approved"
          active={statusFilter === "approved"}
          count={approvedCount ?? 0}
        >
          승인
        </FilterTab>
        <FilterTab
          href="/admin/charges?status=rejected"
          active={statusFilter === "rejected"}
          count={rejectedCount ?? 0}
        >
          거부
        </FilterTab>
        <FilterTab
          href="/admin/charges?status=cancelled"
          active={statusFilter === "cancelled"}
          count={cancelledCount ?? 0}
        >
          취소
        </FilterTab>
        <FilterTab
          href="/admin/charges?status=all"
          active={statusFilter === "all"}
          count={
            (pendingCount ?? 0) +
            (approvedCount ?? 0) +
            (rejectedCount ?? 0) +
            (cancelledCount ?? 0)
          }
        >
          전체
        </FilterTab>
      </div>

      {/* 목록 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          목록을 불러오지 못했습니다: {error.message}
        </div>
      )}

      {!requests || requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          해당 상태의 신청이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => {
            const meta =
              CHARGE_STATUS_META[req.status as keyof typeof CHARGE_STATUS_META] ??
              CHARGE_STATUS_META.pending;
            const isPending = req.status === "pending";
            return (
              <div
                key={req.id}
                className={
                  isPending
                    ? "overflow-hidden rounded-xl border-2 border-blue-200 bg-white"
                    : "overflow-hidden rounded-xl border border-slate-200 bg-white"
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 font-medium"
                      style={{ color: meta.color, backgroundColor: meta.bgColor }}
                    >
                      {meta.label}
                    </span>
                    <span className="text-slate-500">
                      신청 {formatDate(req.created_at)}
                    </span>
                    {req.approved_at && (
                      <span className="text-slate-500">
                        · 처리 {formatDate(req.approved_at)}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    #{req.id.slice(0, 8)}
                  </span>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-3">
                  {/* 회원 정보 */}
                  <div>
                    <p className="mb-1 text-xs text-slate-500">회원</p>
                    <p className="font-medium text-slate-900">
                      {req.user?.name ?? "이름 없음"}
                    </p>
                    <p className="text-xs text-slate-500">{req.user?.email}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      현재 보유:{" "}
                      <span className="font-medium text-brand">
                        {req.user?.points?.toLocaleString() ?? 0}P
                      </span>
                    </p>
                  </div>

                  {/* 금액 정보 */}
                  <div>
                    <p className="mb-1 text-xs text-slate-500">
                      입금액 / 지급 포인트
                    </p>
                    <p className="font-serif text-xl font-bold text-slate-900">
                      {formatKRW(req.amount)}
                    </p>
                    <p className="text-sm font-medium text-brand">
                      → {req.points.toLocaleString()} P
                    </p>
                    {req.package && (
                      <p className="mt-1 text-xs text-slate-400">
                        패키지: {req.package.name} ({req.package.code})
                      </p>
                    )}
                  </div>

                  {/* 입금자 정보 */}
                  <div>
                    <p className="mb-1 text-xs text-slate-500">입금자명</p>
                    <p className="font-medium text-slate-900">
                      {req.depositor_name}
                    </p>
                    {req.contact && (
                      <p className="text-xs text-slate-500">📞 {req.contact}</p>
                    )}
                    {req.memo && (
                      <p className="mt-1 rounded bg-slate-50 p-2 text-xs text-slate-600">
                        💬 {req.memo}
                      </p>
                    )}
                  </div>
                </div>

                {req.admin_memo && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-2 text-xs text-slate-600">
                    <span className="font-medium">관리자 메모:</span>{" "}
                    {req.admin_memo}
                  </div>
                )}

                {/* 액션 버튼 (pending만) */}
                {isPending && (
                  <div className="border-t border-slate-100 bg-blue-50/40 p-4">
                    <ChargeActionButtons
                      requestId={req.id}
                      depositorName={req.depositor_name}
                      amount={req.amount}
                      points={req.points}
                      userName={req.user?.name ?? req.user?.email ?? ""}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border-2 border-blue-300 bg-blue-50 p-4"
          : "rounded-xl border border-slate-200 bg-white p-4"
      }
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        {icon}
        {label}
      </div>
      <p className="font-serif text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function FilterTab({
  href,
  active,
  children,
  count,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "border-b-2 border-brand px-4 py-2 text-sm font-medium text-brand"
          : "border-b-2 border-transparent px-4 py-2 text-sm text-slate-500 hover:text-slate-900"
      }
    >
      {children}
      <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
        {count}
      </span>
    </Link>
  );
}
