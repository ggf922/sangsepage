import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Package,
  FileText,
  Wand2,
  User,
  LogOut,
  Coins,
  Shield,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 프로필 조회
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const points = profile?.points ?? 0;
  const displayName = profile?.name || user.email?.split("@")[0] || "회원";

  return (
    <div className="flex min-h-screen bg-ivory-light">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-brand/10 bg-white">
        <div className="border-b border-brand/10 p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand" />
            <span className="font-serif text-lg font-bold text-brand">
              SangSePage
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavLink href="/dashboard" icon={<LayoutDashboard />}>
            대시보드
          </NavLink>
          <NavLink href="/dashboard/products" icon={<Package />}>
            상품 관리
          </NavLink>
          <NavLink href="/dashboard/pages" icon={<FileText />}>
            생성된 페이지
          </NavLink>
          <NavLink
            href="/dashboard/generate"
            icon={<Wand2 />}
            highlight
          >
            + 새로 만들기
          </NavLink>
          <NavLink href="/dashboard/mypage" icon={<User />}>
            마이페이지
          </NavLink>

          {isAdmin && (
            <>
              <div className="mt-6 border-t border-brand/10 pt-4">
                <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-brand">
                  관리자
                </p>
                <NavLink href="/admin" icon={<Shield />}>
                  관리자 페이지
                </NavLink>
              </div>
            </>
          )}
        </nav>

        <div className="border-t border-brand/10 p-4">
          <div className="mb-3 rounded-lg bg-ivory p-3">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Coins className="h-3.5 w-3.5" />
              <span>잔여 포인트</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl font-bold text-brand">
                {points.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">P</span>
            </div>
            <Link
              href="/dashboard/mypage/charge"
              className="mt-2 block rounded-md bg-brand py-1.5 text-center text-xs font-medium text-white hover:bg-brand-dark"
            >
              충전하기
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        highlight
          ? "flex items-center gap-3 rounded-lg bg-brand px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink transition hover:bg-ivory hover:text-brand"
      }
    >
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {children}
    </Link>
  );
}
