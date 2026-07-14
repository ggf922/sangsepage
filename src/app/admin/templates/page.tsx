import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Palette, Plus, Edit, Eye, ToggleLeft, ToggleRight } from "lucide-react";

export default async function AdminTemplatesPage() {
  // 관리자 클라이언트로 모든 템플릿 조회 (비활성 포함)
  const admin = createAdminClient();
  const { data: templates } = await admin
    .from("templates")
    .select("*")
    .order("code");

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-serif text-3xl font-bold text-slate-900">
            템플릿 관리
          </h1>
          <p className="text-slate-500">
            상세페이지 생성에 사용되는 스타일 템플릿을 관리합니다.
          </p>
        </div>
        <Link
          href="/admin/templates/new"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />새 템플릿
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(templates || []).map((tpl: any) => {
          const colors = tpl.design_tokens?.colors || {};
          return (
            <div
              key={tpl.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {tpl.code}
                </span>
                {tpl.is_active ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <ToggleRight className="h-4 w-4" />
                    활성
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <ToggleLeft className="h-4 w-4" />
                    비활성
                  </span>
                )}
              </div>

              <div className="mb-3 flex gap-1">
                {colors.primary && (
                  <div
                    className="h-8 w-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: colors.primary }}
                    title={colors.primary}
                  />
                )}
                {colors.accent && (
                  <div
                    className="h-8 w-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: colors.accent }}
                    title={colors.accent}
                  />
                )}
                {colors.background && (
                  <div
                    className="h-8 w-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: colors.background }}
                    title={colors.background}
                  />
                )}
              </div>

              <h3 className="mb-1 font-serif text-lg font-bold text-slate-900">
                {tpl.name}
              </h3>
              <p className="mb-4 line-clamp-2 text-xs text-slate-500">
                {tpl.description}
              </p>

              <div className="flex gap-2">
                <Link
                  href={`/admin/templates/${tpl.id}/edit`}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 py-1.5 text-xs font-medium hover:bg-slate-100"
                >
                  <Edit className="h-3 w-3" />
                  편집
                </Link>
                <Link
                  href={`/admin/templates/${tpl.id}/preview`}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md bg-slate-900 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  <Eye className="h-3 w-3" />
                  미리보기
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {(!templates || templates.length === 0) && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Palette className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="mb-4 text-slate-500">
            아직 템플릿이 없습니다. DB 마이그레이션을 먼저 실행해주세요.
          </p>
          <p className="text-xs text-slate-400">
            Supabase Dashboard → SQL Editor에서{" "}
            <code className="rounded bg-slate-100 px-1">
              supabase/migrations/0002_seed_data.sql
            </code>{" "}
            실행
          </p>
        </div>
      )}
    </div>
  );
}
