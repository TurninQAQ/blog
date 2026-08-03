"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import { ImagePlus, Link2, Upload, X } from "lucide-react";

import {
  AdminImageUploadError,
  firstClipboardImage,
  uploadAdminImage,
} from "@/lib/admin/media-upload";
import { isAllowedMarkdownImageDestination } from "@/lib/security/url-policy";

type ImageInsertDialogProps = {
  open: boolean;
  onClose: () => void;
  onInsert: (image: { src: string; alt: string }) => void;
  restoreFocus: () => void;
};

export function ImageInsertDialog({
  open,
  onClose,
  onInsert,
  restoreFocus,
}: ImageInsertDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const fileInputId = useId();
  const altInputId = useId();
  const urlInputId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadBusyRef = useRef(false);
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setAlt("");
    setUrl("");
    setError("");
    setIsDragging(false);

    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    document.body.style.overflow = "hidden";
    dialog?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!uploadBusyRef.current) {
          onClose();
        }
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const active = document.activeElement;
      const outside = !active || !dialog.contains(active);

      if (event.shiftKey && (active === first || active === dialog || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocus();
    };
  }, [onClose, open, restoreFocus]);

  async function insertFile(file: File) {
    if (uploadBusyRef.current) {
      return;
    }

    setError("");
    uploadBusyRef.current = true;
    setIsUploading(true);

    try {
      const uploaded = await uploadAdminImage(file);
      onInsert({ src: uploaded.url, alt: alt.trim() });
      onClose();
    } catch (uploadError) {
      setError(
        uploadError instanceof AdminImageUploadError
          ? uploadError.message
          : "图片上传失败，请重试。",
      );
    } finally {
      uploadBusyRef.current = false;
      setIsUploading(false);
    }
  }

  function insertUrl() {
    const src = url.trim();

    if (!isAllowedMarkdownImageDestination(src)) {
      setError("仅支持站内、相对路径或 HTTPS 图片 URL。");
      return;
    }

    onInsert({ src, alt: alt.trim() });
    onClose();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const image = firstClipboardImage(event.clipboardData);

    if (!image) {
      return;
    }

    event.preventDefault();
    void insertFile(image);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const image = Array.from(event.dataTransfer.files).find((file) =>
      file.type.toLowerCase().startsWith("image/"),
    );

    if (!image) {
      setError("拖入的内容不是可上传图片。");
      return;
    }

    void insertFile(image);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="lab-image-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-busy={isUploading}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="lab-image-dialog w-full max-w-[640px] overflow-y-auto rounded-lab p-5 sm:p-6"
        onPaste={handlePaste}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex min-h-9 items-center gap-2 font-mono text-[13px] font-semibold text-lab-accent">
              <ImagePlus aria-hidden="true" className="h-4 w-4" />
              图片素材
            </p>
            <h2 id={titleId} className="mt-3 text-[22px] font-semibold">
              插入图片
            </h2>
          </div>
          <button
            type="button"
            aria-label="关闭图片弹窗"
            disabled={isUploading}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lab border border-[var(--lab-border-hairline)]"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <p id={descriptionId} className="mt-3 text-[14px] text-lab-text-muted">
          选择本地文件、拖入图片，或直接在此弹窗粘贴剪贴板图片。
        </p>

        <label htmlFor={altInputId} className="mt-5 block text-[14px]">
          图片说明（建议填写）
        </label>
        <input
          id={altInputId}
          type="text"
          value={alt}
          disabled={isUploading}
          className="mt-2 min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3"
          placeholder="描述图片中的关键信息"
          onChange={(event) => setAlt(event.target.value)}
        />

        <div
          className="lab-image-dropzone mt-5 rounded-lab border-2 border-dashed p-6 text-center"
          data-dragging={isDragging ? "true" : "false"}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
        >
          <Upload aria-hidden="true" className="mx-auto h-6 w-6" />
          <p className="mt-3 text-[15px] font-semibold">
            {isUploading ? "正在安全处理图片…" : "拖放或粘贴图片"}
          </p>
          <p className="mt-1 text-[13px] text-lab-text-muted">
            JPEG / PNG / WebP，最大 10 MiB
          </p>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void insertFile(file);
              }

              event.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={isUploading}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lab border border-[var(--lab-border-active)] bg-lab-accent px-4 font-semibold text-lab-base"
            onClick={() => fileInputRef.current?.click()}
          >
            选择本地图片
          </button>
        </div>

        <div className="mt-5 border-t border-[var(--lab-border-hairline)] pt-5">
          <label htmlFor={urlInputId} className="flex items-center gap-2 text-[14px]">
            <Link2 aria-hidden="true" className="h-4 w-4" />
            或使用图片 URL
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id={urlInputId}
              type="url"
              value={url}
              disabled={isUploading}
              className="min-h-11 min-w-0 flex-1 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3"
              placeholder="https://example.com/image.png"
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
              }}
            />
            <button
              type="button"
              disabled={isUploading || !url.trim()}
              className="inline-flex min-h-11 items-center justify-center rounded-lab border border-[var(--lab-border-hairline)] px-4 font-semibold"
              onClick={insertUrl}
            >
              插入 URL
            </button>
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-[14px] text-[#ff8a8a]">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
