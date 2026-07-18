"use client";

// ============================================================
// 관리자 페이지 목록 액션 (삭제)
// ============================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  pageId: string;
  productName: string | null;
  userName: string | null;
  userEmail: string | null;
  status: string;
  pointsUsed: number;
}

export default function PageActions({
  pageId,
  productName,
  userName,
  userEmail,
  status,
  pointsUsed,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  const handleDelete = async () => {
    const label = productName ?? "(상품 삭제됨)";
    const owner = userName || userEmail || "-";
    const confirmMsg =
      `⚠️ 다음 생성 페이지를 정말 삭제하시겠습니까?\n\n` +
      `• 상품: ${label}\n` +
      `• 회원: ${owner}\n` +
      `• 상태: ${status}\n` +
      `• 사용 포인트: ${pointsUsed}P\n\n` +
      `※ 이 작업은 되돌릴 수 없으며, 회원에게 포인트가 자동 환불되지 않습니다.`;

    if (!confirm(confirmMsg)) return;

    setMessage("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "DELETE",
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        /* noop */
      }

      if (!res.ok) {
        const err = data?.error ?? `삭제 실패 (HTTP ${res.status})`;
        alert(`❌ ${err}`);
        setMessage(err);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
        title="이 생성 페이지 삭제"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            삭제중
          </>
        ) : (
          <>
            <Trash2 className="h-3 w-3" />
            삭제
          </>
        )}
      </button>
      {message && !isPending && (
        <span className="ml-2 text-[10px] text-red-500">{message}</span>
      )}
    </div>
  );
}
