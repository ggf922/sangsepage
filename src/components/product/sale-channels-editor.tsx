"use client";

import { Plus, Trash2 } from "lucide-react";
import type { SaleChannel, SaleChannelType } from "@/lib/types";
import { SALE_CHANNEL_META } from "@/lib/types";

interface Props {
  value: SaleChannel[];
  onChange: (channels: SaleChannel[]) => void;
}

export default function SaleChannelsEditor({ value, onChange }: Props) {
  const add = () => {
    onChange([...value, { type: "smartstore", url: "", price: undefined, note: "" }]);
  };
  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };
  const update = (idx: number, patch: Partial<SaleChannel>) => {
    onChange(value.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-brand/20 bg-ivory-light py-6 text-center text-sm text-muted-foreground">
          아직 등록된 판매채널이 없습니다. 아래 버튼을 눌러 추가해주세요.
        </div>
      )}

      {value.map((ch, idx) => {
        const meta = SALE_CHANNEL_META[ch.type];
        return (
          <div
            key={idx}
            className="rounded-xl border border-brand/10 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
              >
                {meta.icon}
              </div>
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    채널
                  </label>
                  <select
                    value={ch.type}
                    onChange={(e) => update(idx, { type: e.target.value as SaleChannelType })}
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    {Object.entries(SALE_CHANNEL_META).map(([key, m]) => (
                      <option key={key} value={key}>
                        {m.icon} {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    URL
                  </label>
                  <input
                    type="url"
                    value={ch.url || ""}
                    onChange={(e) => update(idx, { url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    판매가 (원)
                  </label>
                  <input
                    type="number"
                    value={ch.price ?? ""}
                    onChange={(e) =>
                      update(idx, { price: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="예: 12900"
                    className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    비고 (프로모션·할인 등)
                  </label>
                  <input
                    value={ch.note || ""}
                    onChange={(e) => update(idx, { note: e.target.value })}
                    placeholder="예: 첫 구매 20% 할인 쿠폰"
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
        );
      })}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-brand/30 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5"
      >
        <Plus className="h-4 w-4" />
        판매채널 추가
      </button>
    </div>
  );
}
