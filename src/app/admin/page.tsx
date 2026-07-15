import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Users, FileText, Palette, Coins, Wallet, Package, ArrowRight, Clock } from "lucide-react";
import { formatKRW, formatDate } from "@/lib/utils";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [
    { count: userCount },
    { count: pageCount },
    { count: templateCount },
    { count: productCount },
    { count: pendingChargeCount },
    { data: revenueData },
    { data: recentCharges },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("generated_pages").select("*", { count: "exact", head: true }),
    supabase
      .from("templates")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("products").select("*", { count: "exact", head: true }),
    admin
      .from("charge_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("charge_requests")
      .select("amount")
      .eq("status", "approved"),
    admin
      .from("charge_requests")
      .select("id, amount, points, depositor_name, status, created_at, user:users!charge_requests_user_id_fkey(name, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue =
    revenueData?.reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-slate-900">
          관리자 대시보드
        </h1>
        <p className="text-slate-500">전체 서비스 현황을 확인합니다.</p>
      </div>

      {/* 대기중 충전 알림 (강조) */}
      {(pendingChargeCount ?? 0) > 0 && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-600 p-3 text-white">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-blue-900">
                처리 대기중인 충전 신청 {pendingChargeCount}건
              </p>
              <p className="text-sm text-blue-700">
                케이뱅크 100 300 095296 큰바구니 계좌 입금 내역을 확인하고 승인해주세요.
              </p>
            </div>
          </div>
          <Link
            href="/admin/charges?status=pending"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            승인하러 가기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <AdminStatCard
          icon={<Users className="h-5 w-5" />}
          label="전체 회원"
          value={userCount ?? 0}
        />
        <AdminStatCard
          icon={<FileText className="h-5 w-5" />}
          label="생성된 페이지"
          value={pageCount ?? 0}
        />
        <AdminStatCard
          icon={<Palette className="h-5 w-5" />}
          label="활성 템플릿"
          value={templateCount ?? 0}
        />
        <AdminStatCard
          icon={<Package className="h-5 w-5" />}
          label="등록 상품"
          value={productCount ?? 0}
        />
      </div>

      {/* 매출 & 대기 신청 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-brand to-brand-dark p-6 text-white">
          <div className="mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">누적 승인 매출</span>
          </div>
          <p className="font-serif text-3xl font-bold">
            {formatKRW(totalRevenue)}
          </p>
          <Link
            href="/admin/charges?status=approved"
            className="mt-4 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/30"
          >
            승인 내역 보기
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
              <Clock className="h-5 w-5 text-blue-600" />
              최근 대기중 신청
            </h2>
            <Link
              href="/admin/charges?status=pending"
              className="text-xs text-brand hover:underline"
            >
              전체 보기 →
            </Link>
          </div>
          {!recentCharges || recentCharges.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              대기중인 신청이 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {recentCharges.map((c: any) => (
                <Link
                  key={c.id}
                  href="/admin/charges?status=pending"
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {c.depositor_name}{" "}
                      <span className="text-xs text-slate-500">
                        ({c.user?.name ?? c.user?.email})
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(c.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-sm font-bold text-slate-900">
                      {formatKRW(c.amount)}
                    </p>
                    <p className="text-xs text-brand">
                      → {c.points.toLocaleString()}P
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>
      <p className="mb-1 text-sm text-slate-500">{label}</p>
      <p className="font-serif text-3xl font-bold text-slate-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
