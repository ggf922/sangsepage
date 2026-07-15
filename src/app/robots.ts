import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * robots.txt 동적 생성
 * https://88km.shop/robots.txt 로 접근 가능
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",           // 관리자 페이지 크롤링 금지
          "/dashboard/",       // 로그인 필요 페이지
          "/api/",             // API 엔드포인트
          "/auth/callback",    // 인증 콜백
        ],
      },
      // AI 크롤러 (선택적으로 허용/차단)
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
