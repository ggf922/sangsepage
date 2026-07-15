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
} from "lucide-react";

type EditMode = "copy_only" | "images_only" | "all";

const MODES: Array<{
  code: EditMode;
  label: string;
  cost: number;
  icon: React.ReactNode;
  description: string;
  detail: string;
  color: string;
}> = [
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
    detail: "히어로·상세·성분·라이프스타일 등 이미지 6장을 Gemini Nano Banana로 새로 만듭니다.",
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
  const [selectedMode, setSelectedMode] = useState<EditMode>("copy_only");
  const [useProModel, setUseProModel] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mode = MODES.find((m) => m.code === selectedMode)!;
  const canAfford = points >= mode.cost;
  const remaining = maxEdits - editCount;

  const needsImages = selectedMode === "images_only" || selectedMode === "all";

  async function handleSubmit() {
    if (!canAfford) {
      setError(`포인트가 부족합니다. (필요: ${mode.cost}P / 보유: ${points}P)`);
      return;
    }

    setError(null);
    setProgress(
      selectedMode === "copy_only"
        ? "AI 카피 재생성 중... (약 10초)"
        : "AI 재생성 중... (약 30~60초)"
    );

    startTransition(async () => {
      try {
        // 이미지 재생성 시 프로그레스 업데이트
        let progressTimer: any = null;
        if (needsImages) {
          progressTimer = setTimeout(() => {
            setProgress("이미지 6장 생성 중... (약 30~60초)");
          }, 8000);
        }

        const res = await fetch(`/api/pages/${pageId}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: selectedMode,
            use_pro_model: useProModel,
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
                    <p className="text-sm font-bold text-ink">{m.label}</p>
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
                  {m.cost} P
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
              {mode.cost} P
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-muted-foreground">차감 후 잔여</p>
            <p className="font-serif text-lg font-bold text-ink">
              {(points - mode.cost).toLocaleString()} P
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
          <strong>{mode.cost}P가 차감</strong>되고, 수정 횟수가{" "}
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
        disabled={isPending || !confirmed || !canAfford}
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
            {mode.cost}P로 재생성하기
          </>
        )}
      </button>
    </div>
  );
}
