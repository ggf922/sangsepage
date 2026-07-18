import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Edit,
  Share2,
  ExternalLink,
  Clock,
  Coins,
  Palette,
  Globe,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import PageActions from "./page-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const LANG_META: Record<string, { label: string; flag: string }> = {
  ko: { label: "한국어", flag: "🇰🇷" },
  en: { label: "English", flag: "🇺🇸" },
  zh: { label: "中文", flag: "🇨🇳" },
  ja: { label: "日本語", flag: "🇯🇵" },
};

export default async function PageDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: page, error }, { data: profile }] = await Promise.all([
    supabase
      .from("generated_pages")
      .select(
        `
        *,
        product:products(id, name, category),
        template:templates(id, code, name, category, design_tokens)
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase.from("users").select("points").eq("id", user.id).single(),
  ]);

  if (error || !page) notFound();

  const userPoints = profile?.points ?? 0;

  const langMeta = LANG_META[page.language] ?? LANG_META.ko;
  const imageCount = Array.isArray(page.generated_images)
    ? page.generated_images.length
    : 0;

  const isCompleted = page.status === "completed";
  const isGenerating = page.status === "generating";
  const isFailed = page.status === "failed";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/pages"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">
              {page.product?.name ?? "삭제된 상품"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <StatusBadge status={page.status} />
              <span className="inline-flex items-center gap-1">
                <Palette className="h-3.5 w-3.5" />
                {page.template?.name ?? "-"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {langMeta.flag} {langMeta.label}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(page.created_at)}
              </span>
            </div>
          </div>

          {isCompleted && (
            <PageActions
              pageId={page.id}
              shareId={page.share_id}
              editCount={page.edit_count}
              maxEdits={page.max_edits}
              productId={page.product_id}
              templateId={page.template_id}
              language={page.language}
              points={userPoints}
              regenerationCount={page.regeneration_count ?? 0}
            />
          )}
        </div>
      </div>

      {/* Status-based content */}
      {isGenerating && (
        <div className="rounded-xl border border-brand/20 bg-white p-12 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-brand" />
          <h3 className="mb-2 font-serif text-xl font-bold text-ink">
            상세페이지 생성 중...
          </h3>
          <p className="text-sm text-muted-foreground">
            AI가 카피와 이미지를 생성하고 있습니다. 약 1~2분 소요됩니다.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            페이지를 새로고침하면 최신 상태를 확인할 수 있습니다.
          </p>
        </div>
      )}

      {isFailed && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="font-serif text-xl font-bold text-red-900">
              생성 실패
            </h3>
          </div>
          <p className="mb-4 text-sm text-red-800">
            {page.error_message ?? "알 수 없는 오류가 발생했습니다."}
          </p>
          <div className="rounded border border-red-200 bg-white p-3 text-xs text-red-700">
            <p>✅ 차감된 <strong>{page.points_used}P</strong>는 자동으로 환불되었습니다.</p>
            <p className="mt-1">
              마이페이지에서 거래 내역을 확인하실 수 있습니다.
            </p>
          </div>
          <Link
            href="/dashboard/generate"
            className="mt-4 inline-flex items-center gap-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            다시 시도하기
          </Link>
        </div>
      )}

      {isCompleted && (
        <>
          {/* 재생성/Self-Critique 배지 */}
          {(page.self_critique_used || (page.regeneration_count ?? 0) > 0) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {page.self_critique_used && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  ✨ Self-Critique 2-Pass 적용됨
                </span>
              )}
              {(page.regeneration_count ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  🔁 재생성 #{page.regeneration_count}
                </span>
              )}
              {page.premium_requested && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                  ⭐ 고급 모드 (+15P)
                </span>
              )}
            </div>
          )}

          {/* Meta info */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <MetaCard
              icon={<Coins className="h-4 w-4 text-brand" />}
              label="사용 포인트"
              value={`${page.points_used} P`}
            />
            <MetaCard
              icon={<Edit className="h-4 w-4 text-brand" />}
              label="누적 수정"
              value={page.edit_count > 0 ? `${page.edit_count}회` : "-"}
            />
            <MetaCard
              icon={<Package className="h-4 w-4 text-brand" />}
              label="생성 이미지"
              value={`${imageCount}장`}
            />
            <MetaCard
              icon={<CheckCircle2 className="h-4 w-4 text-brand" />}
              label="공유 ID"
              value={page.share_id ?? "-"}
            />
          </div>

          {/* Preview */}
          <div className="mb-6 overflow-hidden rounded-xl border border-brand/10 bg-white">
            <div className="flex items-center justify-between border-b border-brand/10 bg-ivory px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="ml-2">미리보기 (860px 이커머스 표준)</span>
              </div>
              <a
                href={`/api/pages/${page.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                새 창에서 열기
              </a>
            </div>
            <div className="flex justify-center bg-gray-100 p-4">
              <iframe
                srcDoc={page.html_content ?? ""}
                title="detail page preview"
                sandbox="allow-same-origin"
                className="border-0"
                style={{
                  width: "860px",
                  height: "80vh",
                  backgroundColor: "#fff",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-brand/10 bg-white p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="font-serif text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta: Record<string, { label: string; className: string }> = {
    completed: {
      label: "완료",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    generating: {
      label: "생성 중",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    failed: {
      label: "실패",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    draft: {
      label: "임시저장",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    },
  };
  const m = meta[status] ?? meta.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${m.className}`}
    >
      {m.label}
    </span>
  );
}
