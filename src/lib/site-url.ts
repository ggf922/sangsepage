/**
 * 앱의 사이트 URL을 안전하게 반환합니다.
 *
 * 우선순위:
 * 1. NEXT_PUBLIC_SITE_URL (프로덕션 커스텀 도메인)
 * 2. NEXT_PUBLIC_VERCEL_URL (Vercel 자동 주입, Preview 배포용)
 * 3. window.location.origin (클라이언트 환경)
 * 4. http://localhost:3000 (SSR 로컬 개발 fallback)
 *
 * 이메일 인증 링크, OAuth 리다이렉트, OG 이미지 URL 등에 사용됩니다.
 */
export function getSiteUrl(): string {
  // 1. 명시적으로 설정된 사이트 URL (최우선)
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  // 2. Vercel 배포 자동 URL (Preview 브랜치 배포 등)
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  // 3. 클라이언트 환경: window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 4. 로컬 개발 fallback
  return "http://localhost:3000";
}

/**
 * 사이트 URL 기반으로 절대 경로를 만듭니다.
 * @example getAbsoluteUrl("/auth/callback") → "https://88km.shop/auth/callback"
 */
export function getAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
