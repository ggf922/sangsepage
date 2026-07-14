import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const { data: users } = await admin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-slate-900">
          회원 관리
        </h1>
        <p className="text-slate-500">
          전체 회원 목록 (최근 100명)
        </p>
      </div>

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
                  {u.points?.toLocaleString()}P
                </td>
                <td className="p-4 text-right">{u.total_generated}장</td>
                <td className="p-4 text-sm text-slate-500">
                  {formatDate(u.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="p-12 text-center text-slate-500">
            아직 회원이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
