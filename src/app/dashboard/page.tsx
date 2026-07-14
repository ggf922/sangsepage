import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Package,
  FileText,
  Wand2,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user!.id)
    .single();

  // 통계 조회
  const [{ count: productCount }, { count: pageCount }, { data: recentPages }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
      supabase
        .from("generated_pages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
      supabase
        .from("generated_pages")
        .select("id, language, status, created_at, products(name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const displayName = profile?.name || user!.email?.split("@")[0] || "회원";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-ink">
          안녕하세요, <span className="text-brand">{displayName}</span>님 👋
        </h1>
        <p className="text-muted-foreground">
          오늘도 멋진 상세페이지를 만들어보세요.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="등록된 상품"
          value={productCount ?? 0}
          suffix="개"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="생성된 페이지"
          value={pageCount ?? 0}
          suffix="장"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="이번 달 사용 포인트"
          value={0}
          suffix="P"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/generate"
          className="group flex items-center justify-between rounded-xl border border-brand/10 bg-gradient-to-br from-brand to-brand-dark p-6 text-white transition hover:shadow-xl"
        >
          <div>
            <Wand2 className="mb-3 h-8 w-8" />
            <h3 className="mb-1 font-serif text-xl font-bold">
              상세페이지 생성
            </h3>
            <p className="text-sm opacity-90">
              5초만에 프로급 상세페이지 완성
            </p>
          </div>
          <ArrowRight className="h-6 w-6 transition group-hover:translate-x-1" />
        </Link>

        <Link
          href="/dashboard/products/new"
          className="group flex items-center justify-between rounded-xl border border-brand/10 bg-white p-6 transition hover:shadow-lg"
        >
          <div>
            <Package className="mb-3 h-8 w-8 text-brand" />
            <h3 className="mb-1 font-serif text-xl font-bold text-ink">
              상품 등록
            </h3>
            <p className="text-sm text-muted-foreground">
              먼저 상품 정보를 등록하세요
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-brand transition group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Recent Pages */}
      <div className="rounded-xl border border-brand/10 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink">
            최근 생성된 페이지
          </h2>
          <Link
            href="/dashboard/pages"
            className="text-sm text-brand hover:underline"
          >
            전체보기 →
          </Link>
        </div>

        {!recentPages || recentPages.length === 0 ? (
          <div className="py-12 text-center">
            <Sparkles className="mx-auto mb-3 h-12 w-12 text-brand/30" />
            <p className="mb-4 text-muted-foreground">
              아직 생성한 상세페이지가 없습니다.
            </p>
            <Link
              href="/dashboard/generate"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              첫 페이지 만들기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPages.map((page: any) => (
              <Link
                key={page.id}
                href={`/dashboard/pages/${page.id}`}
                className="flex items-center justify-between rounded-lg border border-transparent p-3 transition hover:border-brand/20 hover:bg-ivory"
              >
                <div>
                  <p className="font-medium text-ink">
                    {page.products?.name || "제목 없음"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="uppercase">{page.language}</span>
                    <span>·</span>
                    <span>{formatDate(page.created_at)}</span>
                  </div>
                </div>
                <span
                  className={
                    page.status === "completed"
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                      : "rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700"
                  }
                >
                  {page.status === "completed" ? "완료" : "작성중"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-brand/10 bg-white p-6">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
        {icon}
      </div>
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <p className="font-serif text-3xl font-bold text-ink">
        {value.toLocaleString()}
        <span className="ml-1 text-base font-normal text-muted-foreground">
          {suffix}
        </span>
      </p>
    </div>
  );
}
