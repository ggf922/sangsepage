"use client";

// ============================================================
// 관리자 승인/거부 버튼 (Modal 포함)
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { formatKRW } from "@/lib/utils";
import { approveChargeRequest, rejectChargeRequest } from "./actions";

interface Props {
  requestId: string;
  depositorName: string;
  amount: number;
  points: number;
  userName: string;
}

export default function ChargeActionButtons({
  requestId,
  depositorName,
  amount,
  points,
  userName,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "approve" | "reject">("none");
  const [adminMemo, setAdminMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveChargeRequest(requestId, adminMemo);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setMode("none");
      setAdminMemo("");
      router.refresh();
    });
  }

  function handleReject() {
    setError(null);
    if (!adminMemo.trim()) {
      setError("거부 사유를 입력해주세요.");
      return;
    }
    startTransition(async () => {
      const res = await rejectChargeRequest(requestId, adminMemo);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setMode("none");
      setAdminMemo("");
      router.refresh();
    });
  }

  if (mode === "none") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("approve")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          입금 확인 승인
        </button>
        <button
          type="button"
          onClick={() => setMode("reject")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4" />
          거부
        </button>
        <span className="ml-auto text-xs text-slate-500">
          입금 확인 후 클릭하세요
        </span>
      </div>
    );
  }

  // Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="font-serif text-lg font-bold text-slate-900">
            {mode === "approve" ? "🟢 충전 승인" : "🔴 신청 거부"}
          </h3>
          <button
            type="button"
            onClick={() => {
              setMode("none");
              setError(null);
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="mb-1">
              <span className="text-slate-500">회원:</span>{" "}
              <span className="font-medium">{userName}</span>
            </p>
            <p className="mb-1">
              <span className="text-slate-500">입금자명:</span>{" "}
              <span className="font-medium">{depositorName}</span>
            </p>
            <p className="mb-1">
              <span className="text-slate-500">입금액:</span>{" "}
              <span className="font-medium">{formatKRW(amount)}</span>
            </p>
            <p>
              <span className="text-slate-500">지급 예정:</span>{" "}
              <span className="font-bold text-brand">
                {points.toLocaleString()} P
              </span>
            </p>
          </div>

          {mode === "approve" ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <p className="mb-1 font-medium">
                ⚠️ 케이뱅크 계좌에 실제 <strong>{formatKRW(amount)}</strong>이(가)
                입금되었는지 확인하셨나요?
              </p>
              <p className="text-xs">
                승인 즉시 회원에게 <strong>{points.toLocaleString()}P</strong>가 지급되며,
                취소할 수 없습니다.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              거부 시 회원에게 사유가 전달됩니다. 명확한 사유를 입력해주세요.
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {mode === "approve" ? "관리자 메모 (선택)" : "거부 사유 *"}
            </label>
            <textarea
              value={adminMemo}
              onChange={(e) => setAdminMemo(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={
                mode === "approve"
                  ? "확인 시각, 특이사항 등"
                  : "예: 입금자명 불일치, 금액 오차, 미입금 등"
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("none");
                setError(null);
                setAdminMemo("");
              }}
              disabled={isPending}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              취소
            </button>
            {mode === "approve" ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {points.toLocaleString()}P 지급 확정
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReject}
                disabled={isPending || !adminMemo.trim()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    거부 확정
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
