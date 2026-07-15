import type { Metadata } from "next";
import { Noto_Sans_KR, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/context";
import { getSiteUrl } from "@/lib/site-url";

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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "상세페이지 자동 생성 | SangSePage",
    template: "%s | SangSePage",
  },
  description:
    "AI로 5초만에 프로급 상품 상세페이지를 자동 생성하세요. 김치·생활용품·전자제품·건강식품·화장품 5가지 전문 스타일 지원, 한국어/영어/중국어/일본어 4개 언어 대응.",
  keywords: [
    "상세페이지",
    "상품페이지",
    "AI 상세페이지",
    "AI 생성",
    "이커머스",
    "스마트스토어",
    "쿠팡",
    "상품 상세",
    "김치 상세페이지",
    "건강식품 상세페이지",
    "화장품 상세페이지",
    "다국어 상세페이지",
    "SangSePage",
    "상세페이지 자동 생성",
  ],
  authors: [{ name: "SangSePage" }],
  creator: "SangSePage",
  publisher: "SangSePage",
  applicationName: "SangSePage",
  category: "business",
  openGraph: {
    title: "상세페이지 자동 생성 | SangSePage",
    description:
      "AI로 5초만에 프로급 상품 상세페이지를 자동 생성. 5가지 스타일, 4개국어 지원.",
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US", "zh_CN", "ja_JP"],
    url: "/",
    siteName: "SangSePage",
  },
  twitter: {
    card: "summary_large_image",
    title: "상세페이지 자동 생성 | SangSePage",
    description:
      "AI로 5초만에 프로급 상품 상세페이지를 자동 생성. 지금 가입하면 100P 무료.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  verification: {
    // TODO: Google Search Console / Naver Search Advisor 인증 후 추가
    // google: "your-google-verification-code",
    // other: { "naver-site-verification": "your-naver-code" },
  },
};

// html lang 매핑
const HTML_LANG_MAP = {
  ko: "ko",
  en: "en",
  zh: "zh-CN",
  ja: "ja",
} as const;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = DICTIONARIES[locale];

  return (
    <html lang={HTML_LANG_MAP[locale]} suppressHydrationWarning>
      <body
        className={`${notoSansKR.variable} ${nanumMyeongjo.variable} font-sans antialiased`}
      >
        <I18nProvider locale={locale} dictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
