"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Send, Star, StarOff } from "lucide-react";

type PublishOperation = "publish" | "unpublish" | "feature" | "unfeature";

type AdminPublishControlsProps = {
  postId: string;
  title: string;
  status: string;
  featured: boolean;
  compact?: boolean;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onMutated?: (post: AdminMutationPostPayload) => void;
};

type AdminMutationPostPayload = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  featured: boolean;
};

type AdminMutationPayload = {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  post?: AdminMutationPostPayload;
};

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border px-3 text-[14px] leading-[1.4] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70";
const primaryButton =
  "border-[var(--lab-border-active)] bg-lab-accent font-semibold text-lab-base hover:bg-lab-text";
const secondaryButton =
  "border-[var(--lab-border-hairline)] text-lab-text-muted hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text";

function buttonClass(primary = false) {
  return `${buttonBase} ${primary ? primaryButton : secondaryButton}`;
}

function mutationErrorMessage(payload: AdminMutationPayload | null) {
  const fieldError = Object.values(payload?.fieldErrors ?? {}).find(Boolean);

  return (
    fieldError ??
    payload?.message ??
    payload?.error ??
    "发布状态更新失败，请重试。"
  );
}

export function AdminPublishControls({
  postId,
  title,
  status,
  featured,
  compact = false,
  disabled = false,
  onBusyChange,
  onMutated,
}: AdminPublishControlsProps) {
  const router = useRouter();
  const mutationRequestRef = useRef(false);
  const reportedBusyRef = useRef(false);
  const [isRefreshing, startTransition] = useTransition();
  const [publicationState, setPublicationState] = useState({
    featured,
    status,
  });
  const [pendingOperation, setPendingOperation] =
    useState<PublishOperation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isPublished = publicationState.status === "PUBLISHED";
  const isBusy = pendingOperation !== null || isRefreshing;

  const reportBusy = useCallback(
    (busy: boolean) => {
      if (reportedBusyRef.current === busy) {
        return;
      }

      reportedBusyRef.current = busy;
      onBusyChange?.(busy);
    },
    [onBusyChange],
  );

  useEffect(() => {
    setPublicationState({
      featured,
      status,
    });
  }, [featured, status]);

  useEffect(() => {
    if (!isBusy) {
      reportBusy(false);
    }
  }, [isBusy, reportBusy]);

  function confirmUnpublish() {
    return window.confirm(
      `取消发布文章：这会将「${title}」从公开笔记、搜索、标签、分类、归档、系列和相关文章中移除。`,
    );
  }

  function handleVisibilityToggle() {
    if (disabled || mutationRequestRef.current) {
      return;
    }

    if (isPublished && !confirmUnpublish()) {
      return;
    }

    void runMutation(isPublished ? "unpublish" : "publish");
  }

  async function runMutation(operation: PublishOperation) {
    if (disabled || mutationRequestRef.current) {
      return;
    }

    mutationRequestRef.current = true;
    reportBusy(true);
    setError(null);
    setPendingOperation(operation);

    try {
      const response = await fetch(`/api/admin/posts/${operation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ id: postId }),
      });
      const payload = (await response.json().catch(() => null)) as
        | AdminMutationPayload
        | null;

      if (!response.ok || !payload?.post) {
        setError(mutationErrorMessage(payload));
        return;
      }

      setPublicationState({
        featured: payload.post.featured,
        status: payload.post.status,
      });
      onMutated?.(payload.post);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("发布状态更新失败，请检查网络后重试。");
    } finally {
      mutationRequestRef.current = false;
      setPendingOperation(null);
    }
  }

  return (
    <div
      aria-busy={isBusy}
      className={`flex flex-wrap items-center gap-2 ${compact ? "lg:justify-end" : ""}`}
    >
      <button
        type="button"
        className={buttonClass(!isPublished)}
        disabled={disabled || isBusy}
        onClick={handleVisibilityToggle}
      >
        {isPublished ? (
          <EyeOff aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Send aria-hidden="true" className="h-4 w-4" />
        )}
        {isPublished ? "取消发布" : "发布文章"}
      </button>
      <button
        type="button"
        className={buttonClass(false)}
        disabled={disabled || isBusy}
        onClick={() =>
          void runMutation(
            publicationState.featured ? "unfeature" : "feature",
          )
        }
      >
        {publicationState.featured ? (
          <StarOff aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Star aria-hidden="true" className="h-4 w-4" />
        )}
        {publicationState.featured ? "取消精选" : "设为精选"}
      </button>
      {error ? (
        <p role="alert" className="w-full text-[13px] leading-[1.4] text-[#ff8a8a]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
