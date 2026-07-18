"use client";

// ============================================================
// 상세페이지 수정 패널
// 3가지 모드: 카피만(5P) / 이미지만(10P) / 전체(10P)
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Type,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Wand2,
  ListChecks,
} from "lucide-react";

type EditMode = "copy_only" | "images_only" | "all" | "partial";

type CopySection = "hero" | "points" | "ingredients" | "maker" | "info";
type ImageSection = "hero_img" | "detail_img" | "extra_img";

interface CopySectionOption {
  code: CopySection;
  label: string;
  description: string;
  icon: string;
}
interface ImageSectionOption {
  code: ImageSection;
  label: string;
  description: string;
  icon: string;
  count: number; // 재생성될 이미지 장 수
}

const COPY_SECTIONS: CopySectionOption[] = [
  {
    code: "hero",
    label: "히어로 · 인트로",
    description: "상단 첫인상 문구 (뱃지·제목·서브·인트로 스토리)",
    icon: "🎬",
  },
  {
    code: "points",
    label: "핵심 셀링포인트",
    description: "⭐ 3~5개 특징 (icon · title · description)",
    icon: "⭐",
  },
  {
    code: "ingredients",
    label: "원재료 · 제조 과정",
    description: "원재료 소개 문구 + 제조/사용 단계 스토리",
    icon: "🌿",
  },
  {
    code: "maker",
    label: "만든 사람 · 시그니처",
    description: "브랜드 스토리·인용 + 마무리 문구",
    icon: "👥",
  },
  {
    code: "info",
    label: "제품 정보 · 배송",
    description: "spec_summary · 배송 안내",
    icon: "📋",
  },
];

const IMAGE_SECTIONS: ImageSectionOption[] = [
  {
    code: "hero_img",
    label: "메인 이미지",
    description: "히어로 컷 (상단 대표 이미지)",
    icon: "🖼️",
    count: 1,
  },
  {
    code: "detail_img",
    label: "상세 컷",
    description: "detail 3장 (와이드 · 매크로 · 극단 클로즈업)",
    icon: "📸",
    count: 3,
  },
  {
    code: "extra_img",
    label: "부가 컷",
    description: "원재료 · 제조과정 · 비교 · 라이프스타일 · 시그니처 5장",
    icon: "🌟",
    count: 5,
  },
];

const PARTIAL_COPY_COST = 3; // 카피 섹션 선택 시 정가 (섹션 몇 개든)
const PARTIAL_IMAGE_COST_PER_GROUP = 3; // 이미지 섹션 1그룹당

const MODES: Array<{
  code: EditMode;
  label: string;
  cost: number | null; // partial은 동적 계산이므로 null
  icon: React.ReactNode;
  description: string;
  detail: string;
  color: string;
}> = [
  {
    code: "partial",
    label: "선택 섹션만 수정",
    cost: null,
    icon: <ListChecks className="h-5 w-5" />,
    description: "원하는 섹션만 골라서 재생성",
    detail: "체크한 카피 섹션과 이미지 섹션만 다시 만듭니다. 나머지는 그대로 유지되어 포인트를 아낄 수 있습니다.",
    color: "brand",
  },
  {
    code: "copy_only",
    label: "카피만 새로 쓰기",
    cost: 5,
    icon: <Type className="h-5 w-5" />,
    description: "이미지는 유지, 문구만 새로 생성",
    detail: "제목·설명·특징 등 모든 텍스트를 GPT-4o mini로 다시 작성합니다. 이미지는 그대로 유지됩니다.",
    color: "blue",
  },
  {
    code: "images_only",
    label: "이미지만 새로 만들기",
    cost: 10,
    icon: <ImageIcon className="h-5 w-5" />,
    description: "카피는 유지, 이미지 6장 재생성",
    detail: "히어로·상세·성분·라이프스타일 등 이미지 9장을 Gemini Nano Banana로 새로 만듭니다.",
    color: "purple",
  },
  {
    code: "all",
    label: "카피 + 이미지 전체 재생성",
    cost: 10,
    icon: <Wand2 className="h-5 w-5" />,
    description: "완전히 새로운 결과물",
    detail: "GPT + Gemini로 카피와 이미지 모두 새로 만듭니다. 처음 생성한 것과 완전히 다른 결과물이 나옵니다.",
    color: "brand",
  },
];

interface Props {
  pageId: string;
  editCount: number;
  maxEdits: number;
  points: number;
}

