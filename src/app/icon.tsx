import { ImageResponse } from "next/og";

/**
 * SangSePage 동적 파비콘
 * Next.js 15 App Router가 자동으로 /icon.png으로 서빙합니다.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 6,
          fontFamily: "serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#FFF8E7",
          letterSpacing: -1,
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
