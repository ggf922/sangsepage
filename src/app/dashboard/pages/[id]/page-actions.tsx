"use client";

// ============================================================
// 상세페이지 결과 액션 버튼들 (다운로드/공유/수정/재생성)
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Share2, Edit, Check, RefreshCw, Sparkles, Loader2 } from "lucide-react";

interface Props {
  pageId: string;
  shareId: string | null;
  editCount: number;
  maxEdits: number;
  productId: string | null;
  templateId: string | null;
  language: string;
  points: number;
  regenerationCount: number;
}

export default function PageActions({
  pageId,
  shareId,
  editCount,
  maxEdits,
  productId,
  templateId,
  language,
  points,
  regenerationCount,
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

  const canEdit = editCount < maxEdits;
  const remainingEdits = maxEdits - editCount;
  const REGEN_COST = 30; // 재생성은 기본 30P (Self-Critique는 자동 무료 적용)
  const canRegenerate = productId && templateId && points >= REGEN_COST;

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

  async function handleRegenerate() {
    if (!productId || !templateId) return;
    setRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          template_id: templateId,
          language,
          source_page_id: pageId, // 재생성 표시 → 서버가 자동 Self-Critique ON
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRegenError(data.error ?? "재생성에 실패했습니다.");
        setRegenerating(false);
        return;
      }
      router.push(`/dashboard/pages/${data.page_id}`);
    } catch (err: any) {
      setRegenError(err?.message ?? "네트워크 오류");
      setRegenerating(false);
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

      {/* 재생성 버튼 */}
      {productId && templateId && (
        <button
          type="button"
          onClick={() => setRegenOpen(true)}
          disabled={!canRegenerate || regenerating}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-brand/30 bg-white px-3 py-2 text-sm font-medium text-brand hover:bg-brand/5 disabled:opacity-40"
          title="같은 상품·스타일로 완전히 새로 만들기 (Self-Critique 자동 적용)"
        >
          <RefreshCw className="h-4 w-4" />
          재생성 ({REGEN_COST}P)
        </button>
      )}

      {/* 재생성 확인 모달 */}
      {regenOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !regenerating && setRegenOpen(false)}
        >
          <div
            className="max-w-md w-full rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand" />
              <h3 className="font-serif text-lg font-bold text-ink">
                재생성하기
              </h3>
              <span className="ml-auto rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                Self-Critique 자동 적용
              </span>
            </div>
            <div className="mb-4 space-y-2 text-sm text-ink/80">
              <p>
                <b>같은 상품·스타일·언어</b>로 완전히 새로운 카피와 이미지를 생성합니다.
              </p>
              <div className="rounded-lg bg-brand/[0.03] border border-brand/15 p-3 text-xs">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 text-brand flex-shrink-0" />
                  <div>
                    <b className="text-brand">재생성 특전:</b> 첫 결과가 마음에 안 드신 만큼,
                    AI가 초고를 스스로 재검수하는 <b>Self-Critique 2-Pass</b>가 <b>자동 무료 적용</b>됩니다.
                    같은 30P로 더 정제된 카피를 받을 수 있어요.
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">기존 페이지</span>
                <span>보관됨 (내 페이지에서 확인 가능)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">차감 포인트</span>
                <span className="font-serif text-base font-bold text-brand">{REGEN_COST}P</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">잔여 포인트</span>
                <span className="font-medium">{points.toLocaleString()}P → {(points - REGEN_COST).toLocaleString()}P</span>
              </div>
              {regenerationCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  ※ 이 페이지는 이미 {regenerationCount}회 재생성된 결과입니다.
                </p>
              )}
            </div>
            {regenError && (
              <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                {regenError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRegenOpen(false)}
                disabled={regenerating}
                className="flex-1 rounded-lg border border-brand/20 bg-white py-2 text-sm font-medium text-ink hover:bg-ivory disabled:opacity-40"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={!canRegenerate || regenerating}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-40"
              >
                {regenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    재생성 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {REGEN_COST}P로 재생성
                  </>
                )}
              </button>
            </div>
            {!canRegenerate && !regenerating && (
              <p className="mt-2 text-center text-xs text-red-600">
                포인트가 부족합니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
