import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { formatKRW, formatDate } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Palette,
  Globe2,
  Coins,
  Wallet,
  Crown,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const LANGUAGE_META: Record<string, { flag: string; label: string }> = {
  ko: { flag: "🇰🇷", label: "한국어" },
  en: { flag: "🇺🇸", label: "English" },
  zh: { flag: "🇨🇳", label: "中文" },
  ja: { flag: "🇯🇵", label: "日本語" },
};

const TEMPLATE_COLOR: Record<string, string> = {
  A: "bg-red-100 text-red-700 border-red-200",
  B: "bg-blue-100 text-blue-700 border-blue-200",
  C: "bg-slate-100 text-slate-700 border-slate-200",
  D: "bg-green-100 text-green-700 border-green-200",
  E: "bg-pink-100 text-pink-700 border-pink-200",
};

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient();

  // ============================================================
  // 1. 기본 카운트
  // ============================================================
  const [
    { count: totalUsers },
    { count: totalPages },
    { count: completedPages },
    { count: totalProducts },
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }),
    admin.from("generated_pages").select("*", { count: "exact", head: true }),
    admin
      .from("generated_pages")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    admin.from("products").select("*", { count: "exact", head: true }),
  ]);

  // ============================================================
  // 2. 매출: 승인된 충전 요청 합계
  // ============================================================
  const { data: approvedCharges } = await admin
    .from("charge_requests")
    .select("amount, points, approved_at, created_at")
    .eq("status", "approved");

  const totalRevenue =
    approvedCharges?.reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0;
  const totalChargedPoints =
    approvedCharges?.reduce((sum, r) => sum + (r.points ?? 0), 0) ?? 0;

  // ============================================================
  // 3. 최근 7일 일자별 매출/생성 추이
  // ============================================================
  const now = new Date();
  const days: {
    label: string;
    dateISO: string;
    revenue: number;
    pages: number;
    users: number;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const dateISO = d.toISOString().slice(0, 10);
    days.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      dateISO,
      revenue: 0,
      pages: 0,
      users: 0,
    });
  }

  const dayMap = new Map(days.map((d) => [d.dateISO, d]));

  approvedCharges?.forEach((c) => {
    const iso = (c.approved_at ?? c.created_at)?.slice(0, 10);
    if (iso && dayMap.has(iso)) {
      dayMap.get(iso)!.revenue += c.amount ?? 0;
    }
  });

  const sevenDaysAgoISO = days[0].dateISO;

  const { data: recentPages } = await admin
    .from("generated_pages")
    .select("created_at")
    .gte("created_at", `${sevenDaysAgoISO}T00:00:00Z`);
  recentPages?.forEach((p) => {
    const iso = p.created_at?.slice(0, 10);
    if (iso && dayMap.has(iso)) {
      dayMap.get(iso)!.pages += 1;
    }
  });

  const { data: recentUsers } = await admin
    .from("users")
    .select("created_at")
    .gte("created_at", `${sevenDaysAgoISO}T00:00:00Z`);
  recentUsers?.forEach((u) => {
    const iso = u.created_at?.slice(0, 10);
    if (iso && dayMap.has(iso)) {
      dayMap.get(iso)!.users += 1;
    }
  });

  const maxRevenue = Math.max(1, ...days.map((d) => d.revenue));
  const maxPages = Math.max(1, ...days.map((d) => d.pages));
  const weekRevenue = days.reduce((s, d) => s + d.revenue, 0);
  const weekPages = days.reduce((s, d) => s + d.pages, 0);
  const weekUsers = days.reduce((s, d) => s + d.users, 0);

  // ============================================================
  // 4. 템플릿별 인기 (완료된 페이지 기준)
  // ============================================================
  const { data: templatePages } = await admin
    .from("generated_pages")
    .select("template_id, templates(code, name)")
    .eq("status", "completed");

  const templateCounts = new Map<
    string,
    { code: string; name: string; count: number }
  >();
  templatePages?.forEach((p: any) => {
    const code = p.templates?.code ?? "?";
    const name = p.templates?.name ?? "알 수 없음";
    const key = p.template_id ?? "unknown";
    const existing = templateCounts.get(key);
    if (existing) existing.count += 1;
    else templateCounts.set(key, { code, name, count: 1 });
  });
  const templateRanking = Array.from(templateCounts.values()).sort(
    (a, b) => b.count - a.count
  );
  const maxTemplateCount = Math.max(1, ...templateRanking.map((t) => t.count));

  // ============================================================
  // 5. 언어별 분포
  // ============================================================
  const languageCounts = new Map<string, number>();
  templatePages?.forEach((p: any) => {
    const lang = p.language ?? "ko";
    languageCounts.set(lang, (languageCounts.get(lang) ?? 0) + 1);
  });

  const { data: langPages } = await admin
    .from("generated_pages")
    .select("language")
    .eq("status", "completed");
  langPages?.forEach((p) => {
    const lang = p.language ?? "ko";
    languageCounts.set(lang, (languageCounts.get(lang) ?? 0) + 1);
  });
  // 위에서 두 번 카운트했으니 재계산
  const languageCountsFinal = new Map<string, number>();
  langPages?.forEach((p) => {
    const lang = p.language ?? "ko";
    languageCountsFinal.set(lang, (languageCountsFinal.get(lang) ?? 0) + 1);
  });
  const totalLangCount = Array.from(languageCountsFinal.values()).reduce(
    (s, n) => s + n,
    0
  );

  // ============================================================
  // 6. 상위 사용자 (페이지 생성 수 기준)
  // ============================================================
  const { data: allCompletedPages } = await admin
    .from("generated_pages")
    .select("user_id, points_used, users(email, name)")
    .eq("status", "completed");

  const userStats = new Map<
    string,
    { email: string; name: string; pages: number; points: number }
  >();
  allCompletedPages?.forEach((p: any) => {
    const uid = p.user_id;
    const email = p.users?.email ?? "unknown";
    const name = p.users?.name ?? "";
    const existing = userStats.get(uid);
    if (existing) {
      existing.pages += 1;
      existing.points += p.points_used ?? 0;
    } else {
      userStats.set(uid, {
        email,
        name,
        pages: 1,
        points: p.points_used ?? 0,
      });
    }
  });
  const topUsers = Array.from(userStats.values())
    .sort((a, b) => b.pages - a.pages)
    .slice(0, 10);

  // ============================================================
  // 7. 포인트 통계
  // ============================================================
  const { data: allTransactions } = await admin
    .from("point_transactions")
    .select("type, amount");

  const pointStats = {
    charged: 0,
    used: 0,
    refunded: 0,
    bonus: 0,
    adjusted: 0,
  };
  allTransactions?.forEach((t) => {
    if (t.type === "charge") pointStats.charged += t.amount;
    else if (t.type === "usage") pointStats.used += Math.abs(t.amount);
    else if (t.type === "refund") pointStats.refunded += t.amount;
    else if (t.type === "bonus") pointStats.bonus += t.amount;
    else if (t.type === "admin_adjust") pointStats.adjusted += t.amount;
  });

  const conversionRate =
    totalPages && completedPages
      ? Math.round((completedPages / totalPages) * 1000) / 10
      : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-3 font-serif text-3xl font-bold text-slate-900">
            <BarChart3 className="h-8 w-8 text-[#a71d1d]" />
            통계 대시보드
          </h1>
          <p className="text-slate-500">
            매출, 페이지 생성, 사용자 활동 등 종합 통계
          </p>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-700">누적 매출</p>
          </div>
          <p className="font-serif text-3xl font-bold text-emerald-900">
            {formatKRW(totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            승인 충전 {approvedCharges?.length ?? 0}건
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <p className="text-xs font-medium text-blue-700">전체 회원</p>
          </div>
          <p className="font-serif text-3xl font-bold text-blue-900">
            {(totalUsers ?? 0).toLocaleString()}명
          </p>
          <p className="mt-1 text-xs text-blue-600">
            최근 7일 신규 {weekUsers}명
          </p>
        </div>

        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <p className="text-xs font-medium text-purple-700">
              생성 페이지 (완료)
            </p>
          </div>
          <p className="font-serif text-3xl font-bold text-purple-900">
            {(completedPages ?? 0).toLocaleString()}개
          </p>
          <p className="mt-1 text-xs text-purple-600">
            전체 {totalPages ?? 0}개 · 성공률 {conversionRate}%
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-600" />
            <p className="text-xs font-medium text-amber-700">누적 사용 포인트</p>
          </div>
          <p className="font-serif text-3xl font-bold text-amber-900">
            {pointStats.used.toLocaleString()}P
          </p>
          <p className="mt-1 text-xs text-amber-600">
            충전 {pointStats.charged.toLocaleString()}P
          </p>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-slate-900">
              <TrendingUp className="h-5 w-5 text-[#a71d1d]" />
              최근 7일 추이
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              일자별 매출 · 페이지 생성 · 신규 가입
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">주간 매출</p>
              <p className="font-serif text-lg font-bold text-emerald-600">
                {formatKRW(weekRevenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">주간 생성</p>
              <p className="font-serif text-lg font-bold text-purple-600">
                {weekPages}개
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">주간 가입</p>
              <p className="font-serif text-lg font-bold text-blue-600">
                {weekUsers}명
              </p>
            </div>
          </div>
        </div>

        {/* Chart: Revenue Bar */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-medium text-slate-600">
            💰 매출 (원)
          </p>
          <div className="flex h-40 items-end gap-2">
            {days.map((d) => (
              <div
                key={d.dateISO}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all hover:from-emerald-600 hover:to-emerald-400"
                    style={{
                      height: `${(d.revenue / maxRevenue) * 100}%`,
                      minHeight: d.revenue > 0 ? "4px" : "0",
                    }}
                    title={`${d.label}: ${formatKRW(d.revenue)}`}
                  />
                </div>
                <p className="text-[10px] font-medium text-slate-500">
                  {d.label}
                </p>
                <p className="text-[9px] text-emerald-600">
                  {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : "-"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart: Pages Bar */}
        <div>
          <p className="mb-3 text-xs font-medium text-slate-600">
            📄 페이지 생성 수
          </p>
          <div className="flex h-32 items-end gap-2">
            {days.map((d) => (
              <div
                key={d.dateISO}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-purple-500 to-purple-300 transition-all hover:from-purple-600 hover:to-purple-400"
                    style={{
                      height: `${(d.pages / maxPages) * 100}%`,
                      minHeight: d.pages > 0 ? "4px" : "0",
                    }}
                    title={`${d.label}: ${d.pages}개`}
                  />
                </div>
                <p className="text-[10px] font-medium text-slate-500">
                  {d.label}
                </p>
                <p className="text-[9px] text-purple-600">
                  {d.pages > 0 ? d.pages : "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column: Template Ranking + Language Distribution */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Template Ranking */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
              <Palette className="h-5 w-5 text-[#a71d1d]" />
              인기 템플릿
            </h2>
            <Link
              href="/admin/templates"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#a71d1d]"
            >
              템플릿 관리 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {templateRanking.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              데이터 없음
            </div>
          ) : (
            <div className="space-y-3">
              {templateRanking.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded border font-mono text-xs font-bold ${
                          TEMPLATE_COLOR[t.code] ??
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {t.code}
                      </span>
                      <span className="font-medium text-slate-700">
                        {t.name}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">
                      {t.count}개
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#a71d1d] to-red-400"
                      style={{
                        width: `${(t.count / maxTemplateCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Language Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
              <Globe2 className="h-5 w-5 text-[#a71d1d]" />
              언어별 분포
            </h2>
            <span className="text-xs text-slate-500">
              총 {totalLangCount}개
            </span>
          </div>
          {totalLangCount === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              데이터 없음
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(languageCountsFinal.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => {
                  const meta =
                    LANGUAGE_META[lang] ?? { flag: "🏳️", label: lang };
                  const percent =
                    Math.round((count / totalLangCount) * 1000) / 10;
                  return (
                    <div key={lang} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{meta.flag}</span>
                          <span className="font-medium text-slate-700">
                            {meta.label}
                          </span>
                        </div>
                        <span className="font-mono text-slate-900">
                          {count}개 ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Top Users + Point Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Users */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
              <Crown className="h-5 w-5 text-amber-500" />
              상위 사용자 TOP 10
            </h2>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#a71d1d]"
            >
              전체 회원 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {topUsers.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              데이터 없음
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-12 px-3 py-2 text-left text-xs font-medium text-slate-600">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                      회원
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">
                      생성
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">
                      사용 포인트
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topUsers.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-xs text-slate-500">
                        {idx === 0
                          ? "🥇"
                          : idx === 1
                            ? "🥈"
                            : idx === 2
                              ? "🥉"
                              : idx + 1}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">
                          {u.name || "이름 없음"}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-purple-600">
                        {u.pages}개
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-amber-600">
                        {u.points.toLocaleString()}P
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Point Stats */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
            <Coins className="h-5 w-5 text-amber-500" />
            포인트 흐름
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3">
              <span className="text-emerald-700">💳 충전</span>
              <span className="font-mono font-bold text-emerald-900">
                +{pointStats.charged.toLocaleString()}P
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <span className="text-blue-700">🎁 가입 보너스</span>
              <span className="font-mono font-bold text-blue-900">
                +{pointStats.bonus.toLocaleString()}P
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
              <span className="text-red-700">📄 사용</span>
              <span className="font-mono font-bold text-red-900">
                -{pointStats.used.toLocaleString()}P
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-slate-700">↩️ 환불</span>
              <span className="font-mono font-bold text-slate-900">
                +{pointStats.refunded.toLocaleString()}P
              </span>
            </div>
            {pointStats.adjusted !== 0 && (
              <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                <span className="text-purple-700">⚙️ 관리자 조정</span>
                <span className="font-mono font-bold text-purple-900">
                  {pointStats.adjusted > 0 ? "+" : ""}
                  {pointStats.adjusted.toLocaleString()}P
                </span>
              </div>
            )}
            <div className="mt-4 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">보유 총합 (추정)</span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {(
                    pointStats.charged +
                    pointStats.bonus +
                    pointStats.refunded +
                    pointStats.adjusted -
                    pointStats.used
                  ).toLocaleString()}
                  P
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        📊 통계는 실시간으로 계산됩니다. 큰 데이터셋에서는 로딩이 다소
        지연될 수 있습니다.
      </div>
    </div>
  );
}
