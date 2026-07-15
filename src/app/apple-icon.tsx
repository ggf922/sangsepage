import { ImageResponse } from "next/og";

/**
 * iOS Safari 홈 화면 추가 시 사용되는 앱 아이콘
 * 180x180이 iOS 표준
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#8B1A1A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontSize: 124,
          fontWeight: 700,
          color: "#FFF8E7",
          letterSpacing: -4,
          position: "relative",
        }}
      >
        {/* Sparkle accent */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 28,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#FFF8E7",
            opacity: 0.5,
          }}
        />
        S
      </div>
    ),
    { ...size }
  );
}
