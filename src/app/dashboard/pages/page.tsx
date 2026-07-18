import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FileText, Sparkles, Eye, Download, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

const LANGUAGE_LABELS: Record<string, string> = {
  ko: "🇰🇷 한국어",
  en: "🇺🇸 English",
  zh: "🇨🇳 中文",
  ja: "🇯🇵 日本語",
};

export default async function PagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pages } = await supabase
    .from("generated_pages")
    .select("*, products(name, category), templates(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-ink">
          생성된 페이지
        </h1>
        <p className="text-muted-foreground">
          지금까지 만든 상세페이지를 확인하고 수정하세요.
        </p>
      </div>

      {!pages || pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand/20 bg-white p-12 text-center">
          <Sparkles className="mx-auto mb-3 h-12 w-12 text-brand/30" />
          <h3 className="mb-2 font-serif text-xl font-bold text-ink">
            아직 생성한 페이지가 없습니다
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            AI로 첫 상세페이지를 만들어보세요.
          </p>
          <Link
            href="/dashboard/generate"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-dark"
          >
            <Sparkles className="h-4 w-4" />
            페이지 만들기
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand/10 bg-white">
          <table className="w-full">
            <thead className="border-b border-brand/10 bg-ivory">
              <tr>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  상품
                </th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  스타일
                </th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  언어
                </th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  수정
                </th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  생성일
                </th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand/5">
              {pages.map((page: any) => (
                <tr key={page.id} className="hover:bg-ivory-light">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-ink">
                        {page.products?.name || "제목 없음"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {page.products?.category}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-ink">
                    {page.templates?.name || "-"}
                  </td>
                  <td className="p-4 text-sm">
                    {LANGUAGE_LABELS[page.language] || page.language}
                  </td>
                  <td className="p-4 text-sm">
                    {page.edit_count > 0 ? (
                      <span className="text-brand">
                        {page.edit_count}회
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(page.created_at)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-1">
                      <Link
                        href={`/dashboard/pages/${page.id}`}
                        className="rounded-md border border-brand/20 p-1.5 text-brand hover:bg-brand hover:text-white"
                        title="보기"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/dashboard/pages/${page.id}/edit`}
                        className="rounded-md border border-brand/20 p-1.5 text-brand hover:bg-brand hover:text-white"
                        title="수정"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <a
                        href={`/api/pages/${page.id}/download`}
                        className="rounded-md border border-brand/20 p-1.5 text-brand hover:bg-brand hover:text-white"
                        title="다운로드"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
