"use client";

import { Plus, Trash2, Sparkles } from "lucide-react";
import type { ProductFeature } from "@/lib/types";

interface Props {
  value: ProductFeature[];
  onChange: (features: ProductFeature[]) => void;
}

const ICON_SUGGESTIONS = ["✨", "🌿", "🥇", "🎯", "💧", "🌾", "🔥", "❤️", "⭐", "🏆", "🛡️", "⚡"];

export default function FeaturesEditor({ value, onChange }: Props) {
  const add = () => onChange([...value, { icon: "✨", title: "", description: "" }]);
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<ProductFeature>) => {
    onChange(value.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-brand/20 bg-ivory-light py-6 text-center text-sm text-muted-foreground">
          핵심 셀링포인트 3~6개를 추가해주세요. (예: 국내산 원재료, 무방부제 등)
        </div>
      )}

      {value.map((f, idx) => (
        <div key={idx} className="rounded-xl border border-brand/10 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-lg">
              {f.icon || <Sparkles className="h-4 w-4 text-brand" />}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-1">
                {ICON_SUGGESTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => update(idx, { icon: ic })}
                    className={`h-8 w-8 rounded border text-sm transition ${
                      f.icon === ic
                        ? "border-brand bg-brand/10"
                        : "border-transparent hover:border-brand/30"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    제목 *
                  </label>
                  <input
                    value={f.title}
                    onChange={(e) => update(idx, { title: e.target.value })}
                    placeholder="예: 국내산 100%"
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    설명
                  </label>
                  <input
                    value={f.description || ""}
                    onChange={(e) => update(idx, { description: e.target.value })}
                    placeholder="예: 전북 고창 지역 얼갈이배추만 사용"
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-brand/30 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5"
      >
        <Plus className="h-4 w-4" />
        셀링포인트 추가
      </button>
    </div>
  );
}
