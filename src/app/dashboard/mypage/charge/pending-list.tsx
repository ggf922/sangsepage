"use client";

// ============================================================
// 대기 중인 충전 신청 목록 (회원 본인용)
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, X, Loader2, Copy, Check } from "lucide-react";
import type { ChargeRequest } from "@/lib/types";
import { BANK_ACCOUNT } from "@/lib/types";
import { formatKRW, formatDate } from "@/lib/utils";
import { cancelChargeRequest } from "./actions";

interface Props {
  requests: ChargeRequest[];
}

export default function PendingList({ requests }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCancel(id: string) {
    if (!confirm("이 충전 신청을 취소하시겠습니까?")) return;
    startTransition(async () => {
      const res = await cancelChargeRequest(id);
      if (!res.success) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  async function copyAccount(id: string) {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT.fullText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert(BANK_ACCOUNT.fullText);
    }
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div
          key={req.id}
          className="rounded-xl border border-blue-200 bg-blue-50/50 p-4"
        >
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  입금 대기중
                </p>
                <p className="text-xs text-blue-700">
                  {formatDate(req.created_at)} 신청
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCancel(req.id)}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
              신청 취소
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-blue-100 bg-white p-3">
              <p className="mb-0.5 text-xs text-muted-foreground">입금해야 할 금액</p>
              <p className="font-serif text-lg font-bold text-brand">
                {formatKRW(req.amount)}
              </p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-white p-3">
              <p className="mb-0.5 text-xs text-muted-foreground">지급 예정</p>
              <p className="font-serif text-lg font-bold text-ink">
                {req.points.toLocaleString()} P
              </p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-white p-3">
              <p className="mb-0.5 text-xs text-muted-foreground">입금자명</p>
              <p className="font-medium text-ink">{req.depositor_name}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-white p-3">
            <div>
              <p className="text-xs text-muted-foreground">아래 계좌로 입금해주세요</p>
              <p className="font-mono text-sm font-bold text-ink">
                {BANK_ACCOUNT.fullText}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyAccount(req.id)}
              className="inline-flex items-center gap-1 rounded border border-brand/20 bg-white px-2 py-1 text-xs text-brand hover:bg-brand/5"
            >
              {copiedId === req.id ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  계좌 복사
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
