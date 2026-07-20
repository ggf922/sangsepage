import { ImageResponse } from "next/og";

/**
 * 88km 트위터 카드 이미지 (동적 생성)
 * Twitter/X에서 링크 공유 시 표시됩니다.
 * 표준: 1200x600 (summary_large_image)
 * 
 * Note: opengraph-image와 동일한 디자인을 사용하되 크기만 다릅니다.
 */
export const alt = "88km - AI 상세페이지 자동 생성";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #FFF8E7 0%, #F5EBD9 50%, #E8D9B8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          position: "relative",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              background: "#8B1A1A",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
              color: "#FFF8E7",
              fontFamily: "serif",
              letterSpacing: -2,
            }}
          >
            88
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#8B1A1A",
              fontFamily: "serif",
              letterSpacing: -1,
            }}
          >
            88km
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#1a1a1a",
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: -2,
            marginBottom: 20,
          }}
        >
          AI로 5초만에
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#8B1A1A",
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: -2,
            marginBottom: 32,
          }}
        >
          프로급 상세페이지
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#4a4a4a",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          5가지 스타일 × 4개국어 · 1장 4,500원(3$)
        </div>
      </div>
    ),
    { ...size }
  );
}
