"use client";

import { Plus, Trash2, Leaf } from "lucide-react";
import type { Ingredient } from "@/lib/types";

interface Props {
  value: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

export default function IngredientsEditor({ value, onChange }: Props) {
  const add = () => onChange([...value, { name: "", origin: "", percentage: undefined, note: "" }]);
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const update = (idx: number, patch: Partial<Ingredient>) => {
    onChange(value.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-brand/20 bg-ivory-light py-6 text-center text-sm text-muted-foreground">
          원재료·성분이 없습니다. 식품·화장품·건강식품일 경우 추가해주세요.
        </div>
      )}

      {value.map((ing, idx) => (
        <div key={idx} className="rounded-xl border border-brand/10 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Leaf className="h-4 w-4" />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  원재료명 *
                </label>
                <input
                  value={ing.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="예: 얼갈이배추"
                  className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  원산지
                </label>
                <input
                  value={ing.origin || ""}
                  onChange={(e) => update(idx, { origin: e.target.value })}
                  placeholder="예: 국내산 (전북 고창)"
                  className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  비율 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={ing.percentage ?? ""}
                  onChange={(e) =>
                    update(idx, {
                      percentage: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="예: 45"
                  className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="md:col-span-4">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  특징·비고
                </label>
                <input
                  value={ing.note || ""}
                  onChange={(e) => update(idx, { note: e.target.value })}
                  placeholder="예: 저온숙성으로 아삭한 식감"
                  className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
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
        원재료 추가
      </button>
    </div>
  );
}
