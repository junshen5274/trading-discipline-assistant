"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ClipboardPaste, ImagePlus, Trash2, Upload } from "lucide-react";
import { Panel } from "@/components/Panel";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

type Props = {
  imageDataUrl: string;
  imageName: string;
  disabled?: boolean;
  onImageChange: (dataUrl: string, name: string) => void;
  onError: (message: string) => void;
};

export function ScreenshotUploadPanel({ imageDataUrl, imageName, disabled, onImageChange, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const file = Array.from(event.clipboardData?.items ?? [])
        .find((item) => item.kind === "file" && item.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      event.preventDefault();
      void readImage(file, "剪贴板截图");
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  });

  async function readImage(file: File, fallbackName?: string) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError("仅支持 PNG、JPEG 或 WebP 图片。");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      onError("图片不能超过 15MB。");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      onImageChange(dataUrl, file.name || fallbackName || "图表截图");
    } catch {
      onError("无法读取该图片，请换一张重试。");
    }
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void readImage(file);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void readImage(file);
  }

  return (
    <Panel
      title="图表截图"
      action={
        imageDataUrl ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onImageChange("", "")}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-700 dark:hover:text-rose-300 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> 清除
          </button>
        ) : null
      }
    >
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleInput} className="sr-only" />
      {imageDataUrl ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageDataUrl} alt={imageName || "上传的图表截图"} className="max-h-[560px] w-full object-contain" />
          <div className="flex items-center justify-between gap-3 border-t border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
            <span className="truncate">{imageName}</span>
            <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="shrink-0 font-semibold text-teal-300 hover:text-teal-200 disabled:opacity-50">
              更换图片
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
            isDragging ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-950/30"
          }`}
        >
          <div className="mb-4 rounded-full bg-white dark:bg-slate-900 p-3 text-teal-700 dark:text-teal-300 shadow-sm"><ImagePlus className="h-6 w-6" /></div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">拖入截图或点击上传</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><ClipboardPaste className="h-4 w-4" /> 也可以直接粘贴剪贴板图片</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500"><Upload className="h-3.5 w-3.5" /> PNG / JPEG / WebP，最大 15MB</p>
        </div>
      )}
    </Panel>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid file"));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
