import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { FileText, Eye, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import PageActions from "./page-actions";

const STATUS_META: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  completed: { label: "완료", color: "#15803d", bgColor: "#dcfce7" },
  generating: { label: "생성중", color: "#0369a1", bgColor: "#dbeafe" },
  failed: { label: "실패", color: "#b91c1c", bgColor: "#fee2e2" },
  draft: { label: "임시저장", color: "#6b7280", bgColor: "#f3f4f6" },
};

const LANG_META: Record<string, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  zh: "🇨🇳",
  ja: "🇯🇵",
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status;

  const admin = createAdminClient();

  const [
    { count: totalCount },
    { count: completedCount },
    { count: generatingCount },
    { count: failedCount },
    { data: totalPointsData },
  ] = await Promise.all([
    admin.from("generated_pages").select("id", { count: "exact", head: true }),
    admin
      .from("generated_pages")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    admin
      .from("generated_pages")
      .select("id", { count: "exact", head: true })
      .eq("status", "generating"),
    admin
      .from("generated_pages")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed"),
    admin.from("generated_pages").select("points_used").eq("status", "completed"),
  ]);

  const totalPointsUsed =
    totalPointsData?.reduce((s, r) => s + (r.points_used ?? 0), 0) ?? 0;

  let query = admin
    .from("generated_pages")
    .select(
      `
      id, status, language, points_used, edit_count, max_edits, created_at, error_message,
      user:users!generated_pages_user_id_fkey(id, name, email),
      product:products(name, category),
      template:templates(name, code)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter && ["completed", "generating", "failed"].includes(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  const { data: pages, error } = await query;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="mb-2 flex items-center gap-2 font-serif text-3xl font-bold text-slate-900">
          <FileText className="h-8 w-8 text-brand" />
          생성 페이지 모니터링
        </h1>
        <p className="text-slate-500">
          전체 회원이 생성한 상세페이지를 모니터링합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <StatCard
          icon={<FileText className="h-5 w-5 text-slate-600" />}
          label="전체 생성"
          value={totalCount ?? 0}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="완료"
          value={completedCount ?? 0}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          label="진행중"
          value={generatingCount ?? 0}
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5 text-red-600" />}
          label="실패"
          value={failedCount ?? 0}
        />
      </div>

      {/* 포인트 사용 통계 */}
      <div className="mb-6 rounded-xl border border-brand/20 bg-gradient-to-r from-brand to-brand-dark p-5 text-white">
        <p className="text-sm opacity-80">누적 사용 포인트 (완료 페이지 기준)</p>
        <p className="font-serif text-3xl font-bold">
          {totalPointsUsed.toLocaleString()} P
        </p>
      </div>

      {/* 필터 탭 */}
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        <FilterTab
          href="/admin/pages"
          active={!statusFilter}
          count={totalCount ?? 0}
        >
          전체
        </FilterTab>
        <FilterTab
          href="/admin/pages?status=completed"
          active={statusFilter === "completed"}
          count={completedCount ?? 0}
        >
          완료
        </FilterTab>
        <FilterTab
          href="/admin/pages?status=generating"
          active={statusFilter === "generating"}
          count={generatingCount ?? 0}
        >
          진행중
        </FilterTab>
        <FilterTab
          href="/admin/pages?status=failed"
          active={statusFilter === "failed"}
          count={failedCount ?? 0}
        >
          실패
        </FilterTab>
      </div>

      {/* 목록 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          목록 불러오기 실패: {error.message}
        </div>
      )}

      {!pages || pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          해당 상태의 페이지가 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3 text-left">회원</th>
                <th className="p-3 text-left">상품</th>
                <th className="p-3 text-left">템플릿</th>
                <th className="p-3 text-left">언어</th>
                <th className="p-3 text-left">상태</th>
                <th className="p-3 text-left">포인트</th>
                <th className="p-3 text-left">수정</th>
                <th className="p-3 text-left">생성일</th>
                <th className="p-3 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((p: any) => {
                const meta = STATUS_META[p.status] ?? STATUS_META.draft;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-medium text-slate-900">
                        {p.user?.name ?? "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.user?.email}
                      </p>
                    </td>
                    <td className="p-3 text-slate-900">
                      {p.product?.name ?? (
                        <span className="text-slate-400 italic">삭제됨</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      {p.template?.name ?? "-"}
                    </td>
                    <td className="p-3 text-lg">
                      {LANG_META[p.language] ?? p.language}
                    </td>
                    <td className="p-3">
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ color: meta.color, backgroundColor: meta.bgColor }}
                      >
                        {meta.label}
                      </span>
                      {p.status === "failed" && p.error_message && (
                        <p
                          className="mt-1 max-w-[240px] truncate text-xs text-red-500"
                          title={p.error_message}
                        >
                          {p.error_message}
                        </p>
                      )}
                    </td>
                    <td className="p-3 font-medium text-brand">
                      {p.points_used}P
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      {p.edit_count}/{p.max_edits}
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="p-3">
                      <PageActions
                        pageId={p.id}
                        productName={p.product?.name ?? null}
                        userName={p.user?.name ?? null}
                        userEmail={p.user?.email ?? null}
                        status={p.status}
                        pointsUsed={p.points_used ?? 0}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        {icon}
        {label}
      </div>
      <p className="font-serif text-2xl font-bold text-slate-900">
        {value.toLocaleString()}
      </p>
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
      <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
        {count}
      </span>
    </Link>
  );
}
