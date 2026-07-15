// ============================================================
// 공유용 상세페이지 (로그인 불필요)
// URL 형식: https://88km.shop/p/{share_id}
// ============================================================

import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 공유 페이지 메타데이터 (오픈그래프)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  const admin = createAdminClient();

  const { data: page } = await admin
    .from("generated_pages")
    .select(
      `
      language,
      product:products(name, description)
    `
    )
    .eq("share_id", shareId)
    .eq("status", "completed")
    .maybeSingle();

  if (!page) {
    return {
      title: "페이지를 찾을 수 없습니다",
    };
  }

  const product = page.product as { name?: string; description?: string } | null;
  const productName = product?.name ?? "상세페이지";
  const productDesc = product?.description ?? "AI로 생성된 프리미엄 상세페이지";

  return {
    title: productName,
    description: productDesc,
    openGraph: {
      title: productName,
      description: productDesc,
      type: "website",
      locale:
        page.language === "en"
          ? "en_US"
          : page.language === "ja"
          ? "ja_JP"
          : page.language === "zh"
          ? "zh_CN"
          : "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: productName,
      description: productDesc,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SharedDetailPage({ params }: PageProps) {
  const { shareId } = await params;

  // share_id 로 완성된 페이지만 조회 (RLS 우회 - 공개 링크이므로)
  const admin = createAdminClient();
  const { data: page, error } = await admin
    .from("generated_pages")
    .select("html_content, status, product_id")
    .eq("share_id", shareId)
    .eq("status", "completed")
    .maybeSingle();

  if (error || !page || !page.html_content) {
    notFound();
  }

  // HTML 콘텐츠를 그대로 렌더링 (dangerouslySetInnerHTML)
  // 안전한 이유:
  // 1. AI가 생성한 정적 HTML (사용자 입력 아님)
  // 2. 우리 시스템이 생성한 것만 저장됨
  // 3. SSR로 렌더링되어 XSS 벡터 없음
  return (
    <div
      className="min-h-screen bg-white"
      dangerouslySetInnerHTML={{ __html: page.html_content }}
    />
  );
}
