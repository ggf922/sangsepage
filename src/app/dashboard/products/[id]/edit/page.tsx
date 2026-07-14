import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/product/product-form";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/dashboard/products/${id}/edit`);
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div>
      {created === "1" && (
        <div className="mx-auto mb-4 max-w-5xl rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          ✅ <strong>상품이 등록되었습니다.</strong> 이제 상세페이지를 생성하거나 정보를 계속 편집할 수 있습니다.
        </div>
      )}
      <ProductForm mode="edit" initialData={product as Product} />
    </div>
  );
}
