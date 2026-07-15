"use client";

// ============================================================
// 충전 신청 폼 (패키지 선택 + 커스텀 금액)
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { PointPackage } from "@/lib/types";
import { formatKRW } from "@/lib/utils";
import { createChargeRequest } from "./actions";

interface Props {
  packages: PointPackage[];
  defaultDepositor: string;
}

type Mode = "package" | "custom";

export default function ChargeForm({ packages, defaultDepositor }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("package");
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(
    packages[0]?.id ?? null
  );
  const [customAmount, setCustomAmount] = useState<number>(10000);
  const [depositor, setDepositor] = useState(defaultDepositor);
  const [contact, setContact] = useState("");
  const [memo, setMemo] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);

  // 최종 계산
  let finalPoints = 0;
  let finalAmount = 0;
  let packageIdToSend: string | null = null;

  if (mode === "package" && selectedPkg) {
    finalPoints = selectedPkg.points + selectedPkg.bonus_points;
    finalAmount = selectedPkg.price;
    packageIdToSend = selectedPkg.id;
  } else if (mode === "custom") {
    // 1원 = 0.01P → 100원 당 1P (기본 환율, 보너스 없음)
    finalPoints = Math.floor(customAmount / 100);
    finalAmount = customAmount;
  }

  const canSubmit =
    !isPending &&
    finalAmount > 0 &&
    finalPoints > 0 &&
    depositor.trim().length >= 2 &&
    agreed;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("모든 항목을 확인해주세요.");
      return;
    }

    startTransition(async () => {
      const res = await createChargeRequest({
        package_id: packageIdToSend,
        points: finalPoints,
        amount: finalAmount,
        depositor_name: depositor.trim(),
        contact: contact.trim() || undefined,
        memo: memo.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      setSuccess(true);
      // 성공 후 페이지 새로고침 → pendingRequests 반영
      setTimeout(() => {
        router.refresh();
        setSuccess(false);
        setDepositor(defaultDepositor);
        setContact("");
        setMemo("");
        setAgreed(false);
      }, 1500);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-xl border border-brand/10 bg-white"
    >
      <div className="border-b border-brand/10 bg-ivory px-5 py-3">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-ink">
          <Sparkles className="h-5 w-5 text-brand" />
          충전 신청
        </h2>
      </div>

      <div className="space-y-6 p-5">
        {/* 모드 선택 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("package")}
            className={
              mode === "package"
                ? "flex-1 rounded-lg border-2 border-brand bg-brand/5 px-4 py-2.5 text-sm font-medium text-brand"
                : "flex-1 rounded-lg border-2 border-brand/10 bg-white px-4 py-2.5 text-sm text-ink hover:border-brand/30"
            }
          >
            📦 패키지 선택 (보너스 포함)
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={
              mode === "custom"
                ? "flex-1 rounded-lg border-2 border-brand bg-brand/5 px-4 py-2.5 text-sm font-medium text-brand"
                : "flex-1 rounded-lg border-2 border-brand/10 bg-white px-4 py-2.5 text-sm text-ink hover:border-brand/30"
            }
          >
            💰 직접 금액 입력
          </button>
        </div>

        {/* 패키지 리스트 */}
        {mode === "package" && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              const totalPoints = pkg.points + pkg.bonus_points;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={
                    isSelected
                      ? "relative rounded-lg border-2 border-brand bg-brand/5 p-4 text-left"
                      : "relative rounded-lg border-2 border-brand/10 bg-white p-4 text-left hover:border-brand/30"
                  }
                >
                  {isSelected && (
                    <Check className="absolute right-2 top-2 h-4 w-4 text-brand" />
                  )}
                  <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                    {pkg.code}
                  </p>
                  <p className="font-serif text-lg font-bold text-ink">{pkg.name}</p>
                  <div className="my-3 border-t border-brand/10" />
                  <p className="text-sm">
                    <span className="font-serif text-2xl font-bold text-brand">
                      {totalPoints.toLocaleString()}
                    </span>{" "}
                    <span className="text-muted-foreground">P</span>
                  </p>
                  {pkg.bonus_points > 0 && (
                    <p className="mt-0.5 text-xs text-green-600">
                      기본 {pkg.points.toLocaleString()}P + 보너스{" "}
                      {pkg.bonus_points.toLocaleString()}P
                    </p>
                  )}
                  <p className="mt-2 font-serif text-lg font-bold text-ink">
                    {formatKRW(pkg.price)}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* 커스텀 금액 */}
        {mode === "custom" && (
          <div className="rounded-lg border border-brand/10 bg-ivory p-4">
            <label className="mb-2 block text-sm font-medium text-ink">
              입금 금액 (원)
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              {[10000, 30000, 50000, 100000, 300000, 500000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCustomAmount(v)}
                  className={
                    customAmount === v
                      ? "rounded border-2 border-brand bg-brand/5 px-3 py-1 text-xs font-medium text-brand"
                      : "rounded border border-brand/20 bg-white px-3 py-1 text-xs text-ink hover:border-brand/40"
                  }
                >
                  {(v / 10000).toLocaleString()}만원
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1000}
              max={10000000}
              step={1000}
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-brand/20 bg-white px-4 py-2.5 font-serif text-lg text-ink focus:border-brand focus:outline-none"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              직접 입력 시 <strong>100원 = 1P</strong> (보너스 없음). 패키지 선택이 더
              유리합니다.
            </p>
          </div>
        )}

        {/* 신청 요약 */}
        <div className="rounded-lg border border-brand/20 bg-brand/5 p-4">
          <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">입금 금액</p>
              <p className="font-serif text-xl font-bold text-ink">
                {formatKRW(finalAmount)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">지급 예정 포인트</p>
              <p className="font-serif text-xl font-bold text-brand">
                {finalPoints.toLocaleString()} P
              </p>
            </div>
          </div>
        </div>

        {/* 회원 정보 입력 */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              입금자명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={depositor}
              onChange={(e) => setDepositor(e.target.value)}
              maxLength={50}
              placeholder="입금하실 분의 성함"
              className="w-full rounded-lg border border-brand/20 bg-white px-4 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              반드시 실제 입금자명과 일치해야 합니다.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              연락처 (선택)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={30}
              placeholder="010-0000-0000"
              className="w-full rounded-lg border border-brand/20 bg-white px-4 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="관리자에게 전달할 메시지가 있다면 입력"
              className="w-full rounded-lg border border-brand/20 bg-white px-4 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        {/* 약관 동의 */}
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-brand/10 bg-ivory p-3 text-sm text-ink hover:bg-ivory/70">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-brand"
          />
          <span>
            입금 계좌 정보(<strong>케이뱅크 100 300 095296 큰바구니</strong>)를 확인했으며,{" "}
            <strong>신청 후 입금</strong>해야 함을 이해했습니다.
          </span>
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">신청 완료!</p>
              <p className="mt-0.5 text-xs">
                아래 <strong>케이뱅크 100 300 095296 큰바구니</strong>로 입금 부탁드립니다.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-40"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              신청 중...
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              {formatKRW(finalAmount)} 충전 신청하기
            </>
          )}
        </button>
      </div>
    </form>
  );
}
