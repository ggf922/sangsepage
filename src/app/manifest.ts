import type { MetadataRoute } from "next";

/**
 * Web App Manifest
 * PWA(Progressive Web App) 기능 및 모바일 브라우저 통합에 사용됩니다.
 * https://88km.shop/manifest.webmanifest 로 접근 가능
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "88km - AI 상세페이지 자동 생성",
    short_name: "88km",
    description:
      "AI로 5초만에 프로급 상품 상세페이지를 자동 생성하세요. 5가지 스타일, 4개국어 지원.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8E7",
    theme_color: "#8B1A1A",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    lang: "ko-KR",
    categories: ["business", "productivity", "shopping"],
  };
}
