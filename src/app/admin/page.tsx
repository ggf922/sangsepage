import { createClient } from "@/lib/supabase/server";
import { Users, FileText, Palette, Coins } from "lucide-react";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: pageCount },
    { count: templateCount },
    { count: productCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("generated_pages").select("*", { count: "exact", head: true }),
    supabase
      .from("templates")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("products").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-slate-900">
          관리자 대시보드
        </h1>
        <p className="text-slate-500">전체 서비스 현황을 확인합니다.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
          icon={<Coins className="h-5 w-5" />}
          label="등록 상품"
          value={productCount ?? 0}
        />
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
