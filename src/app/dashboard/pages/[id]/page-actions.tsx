"use client";

// ============================================================
// 상세페이지 결과 액션 버튼들 (다운로드/공유/수정)
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { Download, Share2, Edit, Check, Copy } from "lucide-react";

interface Props {
  pageId: string;
  shareId: string | null;
  editCount: number;
  maxEdits: number;
}

export default function PageActions({
  pageId,
  shareId,
  editCount,
  maxEdits,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const canEdit = editCount < maxEdits;
  const remainingEdits = maxEdits - editCount;

  async function handleCopyShare() {
    if (!shareId) return;
    const shareUrl = `${window.location.origin}/p/${shareId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(shareUrl); // Fallback
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/download`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "다운로드 실패");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `detail-page-${pageId}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`다운로드 실패: ${err?.message ?? "알 수 없는 오류"}`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopyShare}
        disabled={!shareId}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-ivory disabled:opacity-40"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            복사됨
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            공유 링크
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-ivory disabled:opacity-40"
      >
        <Download className="h-4 w-4" />
        {downloading ? "다운로드 중..." : "HTML 다운로드"}
      </button>

      {canEdit ? (
        <Link
          href={`/dashboard/pages/${pageId}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          <Edit className="h-4 w-4" />
          수정하기 (10P · {remainingEdits}회 남음)
        </Link>
      ) : (
        <button
          type="button"
          disabled
          title="수정 횟수를 모두 사용하셨습니다"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500"
        >
          <Edit className="h-4 w-4" />
          수정 완료 ({maxEdits}/{maxEdits})
        </button>
      )}
    </div>
  );
}
