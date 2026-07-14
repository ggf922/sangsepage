import { createAdminClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/utils";
import { Coins } from "lucide-react";

export default async function AdminPointsPage() {
  const admin = createAdminClient();
  const { data: packages } = await admin
    .from("point_packages")
    .select("*")
    .order("display_order");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-slate-900">
          포인트 상품 관리
        </h1>
        <p className="text-slate-500">
          사용자가 충전할 수 있는 포인트 패키지를 관리합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(packages || []).map((pkg: any) => (
          <div
            key={pkg.id}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <Coins className="mb-3 h-6 w-6 text-brand" />
            <h3 className="mb-1 font-serif text-lg font-bold text-slate-900">
              {pkg.name}
            </h3>
            <p className="mb-3 text-xs text-slate-500">{pkg.code}</p>
            <div className="mb-3 space-y-1 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">지급 포인트</span>
                <span className="font-medium">
                  {pkg.points.toLocaleString()}P
                </span>
              </div>
              {pkg.bonus_points > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>보너스</span>
                  <span className="font-medium">
                    +{pkg.bonus_points.toLocaleString()}P
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold">
                <span>총 지급</span>
                <span className="text-brand">
                  {(pkg.points + pkg.bonus_points).toLocaleString()}P
                </span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs text-slate-500">판매가</p>
              <p className="font-serif text-2xl font-bold text-slate-900">
                {formatKRW(pkg.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {(!packages || packages.length === 0) && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          DB 마이그레이션을 실행해주세요.
        </p>
      )}
    </div>
  );
}
