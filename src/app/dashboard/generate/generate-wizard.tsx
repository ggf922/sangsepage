"use client";

// ============================================================
// 상세페이지 생성 마법사 (4단계 위저드)
// 1. 상품 선택 → 2. 스타일 선택 → 3. 언어 선택 → 4. 생성
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Palette,
  Globe,
  Wand2,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { Language } from "@/lib/types";
import { POINT_COSTS } from "@/lib/types";

// 최소 필요 데이터 shape
interface ProductLite {
  id: string;
  name: string;
  category: string | null;
}

interface TemplateLite {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  thumbnail_url: string | null;
  design_tokens: any;
}

interface Props {
  products: ProductLite[];
  templates: TemplateLite[];
  points: number;
  tier?: "free" | "pro";
}

const LANGUAGES: Array<{ code: Language; label: string; flag: string; extraCost: number }> = [
  { code: "ko", label: "한국어", flag: "🇰🇷", extraCost: 0 },
  { code: "en", label: "English", flag: "🇺🇸", extraCost: POINT_COSTS.ADD_LANGUAGE },
  { code: "zh", label: "中文", flag: "🇨🇳", extraCost: POINT_COSTS.ADD_LANGUAGE },
  { code: "ja", label: "日本語", flag: "🇯🇵", extraCost: POINT_COSTS.ADD_LANGUAGE },
];

