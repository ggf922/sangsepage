import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Palette,
  Users,
  FileText,
  Coins,
  BarChart3,
  ArrowLeft,
  Wallet,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // 대기중인 충전 신청 카운트 (사이드바 뱃지용)
  const admin = createAdminClient();
  const { count: pendingChargeCount } = await admin
    .from("charge_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-900 text-white">
        <div className="border-b border-slate-800 p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand/20 px-3 py-1 text-xs font-medium">
            🛡️ 관리자
          </div>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-brand" />
            <span className="font-serif font-bold">SangSePage Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <AdminNavLink href="/admin" icon={<LayoutDashboard />}>
            대시보드
          </AdminNavLink>
          <AdminNavLink href="/admin/templates" icon={<Palette />}>
            템플릿 관리
          </AdminNavLink>
          <AdminNavLink href="/admin/users" icon={<Users />}>
            회원 관리
          </AdminNavLink>
          <AdminNavLink href="/admin/pages" icon={<FileText />}>
            생성 페이지 모니터링
          </AdminNavLink>
          <AdminNavLink
            href="/admin/charges"
            icon={<Wallet />}
            badge={pendingChargeCount ?? 0}
          >
            충전 승인
          </AdminNavLink>
          <AdminNavLink href="/admin/points" icon={<Coins />}>
            포인트 상품 관리
          </AdminNavLink>
          <AdminNavLink href="/admin/analytics" icon={<BarChart3 />}>
            통계
          </AdminNavLink>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            사용자 모드로
          </Link>
        </div>
      </aside>

      <main className="ml-64 flex-1">{children}</main>
    </div>
  );
}

function AdminNavLink({
  href,
  icon,
  children,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
    >
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <span className="flex-1">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
