"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Star, GripVertical, Loader2, Film } from "lucide-react";
import type { ProductImage, GifPosition } from "@/lib/types";
import { IMAGE_ROLE_META, GIF_POSITION_META } from "@/lib/types";

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
          // GIF 파일은 자동으로 gif role 할당 (서버에서도 재검증)
          const isGif = file.type === "image/gif";
          const initialRole = isGif
            ? "gif"
            : value.length === 0 && i === 0
            ? "main"
            : "detail";
          formData.append("role", initialRole);

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
    onChange(
      value.map((img) => {
        if (img.path !== path) return img;
        // gif → 다른 role로 바꾸면 gif_position 초기화
        // 다른 role → gif로 바꾸면 기본 위치 설정
        if (role === "gif" && img.role !== "gif") {
          return { ...img, role, gif_position: "after_points" as GifPosition };
        }
        if (role !== "gif" && img.role === "gif") {
          const { gif_position, gif_caption, ...rest } = img;
          return { ...rest, role };
        }
        return { ...img, role };
      })
    );
  };

  const changeGifPosition = (path: string, position: GifPosition) => {
    onChange(
      value.map((img) => (img.path === path ? { ...img, gif_position: position } : img))
    );
  };

  const changeGifCaption = (path: string, caption: string) => {
    onChange(
      value.map((img) => (img.path === path ? { ...img, gif_caption: caption } : img))
    );
  };

  // 파일이 GIF인지 판별 (mime_type 우선, 없으면 확장자로 폴백)
  const isGifFile = (img: ProductImage): boolean => {
    if (img.mime_type === "image/gif") return true;
    if (img.role === "gif") return true;
    return /\.gif(\?|$)/i.test(img.url) || /\.gif(\?|$)/i.test(img.name ?? "");
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
              JPG, PNG, WebP · 최대 10MB · 최대 {maxImages}장 ({value.length}/{maxImages})
            </p>
            <p className="mt-1 text-xs text-purple-600">
              <Film className="mr-1 inline h-3 w-3" />
              GIF 파일도 업로드 가능 · 상세페이지에 자동 삽입됩니다
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
          {value.map((img, idx) => {
            const isGif = isGifFile(img);
            return (
              <div
                key={img.path}
                className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm ${
                  isGif ? "border-purple-300 ring-1 ring-purple-200" : "border-brand/10"
                }`}
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
                  {isGif && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                      <Film className="h-3 w-3" />
                      GIF
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

                  {/* GIF 전용 옵션: 삽입 위치 + 캡션 */}
                  {img.role === "gif" && (
                    <div className="mt-2 space-y-1.5 rounded-md bg-purple-50 p-2">
                      <label className="block text-[10px] font-medium text-purple-700">
                        삽입 위치
                      </label>
                      <select
                        value={img.gif_position ?? "after_points"}
                        onChange={(e) =>
                          changeGifPosition(img.path, e.target.value as GifPosition)
                        }
                        className="w-full rounded border border-purple-200 bg-white px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-400"
                      >
                        {Object.entries(GIF_POSITION_META)
                          .sort(([, a], [, b]) => a.order - b.order)
                          .map(([key, meta]) => (
                            <option key={key} value={key}>
                              {meta.label}
                            </option>
                          ))}
                      </select>
                      <input
                        type="text"
                        placeholder="캡션 (선택)"
                        value={img.gif_caption ?? ""}
                        onChange={(e) => changeGifCaption(img.path, e.target.value)}
                        maxLength={40}
                        className="w-full rounded border border-purple-200 bg-white px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  )}

                  {img.role !== "main" && img.role !== "gif" && (
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
            );
          })}
        </div>
      )}

      {/* GIF 사용 안내 */}
      {value.some((img) => isGifFile(img)) && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs text-purple-800">
          <div className="mb-1 flex items-center gap-1.5 font-semibold">
            <Film className="h-3.5 w-3.5" />
            GIF 삽입 안내
          </div>
          <p className="leading-relaxed">
            업로드한 GIF는 상세페이지의 <strong>선택하신 위치</strong>에 자동으로 삽입됩니다.
            소비자 선호도가 가장 높은 위치는 <strong>&quot;핵심 포인트 직후&quot;</strong>입니다.
            여러 개의 GIF를 각각 다른 위치에 배치할 수 있어요.
          </p>
        </div>
      )}
    </div>
  );
}
