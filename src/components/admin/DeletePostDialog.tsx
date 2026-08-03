"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X } from "lucide-react";

type DeletePostDialogProps = {
  postId: string;
  title: string;
};

type DeleteErrorPayload = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

function deleteErrorMessage(payload: DeleteErrorPayload | null) {
  const fieldError = Object.values(payload?.fieldErrors ?? {}).find(
    (message) => typeof message === "string" && message.trim(),
  );

  return fieldError ?? payload?.message ?? "删除失败，请重试。";
}

export function DeletePostDialog({ postId, title }: DeletePostDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const deleteRequestRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    document.body.style.overflow = "hidden";
    dialog?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!deleteRequestRef.current) {
          setOpen(false);
        }
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const activeElement = document.activeElement;
      const focusOutsideDialog =
        !activeElement || !dialog.contains(activeElement);

      if (
        event.shiftKey &&
        (activeElement === first ||
          activeElement === dialog ||
          focusOutsideDialog)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === last ||
          activeElement === dialog ||
          focusOutsideDialog)
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  function closeDialog() {
    if (!deleteRequestRef.current) {
      setOpen(false);
    }
  }

  async function deletePost() {
    if (deleteRequestRef.current) {
      return;
    }

    setError(null);
    deleteRequestRef.current = true;
    setIsDeleting(true);

    try {
      const response = await fetch("/api/admin/posts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ id: postId }),
      });
      const payload = (await response.json().catch(() => null)) as
        | DeleteErrorPayload
        | null;

      if (!response.ok) {
        setError(deleteErrorMessage(payload));
        return;
      }

      setOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("删除失败，请检查网络后重试。");
    } finally {
      deleteRequestRef.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border border-[rgba(255,107,107,0.32)] px-3 text-[14px] leading-[1.4] text-[#ff8a8a] hover:bg-[rgba(255,107,107,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b6b]"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        删除
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lab-base/78 px-4 py-8">
          <div
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-busy={isDeleting}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-[480px] rounded-lab border border-[rgba(255,107,107,0.38)] bg-lab-surface p-5 shadow-[0_24px_80px_rgba(0,0,0,0.46)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="inline-flex min-h-9 items-center gap-2 rounded-lab border border-[rgba(255,107,107,0.32)] px-2.5 font-mono text-[13px] leading-[1.4] text-[#ff8a8a]">
                  <AlertTriangle aria-hidden="true" className="h-4 w-4" />
                  危险操作
                </p>
                <h2
                  id={titleId}
                  className="mt-4 text-[20px] font-semibold leading-[1.2] text-lab-text"
                >
                  删除文章？
                </h2>
              </div>
              <button
                type="button"
                aria-label="取消"
                disabled={isDeleting}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lab border border-[var(--lab-border-hairline)] text-lab-text-muted hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text"
                onClick={closeDialog}
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <p
              id={descriptionId}
              className="mt-4 text-[16px] leading-[1.5] text-lab-text-muted"
            >
              这会永久删除「{title}」，且无法撤销。
            </p>
            {error ? (
              <p role="alert" className="mt-4 text-[14px] text-[#ff8a8a]">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                className="inline-flex min-h-11 items-center justify-center rounded-lab border border-[var(--lab-border-hairline)] px-4 text-[14px] leading-[1.4] text-lab-text-muted hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text"
                onClick={closeDialog}
              >
                取消
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border border-[#ff6b6b] bg-[#ff6b6b] px-4 text-[14px] font-semibold leading-[1.4] text-lab-base hover:bg-[#ff8a8a] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeleting}
                onClick={deletePost}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                确认删除
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
