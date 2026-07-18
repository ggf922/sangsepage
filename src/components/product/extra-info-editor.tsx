"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ProductExtraInfo } from "@/lib/types";

interface Props {
  value: ProductExtraInfo;
  onChange: (info: ProductExtraInfo) => void;
}

interface Section {
  key: string;
  title: string;
  icon: string;
  fields: { key: keyof ProductExtraInfo; label: string; placeholder: string; type?: "text" | "textarea" }[];
}

const SECTIONS: Section[] = [
  {
    key: "spec",
    title: "제품 사양",
    icon: "📏",
    fields: [
      { key: "weight", label: "중량", placeholder: "예: 500g" },
      { key: "volume", label: "용량", placeholder: "예: 1L" },
      { key: "size", label: "사이즈", placeholder: "예: 20 x 15 x 10cm" },
      { key: "material", label: "재질/소재", placeholder: "예: 국내산 무·배추" },
      { key: "manufacturer", label: "제조사", placeholder: "예: (주)오가미" },
      { key: "seller", label: "판매사", placeholder: "예: (주)상세페이지 / 서울시 강남구 …" },
      { key: "expiry", label: "유통기한", placeholder: "예: 제조일로부터 30일" },
      { key: "storage", label: "보관방법", placeholder: "예: 냉장(0~10℃) 보관", type: "textarea" },
      { key: "usage", label: "사용/섭취방법", placeholder: "예: 개봉 후 냉장보관, 7일 이내 섭취", type: "textarea" },
      { key: "precautions", label: "주의사항", placeholder: "예: 알레르기 유발 성분 확인", type: "textarea" },
    ],
  },
  {
    key: "shipping",
    title: "배송·교환·환불",
    icon: "📦",
    fields: [
      { key: "shipping_method", label: "배송방법", placeholder: "예: 냉장 택배 (CJ대한통운)" },
      { key: "shipping_fee", label: "배송비", placeholder: "예: 3,000원 (30,000원 이상 무료)" },
      { key: "shipping_period", label: "배송기간", placeholder: "예: 주문 후 2~3일 이내 (주말·공휴일 제외)" },
      { key: "return_policy", label: "교환/반품 정책", placeholder: "예: 수령 후 7일 이내 미개봉 상태에 한함", type: "textarea" },
      { key: "refund_policy", label: "환불 정책", placeholder: "예: 반품 도착 확인 후 3일 이내 환불 처리", type: "textarea" },
      { key: "as_info", label: "AS 안내", placeholder: "예: 고객센터 1588-1234 (평일 09-18시)", type: "textarea" },
    ],
  },
  {
    key: "brand",
    title: "브랜드 스토리",
    icon: "🏢",
    fields: [
      { key: "brand_name", label: "브랜드명", placeholder: "예: 오가미 (OGAMI)" },
      { key: "brand_story", label: "브랜드 스토리", placeholder: "브랜드의 탄생 배경, 철학, 가치를 자유롭게 작성하세요.", type: "textarea" },
    ],
  },
];

export default function ExtraInfoEditor({ value, onChange }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    spec: true, // 기본 열림
    shipping: false,
    brand: false,
  });

  const toggle = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const update = (key: keyof ProductExtraInfo, val: string) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => {
        const isOpen = openSections[section.key];
        return (
          <div
            key={section.key}
            className="overflow-hidden rounded-xl border border-brand/10 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggle(section.key)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-ivory-light"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{section.icon}</span>
                <span className="font-medium text-ink">{section.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({section.fields.filter((f) => value[f.key]).length}/{section.fields.length} 입력됨)
                </span>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <div className="grid grid-cols-1 gap-3 border-t border-brand/10 bg-ivory-light/40 p-4 md:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={(value[field.key] as string) || ""}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                    ) : (
                      <input
                        value={(value[field.key] as string) || ""}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