export default function EditPanel({ pageId, editCount, maxEdits, points }: Props) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<EditMode>("partial");
  const [useProModel, setUseProModel] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // partial 모드에서 사용하는 선택 상태
  const [selectedCopySections, setSelectedCopySections] = useState<CopySection[]>([]);
  const [selectedImageSections, setSelectedImageSections] = useState<ImageSection[]>([]);

  const mode = MODES.find((m) => m.code === selectedMode)!;

  // 실제 차감 포인트 (partial은 동적 계산)
  const computedCost = (() => {
    if (mode.code === "partial") {
      let c = 0;
      if (selectedCopySections.length > 0) c += PARTIAL_COPY_COST;
      if (selectedImageSections.length > 0)
        c += selectedImageSections.length * PARTIAL_IMAGE_COST_PER_GROUP;
      return Math.max(c, 3);
    }
    return mode.cost as number;
  })();

  const partialHasSelection =
    selectedCopySections.length > 0 || selectedImageSections.length > 0;
  const canAfford = points >= computedCost;
  const remaining = maxEdits - editCount;

  const needsImages =
    selectedMode === "images_only" ||
    selectedMode === "all" ||
    (selectedMode === "partial" && selectedImageSections.length > 0);

  const toggleCopySection = (code: CopySection) => {
    setConfirmed(false);
    setSelectedCopySections((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };
  const toggleImageSection = (code: ImageSection) => {
    setConfirmed(false);
    setSelectedImageSections((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  async function handleSubmit() {
    if (selectedMode === "partial" && !partialHasSelection) {
      setError("최소 하나 이상의 섹션을 선택해주세요.");
      return;
    }
    if (!canAfford) {
      setError(`포인트가 부족합니다. (필요: ${computedCost}P / 보유: ${points}P)`);
      return;
    }

    setError(null);
    const noImages =
      selectedMode === "copy_only" ||
      (selectedMode === "partial" && selectedImageSections.length === 0);
    setProgress(
      noImages
        ? "AI 카피 재생성 중... (약 10초)"
        : "AI 재생성 중... (약 30~60초)"
    );

    startTransition(async () => {
      try {
        // 이미지 재생성 시 프로그레스 업데이트
        let progressTimer: any = null;
        if (needsImages) {
          progressTimer = setTimeout(() => {
            setProgress("이미지 생성 중... (약 30~60초)");
          }, 8000);
        }

        const res = await fetch(`/api/pages/${pageId}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: selectedMode,
            use_pro_model: useProModel,
            ...(selectedMode === "partial"
              ? {
                  copy_sections: selectedCopySections,
                  image_sections: selectedImageSections,
                }
              : {}),
          }),
        });

        if (progressTimer) clearTimeout(progressTimer);

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error ?? "재생성에 실패했습니다.");
          setProgress(null);
          return;
        }

        setProgress("완료! 결과 페이지로 이동합니다...");
        setTimeout(() => {
          router.push(`/dashboard/pages/${pageId}`);
          router.refresh();
        }, 1000);
      } catch (err: any) {
        setError(err?.message ?? "네트워크 오류가 발생했습니다.");
        setProgress(null);
      }
    });
  }

  return (
    <div className="rounded-xl border border-brand/10 bg-white p-6">
      <h2 className="mb-1 font-serif text-lg font-bold text-ink">
        어떻게 수정하시겠어요?
      </h2>
      <p className="mb-5 text-xs text-muted-foreground">
        수정 횟수는 페이지당 최대 {maxEdits}회까지 사용할 수 있으며, 카피/이미지 여부에 따라 포인트가 다릅니다.
      </p>

      {/* 모드 선택 */}
      <div className="mb-5 space-y-2">
        {MODES.map((m) => {
          const isSelected = selectedMode === m.code;
          const priceLabel =
            m.cost === null
              ? isSelected
                ? `${computedCost} P`
                : "선택형"
              : `${m.cost} P`;
          return (
            <button
              key={m.code}
              type="button"
              onClick={() => {
                setSelectedMode(m.code);
                setConfirmed(false);
              }}
              disabled={isPending}
              className={
                isSelected
                  ? "w-full rounded-lg border-2 border-brand bg-brand/5 p-4 text-left"
                  : "w-full rounded-lg border-2 border-brand/10 bg-white p-4 text-left hover:border-brand/30"
              }
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      isSelected
                        ? "flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white"
                        : "flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand"
                    }
                  >
                    {m.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">
                      {m.label}
                      {m.code === "partial" && (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          NEW · 절약
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.description}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    isSelected
                      ? "rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white"
                      : "rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand"
                  }
                >
                  {priceLabel}
                </span>
              </div>
              {isSelected && (
                <p className="mt-2 rounded bg-white p-2 text-xs text-muted-foreground">
                  {m.detail}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* 부분 수정 선택 패널 */}
      {selectedMode === "partial" && (
        <div className="mb-5 rounded-lg border border-brand/20 bg-ivory p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-ink">
                재생성할 섹션을 선택하세요
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                카피 섹션은 몇 개를 선택해도 <strong>+3P</strong> 정가.
                이미지 그룹은 <strong>1그룹당 +3P</strong>.
              </p>
            </div>
          </div>

          {/* 카피 섹션 */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Type className="h-3.5 w-3.5 text-brand" />
                카피 섹션
                {selectedCopySections.length > 0 && (
                  <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] text-brand">
                    +{PARTIAL_COPY_COST}P
                  </span>
                )}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {selectedCopySections.length}/{COPY_SECTIONS.length} 선택됨
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
              {COPY_SECTIONS.map((s) => {
                const checked = selectedCopySections.includes(s.code);
                return (
                  <label
                    key={s.code}
                    className={
                      checked
                        ? "flex cursor-pointer items-start gap-2 rounded-md border border-brand bg-brand/5 p-2.5 text-xs"
                        : "flex cursor-pointer items-start gap-2 rounded-md border border-brand/10 bg-white p-2.5 text-xs hover:border-brand/30"
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCopySection(s.code)}
                      className="mt-0.5 accent-brand"
                    />
                    <span className="flex-1">
                      <span className="mr-1">{s.icon}</span>
                      <strong className="text-ink">{s.label}</strong>
                      <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
                        {s.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 이미지 섹션 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <ImageIcon className="h-3.5 w-3.5 text-brand" />
                이미지 섹션
                {selectedImageSections.length > 0 && (
                  <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] text-brand">
                    +{selectedImageSections.length * PARTIAL_IMAGE_COST_PER_GROUP}P
                  </span>
                )}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {selectedImageSections.length}/{IMAGE_SECTIONS.length} 선택됨
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {IMAGE_SECTIONS.map((s) => {
                const checked = selectedImageSections.includes(s.code);
                return (
                  <label
                    key={s.code}
                    className={
                      checked
                        ? "flex cursor-pointer items-start gap-2 rounded-md border border-brand bg-brand/5 p-2.5 text-xs"
                        : "flex cursor-pointer items-start gap-2 rounded-md border border-brand/10 bg-white p-2.5 text-xs hover:border-brand/30"
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleImageSection(s.code)}
                      className="mt-0.5 accent-brand"
                    />
                    <span className="flex-1">
                      <span className="mr-1">{s.icon}</span>
                      <strong className="text-ink">{s.label}</strong>
                      <span className="ml-1.5 rounded bg-slate-100 px-1 py-0.5 text-[9px] text-slate-600">
                        {s.count}장
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
                        {s.description}
                      </span>
                    </span>
                    <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                      +3P
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {!partialHasSelection && (
            <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-700">
              최소 하나 이상의 섹션을 선택해주세요.
            </p>
          )}
        </div>
      )}

      {/* 이미지 모델 선택 (이미지 재생성 시만 표시) */}
      {needsImages && (
        <div className="mb-5 rounded-lg border border-brand/10 bg-ivory p-3">
          <div className="mb-2 flex items-center gap-1 text-xs font-medium text-ink">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            이미지 품질
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded border border-brand/10 bg-white p-2 text-xs">
              <input
                type="radio"
                name="model"
                checked={!useProModel}
                onChange={() => setUseProModel(false)}
                className="accent-brand"
              />
              <span>표준</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded border border-brand/10 bg-white p-2 text-xs">
              <input
                type="radio"
                name="model"
                checked={useProModel}
                onChange={() => setUseProModel(true)}
                className="accent-brand"
              />
              <span>
                프로{" "}
                <span className="rounded bg-brand/10 px-1 py-0.5 text-[10px] text-brand">
                  권장
                </span>
              </span>
            </label>
          </div>
        </div>
      )}

      {/* 요약 */}
      <div className="mb-5 rounded-lg border border-brand/20 bg-brand/5 p-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">차감</p>
            <p className="font-serif text-lg font-bold text-brand">
              {computedCost} P
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">차감 후 잔여</p>
            <p className="font-serif text-lg font-bold text-ink">
              {(points - computedCost).toLocaleString()} P
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">수정 잔여</p>
            <p className="font-serif text-lg font-bold text-ink">
              {remaining - 1}회
            </p>
          </div>
        </div>
      </div>

      {/* 경고 */}
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <div>
          <p className="mb-1 font-medium">주의사항</p>
          <ul className="list-inside list-disc space-y-0.5">
            <li>수정하면 이전 결과물은 사라지고 새 결과로 대체됩니다.</li>
            <li>AI 재생성은 매번 다른 결과가 나올 수 있습니다.</li>
            <li>실패 시 포인트는 자동 환불됩니다.</li>
          </ul>
        </div>
      </div>

      {/* 확인 체크박스 */}
      <label className="mb-4 flex cursor-pointer items-start gap-2 rounded-lg border border-brand/10 bg-ivory p-3 text-sm text-ink hover:bg-ivory/70">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 accent-brand"
        />
        <span>
          <strong>{computedCost}P가 차감</strong>되고, 수정 횟수가{" "}
          <strong>1회 소비</strong>됨을 이해했습니다.
        </span>
      </label>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {progress && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/5 p-4 text-sm text-brand">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <p className="font-medium">{progress}</p>
            <p className="mt-0.5 text-xs text-brand/70">
              창을 닫지 마세요.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          isPending ||
          !confirmed ||
          !canAfford ||
          (selectedMode === "partial" && !partialHasSelection)
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-40"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            재생성 중...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {computedCost}P로 재생성하기
          </>
        )}
      </button>
    </div>
  );
}
