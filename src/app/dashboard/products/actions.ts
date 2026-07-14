"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Ingredient,
  ProductExtraInfo,
  ProductFeature,
  ProductImage,
  SaleChannel,
} from "@/lib/types";

export interface ProductFormData {
  name: string;
  category?: string | null;
  origin?: string | null;
  price?: number | null;
  brand_tone?: string | null;
  sale_channels: SaleChannel[];
  ingredients: Ingredient[];
  features: ProductFeature[];
  extra_info: ProductExtraInfo;
  images: ProductImage[];
}

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/** 상품 생성 */
export async function createProduct(
  input: ProductFormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };
  if (!input.name?.trim()) return { success: false, error: "상품명은 필수입니다." };

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      category: input.category || null,
      origin: input.origin || null,
      price: input.price ?? null,
      brand_tone: input.brand_tone || null,
      sale_channels: input.sale_channels ?? [],
      ingredients: input.ingredients ?? [],
      features: input.features ?? [],
      extra_info: input.extra_info ?? {},
      images: input.images ?? [],
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createProduct]", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true, data: { id: data.id } };
}

/** 상품 수정 */
export async function updateProduct(
  id: string,
  input: ProductFormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };
  if (!input.name?.trim()) return { success: false, error: "상품명은 필수입니다." };

  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name.trim(),
      category: input.category || null,
      origin: input.origin || null,
      price: input.price ?? null,
      brand_tone: input.brand_tone || null,
      sale_channels: input.sale_channels ?? [],
      ingredients: input.ingredients ?? [],
      features: input.features ?? [],
      extra_info: input.extra_info ?? {},
      images: input.images ?? [],
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) {
    console.error("[updateProduct]", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${id}/edit`);
  return { success: true, data: { id: data.id } };
}

/** 상품 삭제 (이미지도 함께 삭제) */
export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };

  // 1) 상품 이미지 목록 가져오기
  const { data: product } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const images = (product?.images ?? []) as ProductImage[];

  // 2) Storage에서 이미지 파일 삭제
  const paths = images.map((img) => img.path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from("product-images").remove(paths);
  }

  // 3) DB에서 상품 삭제
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[deleteProduct]", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true, data: undefined };
}

/** 상품 이미지 삭제 (개별) */
export async function deleteProductImage(
  productId: string,
  imagePath: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };

  // Storage 삭제
  const { error: storageError } = await supabase.storage
    .from("product-images")
    .remove([imagePath]);

  if (storageError) {
    console.error("[deleteProductImage:storage]", storageError);
  }

  // DB에서 이미지 배열 갱신
  const { data: product } = await supabase
    .from("products")
    .select("images")
    .eq("id", productId)
    .eq("user_id", user.id)
    .single();

  if (product) {
    const images = (product.images ?? []) as ProductImage[];
    const updated = images.filter((img) => img.path !== imagePath);
    await supabase
      .from("products")
      .update({ images: updated })
      .eq("id", productId)
      .eq("user_id", user.id);
  }

  revalidatePath(`/dashboard/products/${productId}/edit`);
  return { success: true, data: undefined };
}

/** 생성 후 편집 페이지로 이동 (redirect wrapper) */
export async function createProductAndRedirect(input: ProductFormData) {
  const result = await createProduct(input);
  if (result.success) {
    redirect(`/dashboard/products/${result.data.id}/edit?created=1`);
  }
  return result;
}
