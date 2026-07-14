import type { Metadata } from "next";
import { Noto_Sans_KR, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-nanum-myeongjo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "상세페이지 자동 생성 | SangSePage",
  description:
    "AI로 5초만에 프로급 상품 상세페이지를 자동 생성하세요. 김치·생활용품·전자제품·건강식품·화장품 5가지 전문 스타일 지원, 한국어/영어/중국어/일본어 4개 언어 대응.",
  keywords: [
    "상세페이지",
    "상품페이지",
    "AI 생성",
    "이커머스",
    "스마트스토어",
    "쿠팡",
    "상품 상세",
  ],
  authors: [{ name: "SangSePage" }],
  openGraph: {
    title: "상세페이지 자동 생성 | SangSePage",
    description: "AI로 5초만에 프로급 상품 상세페이지를 자동 생성",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${notoSansKR.variable} ${nanumMyeongjo.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
