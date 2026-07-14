import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Package, Plus, Edit, Sparkles, ImageIcon } from "lucide-react";
import { formatDate, formatKRW } from "@/lib/utils";
import type { Product, ProductImage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const list = (products ?? []) as Product[];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-serif text-3xl font-bold text-ink">
            상품 관리
          </h1>
          <p className="text-muted-foreground">
            상세페이지를 만들 상품 정보를 등록하고 관리하세요. ({list.length}개)
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 font-medium text-white hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          상품 추가
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand/20 bg-white p-12 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-brand/30" />
          <h3 className="mb-2 font-serif text-xl font-bold text-ink">
            아직 등록된 상품이 없습니다
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            첫 상품을 등록하고 AI로 상세페이지를 만들어보세요.
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />첫 상품 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => {
            const mainImage =
              (product.images as ProductImage[])?.find((i) => i.role === "main") ||
              (product.images as ProductImage[])?.[0];
            return (
              <div
                key={product.id}
                className="group overflow-hidden rounded-xl border border-brand/10 bg-white transition hover:shadow-lg"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-ivory">
                  {mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mainImage.url}
                      alt={product.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-brand/30" />
                  )}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                      +{product.images.length - 1}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-1 truncate font-medium text-ink">{product.name}</h3>
                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    {product.category && (
                      <span className="rounded-full bg-ivory px-2 py-0.5 text-[10px] font-medium">
                        {product.category}
                      </span>
                    )}
                    <span>{formatDate(product.created_at)}</span>
                  </div>
                  {product.price && (
                    <div className="mb-3 font-serif text-lg font-bold text-brand">
                      {formatKRW(product.price)}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md border border-brand/20 py-1.5 text-xs font-medium text-brand hover:bg-brand hover:text-white"
                    >
                      <Edit className="h-3 w-3" />
                      수정
                    </Link>
                    <Link
                      href={`/dashboard/generate?product=${product.id}`}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
                    >
                      <Sparkles className="h-3 w-3" />
                      페이지 생성
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
