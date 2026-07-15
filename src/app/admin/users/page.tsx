import { createClient, createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import UserActions from "./user-actions";
import { Search } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const roleFilter = params.role ?? "all";

  // 현재 로그인한 관리자 ID (본인 강등 방지용)
  const supabase = await createClient();
  const {
    data: { user: currentAdmin },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  let query = admin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    // 이메일 또는 이름 부분 일치
    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
  }
  if (roleFilter === "admin" || roleFilter === "user") {
    query = query.eq("role", roleFilter);
  }

  const { data: users } = await query;

  // 전체 통계
  const [{ count: totalCount }, { count: adminCount }] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }),
    admin.from("users").select("id", { count: "exact", head: true }).eq("role", "admin"),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-slate-900">
          회원 관리
        </h1>
        <p className="text-slate-500">
          전체 {totalCount ?? 0}명 · 관리자 {adminCount ?? 0}명
          {q && ` · '${q}' 검색 결과`}
        </p>
      </div>

      {/* 검색 & 필터 */}
      <form className="mb-6 flex flex-wrap items-center gap-3" method="GET">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="이메일 또는 이름으로 검색"
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <select
          name="role"
          defaultValue={roleFilter}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="all">전체 권한</option>
          <option value="admin">관리자만</option>
          <option value="user">일반만</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
        >
          검색
        </button>
        {(q || roleFilter !== "all") && (
          <a
            href="/admin/users"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            초기화
          </a>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                이름
              </th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                이메일
              </th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                권한
              </th>
              <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                포인트
              </th>
              <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                생성 페이지
              </th>
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                가입일
              </th>
              <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(users || []).map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{u.name || "-"}</td>
                <td className="p-4 text-sm text-slate-600">{u.email}</td>
                <td className="p-4">
                  {u.role === "admin" ? (
                    <span className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      관리자
                    </span>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      일반
                    </span>
                  )}
                </td>
                <td className="p-4 text-right font-serif font-bold">
                  {(u.points ?? 0).toLocaleString()}P
                </td>
                <td className="p-4 text-right">{u.total_generated ?? 0}장</td>
                <td className="p-4 text-sm text-slate-500">
                  {formatDate(u.created_at)}
                </td>
                <td className="p-4">
                  <UserActions
                    userId={u.id}
                    userEmail={u.email}
                    userName={u.name}
                    currentPoints={u.points ?? 0}
                    currentRole={u.role === "admin" ? "admin" : "user"}
                    isSelf={currentAdmin?.id === u.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="p-12 text-center text-slate-500">
            {q ? `'${q}' 검색 결과가 없습니다` : "아직 회원이 없습니다"}
          </div>
        )}
      </div>

      {users && users.length >= 200 && (
        <p className="mt-4 text-center text-xs text-slate-400">
          최대 200명까지 표시됩니다. 검색으로 좁혀주세요.
        </p>
      )}
    </div>
  );
}
