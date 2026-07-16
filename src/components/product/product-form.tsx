"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Product } from "@/lib/types";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductFormData,
} from "@/app/dashboard/products/actions";
import ImageUploader from "./image-uploader";
import SaleChannelsEditor from "./sale-channels-editor";
import IngredientsEditor from "./ingredients-editor";
import FeaturesEditor from "./features-editor";
import ExtraInfoEditor from "./extra-info-editor";

interface Props {
  mode: "create" | "edit";
  initialData?: Product;
}

const CATEGORY_OPTIONS = [
  { value: "food", label: "🍚 식품·김치" },
  { value: "household", label: "🏠 생활용품" },
  { value: "electronics", label: "📱 전자제품" },
  { value: "health", label: "💊 건강식품" },
  { value: "cosmetics", label: "💄 화장품" },
  { value: "fashion", label: "👗 패션·의류" },
  { value: "baby", label: "🍼 유아·출산" },
  { value: "pet", label: "🐶 반려동물" },
  { value: "other", label: "🎁 기타" },
];

const BRAND_TONE_OPTIONS = [
  { value: "traditional", label: "전통적·정성스러운" },
  { value: "modern", label: "모던·심플한" },
  { value: "premium", label: "프리미엄·고급스러운" },
  { value: "friendly", label: "친근·캐주얼한" },
  { value: "tech", label: "테크·전문적인" },
  { value: "natural", label: "자연친화적·클린한" },
  { value: "luxury", label: "럭셔리·감성적인" },
];

