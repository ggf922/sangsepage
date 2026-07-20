"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile 위젯 컴포넌트
 *
 * 사용법:
 *   <TurnstileWidget onVerify={(token) => setToken(token)} />
 *
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY가 없으면 위젯을 렌더링하지 않음
 * → 대신 상위 컴포넌트로 "disabled" 상태를 알려서 통과 처리.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (err: string) => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          action?: string;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (err: string) => void;
  onExpire?: () => void;
  action?: string;
  theme?: "light" | "dark" | "auto";
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SCRIPT_ID = "cf-turnstile-script";

let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Turnstile script load failed")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script load failed"));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  action = "signup",
  theme = "light",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "verified" | "error" | "disabled"
  >("loading");

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // sitekey 미설정 시: 개발 모드로 취급, 자동 통과
    if (!siteKey) {
      console.warn(
        "[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY not set. Bypassing widget (dev mode).",
      );
      setStatus("disabled");
      // 상위 폼이 진행할 수 있도록 더미 토큰 전달
      onVerify("dev-mode-no-turnstile");
      return;
    }

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme,
          callback: (token: string) => {
            setStatus("verified");
            onVerify(token);
          },
          "error-callback": (err: string) => {
            console.error("[Turnstile] Widget error:", err);
            setStatus("error");
            onError?.(err);
          },
          "expired-callback": () => {
            setStatus("ready");
            onExpire?.();
          },
        });

        widgetIdRef.current = id;
        setStatus("ready");
      })
      .catch((err) => {
        console.error("[Turnstile] Script load error:", err);
        setStatus("error");
        onError?.(err.message);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  // Dev 모드: 위젯 아예 렌더링 안 함
  if (status === "disabled") return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {status === "loading" && (
        <p className="text-xs text-muted-foreground">
          보안 확인 로딩 중...
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-destructive">
          보안 확인 로드 실패 — 새로고침 후 다시 시도해 주세요
        </p>
      )}
    </div>
  );
}
