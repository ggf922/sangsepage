import { createClient } from "@/lib/supabase/server";
import { Wand2, Package, Coins } from "lucide-react";
import Link from "next/link";
import GenerateWizard from "./generate-wizard";

export default async function GeneratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: products }, { data: templates }, { data: profile }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, category")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("templates")
        .select("id, code, name, category, description, thumbnail_url, design_tokens")
        .eq("is_active", true)
        .order("code"),
      supabase.from("users").select("points, tier").eq("id", user!.id).single(),
    ]);

  const points = profile?.points ?? 0;
  const tier: "free" | "pro" = profile?.tier === "pro" ? "pro" : "free";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 font-serif text-3xl font-bold text-ink">
          <Wand2 className="h-8 w-8 text-brand" />
          상세페이지 만들기
        </h1>
        <p className="text-muted-foreground">
          4단계로 상세페이지가 완성됩니다. AI가 카피와 이미지를 자동 생성합니다.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-lg bg-ivory p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-brand" />
            <span>기본 요금:</span>
            <strong className="text-brand">30 P / 페이지</strong>
          </div>
          <span className="text-muted-foreground">&middot; 추가 언어 +20P</span>
          <span className="text-muted-foreground">&middot; 고급 모드 +15P</span>
          {tier === "pro" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
              ★ Pro 회원 · 고급 모드 자동 무료
            </span>
          )}
        </div>
        <div className="text-sm">
          잔여 포인트:{" "}
          <strong className="font-serif text-brand">
            {points.toLocaleString()} P
          </strong>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand/20 bg-white p-12 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-brand/30" />
          <h3 className="mb-2 font-serif text-xl font-bold text-ink">
            먼저 상품을 등록해주세요
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            상세페이지를 만들려면 상품 정보가 필요합니다.
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-dark"
          >
            <Package className="h-4 w-4" />
            상품 등록하기
          </Link>
        </div>
      ) : (
        <GenerateWizard
          products={products}
          templates={templates || []}
          points={points}
          tier={tier}
        />
      )}
    </div>
  );
}