export default function GenerateWizard({ products, templates, points, tier = "free" }: Props) {
  const router = useRouter();
  const isProUser = tier === "pro";
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("ko");
  const [useProModel, setUseProModel] = useState(false);
  const [premiumMode, setPremiumMode] = useState(false); // 고급 모드 (+15P)
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);
  const selectedTemplate = templates.find((t) => t.id === templateId);
  const selectedLang = LANGUAGES.find((l) => l.code === language)!;

  // 실제로 부과되는 프리미엄 요금 (Pro 회원은 무료)
  const premiumSurcharge = premiumMode && !isProUser ? POINT_COSTS.PREMIUM_MODE_SURCHARGE : 0;
  // Self-Critique 실제 적용 여부 (Pro는 항상 ON, 아니면 체크박스 여부)
  const selfCritiqueOn = isProUser || premiumMode;

  const totalCost = POINT_COSTS.CREATE_PAGE + selectedLang.extraCost + premiumSurcharge;
  const canAfford = points >= totalCost;

  function next() {
    setError(null);
    if (step < 4) setStep(step + 1);
  }

  function prev() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  async function handleGenerate() {
    if (!productId || !templateId) {
      setError("상품과 스타일을 모두 선택해주세요.");
      return;
    }

    if (!canAfford) {
      setError(`포인트가 부족합니다. (필요: ${totalCost}P / 보유: ${points}P)`);
      return;
    }

    setError(null);
    setProgress("AI 카피 생성 중... (약 10초)");

    startTransition(async () => {
      try {
        // 프로그레스 시뮬레이션
        const progressTimer = setTimeout(() => {
          setProgress("이미지 6장 생성 중... (약 30~60초)");
        }, 8000);

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            template_id: templateId,
            language,
            use_pro_model: useProModel,
            premium_mode: premiumMode,
          }),
        });

        clearTimeout(progressTimer);

        // 응답을 먼저 텍스트로 받아서 JSON 파싱 안전하게 처리
        const responseText = await res.text();
        console.log("[generate] Response status:", res.status);
        console.log("[generate] Response body (first 500 chars):", responseText.slice(0, 500));

        let data: any;
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          // JSON이 아닌 응답 (Vercel 타임아웃, 에러 페이지 등)
          console.error("[generate] Non-JSON response:", responseText);

          // 특정 케이스별 사용자 친화 메시지
          let userMessage = "";
          if (res.status === 504 || responseText.includes("timeout") || responseText.includes("FUNCTION_INVOCATION_TIMEOUT")) {
            userMessage = "생성 시간이 초과되었습니다 (60초). 이미지 개수를 줄이거나 잠시 후 다시 시도해 주세요. 포인트는 자동 환불됩니다.";
          } else if (res.status === 413 || responseText.includes("PAYLOAD_TOO_LARGE")) {
            userMessage = "응답 크기가 너무 큽니다. 관리자에게 문의해 주세요.";
          } else if (res.status === 500 && responseText.includes("FUNCTION_INVOCATION_FAILED")) {
            userMessage = "서버 함수 실행에 실패했습니다. 잠시 후 다시 시도해 주세요.";
          } else if (res.status >= 500) {
            userMessage = `서버 오류가 발생했습니다 (${res.status}). 잠시 후 다시 시도해 주세요.`;
          } else {
            userMessage = `예상치 못한 응답 (${res.status}): ${responseText.slice(0, 150)}`;
          }

          setError(userMessage);
          setProgress(null);
          return;
        }

        if (!res.ok || !data.success) {
          // 서버가 명시적으로 환불 결과를 알려주는 경우 UI에 표시
          let errorMsg = data.error ?? "생성에 실패했습니다.";
          if (data.refunded === true) {
            errorMsg += `\n\n✅ ${totalCost}P가 자동 환불되었습니다. (현재 잔액: ${data.balance_after}P)`;
            // 페이지 상단의 포인트 표시 새로고침을 위해 router.refresh 시도
            try {
              router.refresh();
            } catch {}
          } else if (data.refunded === false) {
            errorMsg += `\n\n⚠️ 자동 환불에 실패했습니다. 관리자에게 문의해 주세요. (오류: ${data.refund_error ?? "알 수 없음"})`;
          }
          setError(errorMsg);
          setProgress(null);
          return;
        }

        setProgress("완료! 결과 페이지로 이동합니다...");
        // 결과 페이지로 이동
        router.push(`/dashboard/pages/${data.page_id}`);
      } catch (err: any) {
        console.error("[generate] Network error:", err);
        setError(err?.message ?? "네트워크 오류가 발생했습니다.");
        setProgress(null);
      }
    });
  }

  return (
    <div className="rounded-xl border border-brand/10 bg-white p-8">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between">
        <StepIndicator step={1} label="상품 선택" active={step >= 1} done={step > 1} />
        <StepDivider done={step > 1} />
        <StepIndicator step={2} label="스타일 선택" active={step >= 2} done={step > 2} />
        <StepDivider done={step > 2} />
        <StepIndicator step={3} label="언어 선택" active={step >= 3} done={step > 3} />
        <StepDivider done={step > 3} />
        <StepIndicator step={4} label="생성" active={step >= 4} />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* STEP 1: 상품 선택 */}
        {step === 1 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-ink">
              <Package className="h-5 w-5 text-brand" />
              어떤 상품의 상세페이지를 만드시겠어요?
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProductId(p.id)}
                  className={
                    productId === p.id
                      ? "flex items-center justify-between rounded-lg border-2 border-brand bg-brand/5 p-4 text-left"
                      : "flex items-center justify-between rounded-lg border-2 border-brand/10 bg-white p-4 text-left hover:border-brand/30"
                  }
                >
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    {p.category && (
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    )}
                  </div>
                  {productId === p.id && <Check className="h-5 w-5 text-brand" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: 스타일 선택 */}
        {step === 2 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-ink">
              <Palette className="h-5 w-5 text-brand" />
              어떤 스타일로 만드시겠어요?
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => {
                const isSelected = templateId === t.id;
                const primaryColor = t.design_tokens?.colors?.primary ?? "#a71d1d";
                const bgColor = t.design_tokens?.colors?.background ?? "#f4ede0";
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={
                      isSelected
                        ? "group flex flex-col overflow-hidden rounded-lg border-2 border-brand text-left"
                        : "group flex flex-col overflow-hidden rounded-lg border-2 border-brand/10 text-left hover:border-brand/30"
                    }
                  >
                    {/* 컬러 프리뷰 */}
                    <div
                      className="flex h-24 items-center justify-center"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div
                        className="rounded px-3 py-1 text-xs font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {t.category}
                      </div>
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-2 p-3">
                      <div>
                        <p className="text-sm font-bold text-ink">{t.name}</p>
                        {t.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {t.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: 언어 선택 */}
        {step === 3 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-ink">
              <Globe className="h-5 w-5 text-brand" />
              어떤 언어로 생성하시겠어요?
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={
                    language === l.code
                      ? "flex items-center justify-between rounded-lg border-2 border-brand bg-brand/5 p-4 text-left"
                      : "flex items-center justify-between rounded-lg border-2 border-brand/10 bg-white p-4 text-left hover:border-brand/30"
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{l.flag}</span>
                    <div>
                      <p className="font-medium text-ink">{l.label}</p>
                      {l.extraCost > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{l.extraCost}P 추가
                        </p>
                      )}
                    </div>
                  </div>
                  {language === l.code && <Check className="h-5 w-5 text-brand" />}
                </button>
              ))}
            </div>

            {/* 이미지 품질 선택 */}
            <div className="mt-6 rounded-lg bg-ivory p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
                <Sparkles className="h-4 w-4 text-brand" />
                이미지 품질
              </div>
              <label className="flex cursor-pointer items-start gap-2 rounded p-2 hover:bg-white">
                <input
                  type="radio"
                  name="model"
                  checked={!useProModel}
                  onChange={() => setUseProModel(false)}
                  className="mt-0.5 accent-brand"
                />
                <div>
                  <p className="text-sm font-medium">표준 (Nano Banana)</p>
                  <p className="text-xs text-muted-foreground">
                    빠른 생성, 무료 · 대부분의 상품에 충분
                  </p>
                </div>
              </label>
              <label className="mt-1 flex cursor-pointer items-start gap-2 rounded p-2 hover:bg-white">
                <input
                  type="radio"
                  name="model"
                  checked={useProModel}
                  onChange={() => setUseProModel(true)}
                  className="mt-0.5 accent-brand"
                />
                <div>
                  <p className="text-sm font-medium">
                    프로 (Nano Banana Pro){" "}
                    <span className="rounded bg-brand/10 px-1 py-0.5 text-xs font-bold text-brand">
                      권장
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    고품질, 텍스트 렌더링 우수 · 프리미엄 상품에 적합
                  </p>
                </div>
              </label>
            </div>

            {/* 고급 모드 (Self-Critique) 선택 */}
            <div className="mt-4 rounded-lg border-2 border-brand/20 bg-gradient-to-br from-brand/[0.03] to-transparent p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Sparkles className="h-4 w-4 text-brand" />
                  카피 품질 · 고급 모드 (Self-Critique)
                </div>
                {isProUser && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                    ★ Pro 자동 적용
                  </span>
                )}
              </div>
              <label
                className={
                  "flex cursor-pointer items-start gap-3 rounded p-2 " +
                  (isProUser ? "opacity-70" : "hover:bg-white")
                }
              >
                <input
                  type="checkbox"
                  checked={selfCritiqueOn}
                  disabled={isProUser}
                  onChange={(e) => setPremiumMode(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-brand"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">
                      AI가 카피를 스스로 재검수 (2-Pass)
                    </p>
                    {!isProUser && (
                      <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                        +15P
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    초고 → 자기 검수 → 최종본. 진부한 표현·과장·반복 어휘를 제거하고 후킹 문구를 강화합니다.
                    {isProUser
                      ? " Pro 회원은 항상 자동 적용됩니다."
                      : " 프리미엄·럭셔리 상품에 특히 효과적입니다."}
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: 생성 확인 */}
        {step === 4 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-ink">
              <Wand2 className="h-5 w-5 text-brand" />
              생성 준비 완료
            </h2>

            <div className="mb-6 space-y-3 rounded-lg bg-ivory p-5">
              <SummaryRow label="상품" value={selectedProduct?.name ?? "-"} />
              <SummaryRow label="스타일" value={selectedTemplate?.name ?? "-"} />
              <SummaryRow
                label="언어"
                value={`${selectedLang.flag} ${selectedLang.label}`}
              />
              <SummaryRow
                label="이미지 품질"
                value={useProModel ? "프로 (Nano Banana Pro)" : "표준 (Nano Banana)"}
              />
              <SummaryRow
                label="카피 품질"
                value={
                  selfCritiqueOn
                    ? isProUser
                      ? "고급 (Self-Critique · Pro 자동)"
                      : "고급 (Self-Critique · +15P)"
                    : "표준 (1-Pass)"
                }
                highlight={selfCritiqueOn}
              />
              <div className="mt-3 border-t border-brand/10 pt-3">
                <SummaryRow
                  label="차감 포인트"
                  value={`${totalCost} P`}
                  emphasize
                />
                <SummaryRow
                  label="생성 후 잔여"
                  value={`${points - totalCost} P`}
                />
              </div>
            </div>

            {!canAfford && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  포인트가 부족합니다. 마이페이지에서 충전 후 다시 시도해주세요.
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="whitespace-pre-line">{error}</div>
              </div>
            )}

            {progress && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/5 p-4 text-sm text-brand">
                <Loader2 className="h-5 w-5 animate-spin" />
                <div>
                  <p className="font-medium">{progress}</p>
                  <p className="mt-0.5 text-xs text-brand/70">
                    창을 닫지 마세요. 최대 2분까지 소요될 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-brand/10 pt-6">
        <button
          type="button"
          onClick={prev}
          disabled={step === 1 || isPending}
          className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm text-ink disabled:opacity-30 hover:bg-ivory"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            disabled={
              (step === 1 && !productId) ||
              (step === 2 && !templateId)
            }
            className="inline-flex items-center gap-1 rounded-lg bg-brand px-6 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-40"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending || !canAfford}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-40"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {totalCost}P로 생성하기
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function StepIndicator({
  step,
  label,
  active,
  done,
}: {
  step: number;
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={
          done
            ? "flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
            : active
              ? "flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
              : "flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand/20 bg-white text-sm font-bold text-brand/50"
        }
      >
        {done ? <Check className="h-5 w-5" /> : step}
      </div>
      <p
        className={
          active || done
            ? "mt-2 text-xs font-medium text-brand"
            : "mt-2 text-xs text-muted-foreground"
        }
      >
        {label}
      </p>
    </div>
  );
}

function StepDivider({ done }: { done?: boolean }) {
  return (
    <div className={done ? "mx-2 h-0.5 flex-1 bg-brand" : "mx-2 h-0.5 flex-1 bg-brand/10"} />
  );
}

function SummaryRow({
  label,
  value,
  emphasize,
  highlight,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          emphasize
            ? "font-serif text-lg font-bold text-brand"
            : highlight
              ? "font-semibold text-brand"
              : "font-medium text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