export default function ProductForm({ mode, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    category: initialData?.category ?? "",
    origin: initialData?.origin ?? "",
    price: initialData?.price ?? null,
    brand_tone: initialData?.brand_tone ?? "",
    sale_channels: initialData?.sale_channels ?? [],
    ingredients: initialData?.ingredients ?? [],
    features: initialData?.features ?? [],
    extra_info: initialData?.extra_info ?? {},
    images: initialData?.images ?? [],
  });

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!form.name.trim()) {
      setError("상품명은 필수입니다.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (form.images.length === 0) {
      setError("상품 이미지를 최소 1장 업로드해주세요.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // GIF만 업로드하고 정지 이미지가 하나도 없으면 경고
    const staticImages = form.images.filter((img) => img.role !== "gif" && img.mime_type !== "image/gif");
    if (staticImages.length === 0) {
      setError("일반 이미지(JPG/PNG)를 최소 1장 업로드해주세요. GIF 외에 대표 이미지가 필요합니다.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProduct(form)
          : await updateProduct(initialData!.id, form);

      if (result.success) {
        if (mode === "create") {
          router.push(`/dashboard/products/${result.data.id}/edit?created=1`);
        } else {
          // ✅ 저장 성공 - 사용자에게 명확히 피드백
          setSuccessMessage("변경사항이 저장되었습니다");
          setError(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
          router.refresh();
          // 3초 후 성공 메시지 자동 사라짐
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } else {
        setError(result.error || "저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const handleDelete = async () => {
    if (!initialData) return;
    startTransition(async () => {
      const result = await deleteProduct(initialData.id);
      if (result.success) {
        router.push("/dashboard/products");
      } else {
        setError(result.error);
        setShowDeleteConfirm(false);
      }
    });
  };

  const totalCompleteness = calcCompleteness(form);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/products"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            상품 목록으로
          </Link>
          <h1 className="font-serif text-3xl font-bold text-ink">
            {mode === "create" ? "새 상품 등록" : "상품 정보 수정"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            상품 정보가 상세할수록 AI가 더 좋은 상세페이지를 만들어냅니다.
          </p>
        </div>
        <div className="hidden text-right md:block">
          <div className="text-xs text-muted-foreground">완성도</div>
          <div className="text-2xl font-bold text-brand">{totalCompleteness}%</div>
          <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-ivory">
            <div
              className="h-full bg-brand transition-all"
              style={{ width: `${totalCompleteness}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 기본 정보 */}
        <Section number="1" title="기본 정보" required>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label required>상품명</Label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="예: 오가미 열무물김치 500g"
                required
                className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <Label>카테고리</Label>
              <select
                value={form.category || ""}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="">카테고리 선택</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>대표 판매가 (원)</Label>
              <input
                type="number"
                value={form.price ?? ""}
                onChange={(e) => update("price", e.target.value ? Number(e.target.value) : null)}
                placeholder="예: 12900"
                className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <Label>원산지</Label>
              <input
                value={form.origin || ""}
                onChange={(e) => update("origin", e.target.value)}
                placeholder="예: 국내산 (전북 고창)"
                className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <Label>브랜드 톤</Label>
              <select
                value={form.brand_tone || ""}
                onChange={(e) => update("brand_tone", e.target.value)}
                className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="">톤 선택 (AI 카피 스타일)</option>
                {BRAND_TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* 2. 상품 이미지 */}
        <Section number="2" title="상품 이미지" required subtitle="최소 1장, 최대 20장 (첫 번째가 메인 이미지)">
          <ImageUploader
            value={form.images}
            onChange={(images) => update("images", images)}
          />
        </Section>

        {/* 3. 판매 채널 */}
        <Section number="3" title="판매 채널" subtitle="스마트스토어·쿠팡·자사몰 등 판매처 정보">
          <SaleChannelsEditor
            value={form.sale_channels}
            onChange={(channels) => update("sale_channels", channels)}
          />
        </Section>

        {/* 4. 셀링포인트 */}
        <Section number="4" title="핵심 셀링포인트" subtitle="상세페이지의 하이라이트가 될 3~6개의 포인트">
          <FeaturesEditor
            value={form.features}
            onChange={(features) => update("features", features)}
          />
        </Section>

        {/* 5. 원재료·성분 */}
        <Section number="5" title="원재료·성분" subtitle="식품·화장품·건강식품의 경우 필수">
          <IngredientsEditor
            value={form.ingredients}
            onChange={(ingredients) => update("ingredients", ingredients)}
          />
        </Section>

        {/* 6. 추가 정보 */}
        <Section number="6" title="상세 정보" subtitle="스펙·배송·브랜드 스토리 (선택)">
          <ExtraInfoEditor
            value={form.extra_info}
            onChange={(info) => update("extra_info", info)}
          />
        </Section>

        {/* 저장 버튼 */}
        <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-xl border border-brand/10 bg-white p-4 shadow-lg">
          <div className="flex items-center gap-3 text-sm">
            {successMessage ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">{successMessage}</span>
              </>
            ) : totalCompleteness >= 60 ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-ink">
                  상세페이지 생성이 가능합니다 ({totalCompleteness}%)
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span className="text-muted-foreground">
                  60% 이상 입력하면 더 좋은 결과가 나와요 (현재 {totalCompleteness}%)
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mode === "edit" && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
                className="rounded-lg border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="mr-1 inline h-4 w-4" />
                삭제
              </button>
            )}
            <Link
              href="/dashboard/products"
              className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-ivory"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {mode === "create" ? "상품 등록" : "변경사항 저장"}
            </button>
          </div>
        </div>
      </form>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-ink">상품을 삭제할까요?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              &quot;{initialData?.name}&quot; 상품과 관련 이미지가 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-ivory"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 섹션 래퍼 */
function Section({
  number,
  title,
  subtitle,
  required,
  children,
}: {
  number: string;
  title: string;
  subtitle?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-brand/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {number}
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            {title}
            {required && <span className="text-xs font-medium text-brand">* 필수</span>}
          </h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {children}
      {required && <span className="ml-0.5 text-brand">*</span>}
    </label>
  );
}

/** 완성도 계산 */
function calcCompleteness(form: ProductFormData): number {
  let score = 0;
  const weights = {
    name: 15,
    category: 5,
    price: 5,
    origin: 5,
    brand_tone: 5,
    images_1: 15, // 최소 1장
    images_3: 10, // 3장 이상
    sale_channels: 10,
    features: 15, // 셀링포인트
    ingredients: 5,
    extra_info: 10,
  };

  if (form.name.trim()) score += weights.name;
  if (form.category) score += weights.category;
  if (form.price) score += weights.price;
  if (form.origin) score += weights.origin;
  if (form.brand_tone) score += weights.brand_tone;
  if (form.images.length >= 1) score += weights.images_1;
  if (form.images.length >= 3) score += weights.images_3;
  if (form.sale_channels.length >= 1) score += weights.sale_channels;
  if (form.features.length >= 3) score += weights.features;
  else if (form.features.length >= 1) score += weights.features / 2;
  if (form.ingredients.length >= 1) score += weights.ingredients;
  const extraFilled = Object.values(form.extra_info).filter(
    (v) => v && (typeof v === "string" ? v.trim() : true)
  ).length;
  if (extraFilled >= 5) score += weights.extra_info;
  else if (extraFilled >= 1) score += weights.extra_info / 2;

  return Math.min(100, Math.round(score));
}
