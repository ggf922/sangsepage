import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import EditPanel from "./edit-panel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps) {
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
        template:templates(id, code, name)
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase.from("users").select("points").eq("id", user.id).single(),
  ]);

  if (error || !page) notFound();

  if (page.status !== "completed") {
    redirect(`/dashboard/pages/${id}`);
  }

  const points = profile?.points ?? 0;
  const editCount = page.edit_count ?? 0;
  const maxEdits = page.max_edits ?? 999; // 하위 호환용 (실제 제한 없음)
  // 수정 횟수 제한 제거 — 포인트가 있으면 언제든 수정 가능

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/pages/${id}`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          결과 페이지로
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 flex items-center gap-2 font-serif text-3xl font-bold text-ink">
              <Edit className="h-8 w-8 text-brand" />
              페이지 수정하기
            </h1>
            <p className="text-muted-foreground">
              <strong className="text-ink">
                {page.product?.name ?? "-"}
              </strong>{" "}
              · {page.template?.name ?? "-"} · 생성일 {formatDate(page.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-lg bg-ivory px-4 py-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">잔여 포인트</p>
              <p className="font-serif text-lg font-bold text-brand">
                {points.toLocaleString()} P
              </p>
            </div>
            {editCount > 0 && (
              <div className="border-l border-brand/10 pl-4">
                <p className="text-xs text-muted-foreground">누적 수정</p>
                <p className="font-serif text-lg font-bold text-ink">
                  {editCount}회
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* 왼쪽: 편집 패널 */}
        <div className="lg:col-span-2">
          <EditPanel
            pageId={id}
            editCount={editCount}
            maxEdits={maxEdits}
            points={points}
          />
        </div>

        {/* 오른쪽: 현재 미리보기 */}
        <div className="lg:col-span-3">
          <div className="sticky top-4 overflow-hidden rounded-xl border border-brand/10 bg-white">
            <div className="flex items-center gap-2 border-b border-brand/10 bg-ivory px-4 py-2.5 text-xs font-medium text-ink">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="ml-2">현재 페이지 (수정 전)</span>
            </div>
            <div className="flex justify-center bg-gray-100 p-3">
              <iframe
                srcDoc={page.html_content ?? ""}
                title="current preview"
                sandbox="allow-same-origin"
                className="border-0"
                style={{
                  width: "860px",
                  transform: "scale(0.55)",
                  transformOrigin: "top center",
                  height: "1350px",
                  backgroundColor: "#fff",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
