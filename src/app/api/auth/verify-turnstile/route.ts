import { NextResponse } from "next/server";

/**
 * Cloudflare Turnstile 서버측 검증 엔드포인트
 *
 * 클라이언트에서 발급받은 토큰을 Cloudflare에 제출하여
 * 실제 사람인지 검증한 뒤 회원가입을 진행하기 위한 게이트.
 *
 * 환경변수:
 *   TURNSTILE_SECRET_KEY - Cloudflare Dashboard에서 발급
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY - 클라이언트용 (렌더링에 사용)
 *
 * 만약 TURNSTILE_SECRET_KEY가 설정되지 않으면 검증을 스킵함(로컬 개발 편의)
 * → 프로덕션에서는 반드시 설정해야 함.
 */

const CLOUDFLARE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

export async function POST(request: Request) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // 환경변수 미설정 시: 로컬 개발 환경에서만 통과시킴
  if (!secretKey) {
    console.warn(
      "[Turnstile] TURNSTILE_SECRET_KEY not set. Skipping verification (dev mode).",
    );
    return NextResponse.json({
      success: true,
      dev: true,
      message: "Turnstile disabled (no secret key)",
    });
  }

  let token: string;
  try {
    const body = await request.json();
    token = body?.token;
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid_request_body" },
      { status: 400 },
    );
  }

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { success: false, error: "missing_token" },
      { status: 400 },
    );
  }

  // 클라이언트 IP 추출 (있으면 검증에 함께 사용)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();

  // Cloudflare Turnstile 검증 요청
  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (clientIp) formData.append("remoteip", clientIp);

  try {
    const cfResponse = await fetch(CLOUDFLARE_VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    const result = (await cfResponse.json()) as TurnstileVerifyResponse;

    if (!result.success) {
      console.warn("[Turnstile] Verification failed:", result["error-codes"]);
      return NextResponse.json(
        {
          success: false,
          error: "verification_failed",
          codes: result["error-codes"] ?? [],
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      hostname: result.hostname,
      challenge_ts: result.challenge_ts,
    });
  } catch (err) {
    console.error("[Turnstile] Verification request error:", err);
    return NextResponse.json(
      { success: false, error: "cloudflare_request_failed" },
      { status: 502 },
    );
  }
}
