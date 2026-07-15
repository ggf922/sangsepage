import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * sitemap.xml 동적 생성
 * https://88km.shop/sitemap.xml 로 접근 가능
 *
 * 공개 페이지만 등록합니다. 로그인 필요 페이지(/dashboard, /admin)는 제외.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/auth/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
