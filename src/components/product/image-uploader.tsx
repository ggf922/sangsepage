"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Star, GripVertical, Loader2 } from "lucide-react";
import type { ProductImage } from "@/lib/types";
import { IMAGE_ROLE_META } from "@/lib/types";

interface Props {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ value, onChange, maxImages = 20 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (arr.length === 0) return;

      const available = maxImages - value.length;
      if (available <= 0) {
        setError(`최대 ${maxImages}장까지 업로드 가능합니다.`);
        return;
      }
      const toUpload = arr.slice(0, available);

      setUploading(true);
      setError(null);
      setProgress(0);

      const uploaded: ProductImage[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("role", value.length === 0 && i === 0 ? "main" : "detail");

          const res = await fetch("/api/upload/product-image", {
            method: "POST",
            body: formData,
          });
          const json = await res.json();
          if (!res.ok) {
            setError(json.error || "업로드 실패");
            break;
          }
          uploaded.push({
            ...json.image,
            order: value.length + uploaded.length,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "업로드 중 오류");
          break;
        }
        setProgress(Math.round(((i + 1) / toUpload.length) * 100));
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
      setUploading(false);
      setProgress(0);
    },
    [value, onChange, maxImages]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (path: string) => {
    onChange(value.filter((img) => img.path !== path));
  };

  const setMain = (path: string) => {
    onChange(
      value.map((img) => ({
        ...img,
        role: img.path === path ? "main" : img.role === "main" ? "detail" : img.role,
      }))
    );
  };

  const changeRole = (path: string, role: ProductImage["role"]) => {
    onChange(value.map((img) => (img.path === path ? { ...img, role } : img)));
  };

  const move = (fromIdx: number, toIdx: number) => {
    const next = [...value];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next.map((img, i) => ({ ...img, order: i })));
  };

  return (
    <div className="space-y-4">
      {/* 업로드 존 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
          dragActive
            ? "border-brand bg-brand/5"
            : "border-brand/20 bg-ivory-light hover:border-brand/40 hover:bg-ivory"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-brand" />
            <p className="text-sm font-medium text-brand">업로드 중... {progress}%</p>
          </>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-brand" />
            <p className="text-sm font-medium text-ink">
              클릭 또는 드래그하여 이미지 업로드
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WebP, GIF · 최대 10MB · 최대 {maxImages}장 ({value.length}/{maxImages})
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* 이미지 그리드 */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((img, idx) => (
            <div
              key={img.path}
              className="group relative overflow-hidden rounded-xl border border-brand/10 bg-white shadow-sm"
            >
              <div className="relative aspect-square w-full bg-ivory">
                <Image
                  src={img.url}
                  alt={img.name || "product"}
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized
                />
                {img.role === "main" && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-white">
                    <Star className="h-3 w-3 fill-current" />
                    메인
                  </div>
                )}
                {/* 액션 오버레이 */}
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <div className="flex gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => move(idx, idx - 1)}
                        className="rounded bg-white/90 p-1 text-xs hover:bg-white"
                        title="위로"
                      >
                        ←
                      </button>
                    )}
                    {idx < value.length - 1 && (
                      <button
                        type="button"
                        onClick={() => move(idx, idx + 1)}
                        className="rounded bg-white/90 p-1 text-xs hover:bg-white"
                        title="아래로"
                      >
                        →
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(img.path)}
                    className="rounded-full bg-destructive p-1 text-white hover:bg-destructive/80"
                    title="삭제"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="p-2 text-xs">
                <select
                  value={img.role}
                  onChange={(e) => changeRole(img.path, e.target.value as ProductImage["role"])}
                  className="w-full rounded border-none bg-transparent px-1 py-0.5 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  {Object.entries(IMAGE_ROLE_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
                {img.role !== "main" && (
                  <button
                    type="button"
                    onClick={() => setMain(img.path)}
                    className="mt-1 w-full rounded border border-brand/20 py-0.5 text-[10px] text-brand hover:bg-brand/5"
                  >
                    ⭐ 메인으로
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
