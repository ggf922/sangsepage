import { ImageResponse } from "next/og";

/**
 * 88km 소셜 공유용 OG 이미지 (동적 생성)
 * 카톡, 페이스북, 트위터, 슬랙 등에서 링크 공유 시 표시됩니다.
 * 표준: 1200x630 (Facebook 권장)
 */
export const alt = "88km - AI 상세페이지 자동 생성";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
          padding: 80,
          position: "relative",
        }}
      >
        {/* Decorative background dots */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 80,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#8B1A1A",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 90,
            left: 120,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#8B1A1A",
            opacity: 0.1,
          }}
        />

        {/* Logo circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              background: "#8B1A1A",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 800,
              color: "#FFF8E7",
              fontFamily: "serif",
              letterSpacing: -2,
              boxShadow: "0 10px 40px rgba(139, 26, 26, 0.25)",
            }}
          >
            88
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#8B1A1A",
              fontFamily: "serif",
              letterSpacing: -1,
            }}
          >
            88km
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: "#1a1a1a",
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: -2,
            marginBottom: 24,
          }}
        >
          AI로 5초만에
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: "#8B1A1A",
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: -2,
            marginBottom: 40,
          }}
        >
          프로급 상세페이지
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "#4a4a4a",
            textAlign: "center",
            fontWeight: 500,
            letterSpacing: -0.5,
          }}
        >
          5가지 스타일 × 4개국어 · 지금 가입하면 100P 무료
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            gap: 16,
            fontSize: 22,
            color: "#8B1A1A",
            fontWeight: 600,
            opacity: 0.7,
          }}
        >
          <span>🇰🇷 한국어</span>
          <span>·</span>
          <span>🇺🇸 English</span>
          <span>·</span>
          <span>🇨🇳 中文</span>
          <span>·</span>
          <span>🇯🇵 日本語</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
