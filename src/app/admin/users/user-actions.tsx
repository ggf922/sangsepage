"use client";

// ============================================================
// 관리자 회원 관리 액션 (포인트 지급/차감, 역할 변경)
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Coins, ShieldCheck, ShieldOff, X } from "lucide-react";

interface UserActionsProps {
  userId: string;
  userEmail: string;
  userName: string | null;
  currentPoints: number;
  currentRole: "user" | "admin";
  isSelf: boolean; // 관리자 본인인지 (본인 admin 해제 불가)
}

export default function UserActions({
  userId,
  userEmail,
  userName,
  currentPoints,
  currentRole,
  isSelf,
}: UserActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleAdjust = async (delta: number) => {
    setMessage("");
    const finalAmount = delta;
    if (!finalAmount || finalAmount === 0) {
      setMessage("금액을 입력하세요");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/adjust-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          description: description || `관리자 ${finalAmount > 0 ? "지급" : "차감"}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${data.error ?? "실패"}`);
        return;
      }
      setMessage(`✅ ${finalAmount > 0 ? "+" : ""}${finalAmount}P 처리 완료 (잔액: ${data.balance_after}P)`);
      setAmount("");
      setDescription("");
      router.refresh();
    });
  };

  const handleRoleToggle = async () => {
    if (!confirm(
      currentRole === "admin"
        ? `${userEmail}의 관리자 권한을 해제하시겠습니까?`
        : `${userEmail}을 관리자로 승격하시겠습니까?`
    )) {
      return;
    }
    startTransition(async () => {
      const newRole = currentRole === "admin" ? "user" : "admin";
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ ${data.error ?? "실패"}`);
        return;
      }
      router.refresh();
    });
  };

  const parsedAmount = parseInt(amount, 10);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setModalOpen(true)}
          disabled={isPending}
          className="rounded-md bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/20 disabled:opacity-50"
          title="포인트 지급/차감"
        >
          <Coins className="inline h-3 w-3" /> 포인트
        </button>
        {!isSelf && (
          <button
            onClick={handleRoleToggle}
            disabled={isPending}
            className={`rounded-md px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
              currentRole === "admin"
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title={currentRole === "admin" ? "관리자 해제" : "관리자 승격"}
          >
            {currentRole === "admin" ? (
              <>
                <ShieldOff className="inline h-3 w-3" /> 강등
              </>
            ) : (
              <>
                <ShieldCheck className="inline h-3 w-3" /> 승격
              </>
            )}
          </button>
        )}
      </div>

      {/* 포인트 조정 모달 */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  포인트 지급/차감
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {userName ?? "-"} · {userEmail}
                </p>
                <p className="mt-1 text-sm font-medium text-brand">
                  현재 잔액: {currentPoints.toLocaleString()}P
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  포인트 (양수만 입력, 아래 버튼으로 지급/차감 선택)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="예: 100"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  사유 (선택, 유저 거래내역에 남음)
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 이벤트 보너스, 오류 보상 등"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => isValidAmount && handleAdjust(parsedAmount)}
                  disabled={!isValidAmount || isPending}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  + {isValidAmount ? parsedAmount.toLocaleString() : "0"}P 지급
                </button>
                <button
                  onClick={() => isValidAmount && handleAdjust(-parsedAmount)}
                  disabled={!isValidAmount || isPending || parsedAmount > currentPoints}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  - {isValidAmount ? parsedAmount.toLocaleString() : "0"}P 차감
                </button>
              </div>

              {parsedAmount > currentPoints && (
                <p className="text-xs text-red-600">
                  차감 금액이 현재 잔액({currentPoints}P)보다 큽니다
                </p>
              )}

              {message && (
                <p className={`text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
