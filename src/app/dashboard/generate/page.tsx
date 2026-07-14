import { createClient } from "@/lib/supabase/server";
import { Wand2, Package, Palette, Globe, Coins } from "lucide-react";
import Link from "next/link";

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
        .select("*")
        .eq("is_active", true)
        .order("code"),
      supabase.from("users").select("points").eq("id", user!.id).single(),
    ]);

  const points = profile?.points ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 font-serif text-3xl font-bold text-ink">
          <Wand2 className="h-8 w-8 text-brand" />
          상세페이지 만들기
        </h1>
        <p className="text-muted-foreground">
          4단계로 상세페이지가 완성됩니다.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-lg bg-ivory p-4">
        <div className="flex items-center gap-2 text-sm">
          <Coins className="h-4 w-4 text-brand" />
          <span>이 작업에 필요한 포인트: </span>
          <strong className="text-brand">30 P</strong>
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
        <GenerateWizard products={products} templates={templates || []} />
      )}
    </div>
  );
}

// Placeholder: 실제 Wizard 컴포넌트는 다음 Phase에서 구현
function GenerateWizard({
  products,
  templates,
}: {
  products: any[];
  templates: any[];
}) {
  return (
    <div className="rounded-xl border border-brand/10 bg-white p-8">
      <div className="mb-8 flex items-center justify-between">
        <StepIndicator step={1} label="상품 선택" active />
        <StepDivider />
        <StepIndicator step={2} label="스타일 선택" />
        <StepDivider />
        <StepIndicator step={3} label="언어 선택" />
        <StepDivider />
        <StepIndicator step={4} label="생성" />
      </div>

      <div className="text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          🔧 페이지 생성 마법사는 다음 업데이트에서 완성됩니다.
        </p>
        <p className="text-xs text-muted-foreground">
          Phase 5: AI 생성 엔진 구현 예정
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-brand/10 p-4">
          <Package className="mb-2 h-5 w-5 text-brand" />
          <p className="text-sm font-medium">등록된 상품</p>
          <p className="text-2xl font-bold text-brand">{products.length}개</p>
        </div>
        <div className="rounded-lg border border-brand/10 p-4">
          <Palette className="mb-2 h-5 w-5 text-brand" />
          <p className="text-sm font-medium">사용 가능 스타일</p>
          <p className="text-2xl font-bold text-brand">{templates.length}개</p>
        </div>
        <div className="rounded-lg border border-brand/10 p-4">
          <Globe className="mb-2 h-5 w-5 text-brand" />
          <p className="text-sm font-medium">지원 언어</p>
          <p className="text-2xl font-bold text-brand">4개</p>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  step,
  label,
  active,
}: {
  step: number;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={
          active
            ? "flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
            : "flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand/20 bg-white text-sm font-bold text-brand/50"
        }
      >
        {step}
      </div>
      <p
        className={
          active
            ? "mt-2 text-xs font-medium text-brand"
            : "mt-2 text-xs text-muted-foreground"
        }
      >
        {label}
      </p>
    </div>
  );
}

function StepDivider() {
  return <div className="mx-2 h-0.5 flex-1 bg-brand/10" />;
}
