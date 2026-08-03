"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Save } from "lucide-react";

import { AdminPublishControls } from "@/components/admin/AdminPublishControls";
import { SeriesOrderInput } from "@/components/admin/SeriesOrderInput";
import {
  TaxonomyPicker,
  type TaxonomyPickerOption,
} from "@/components/admin/TaxonomyPicker";
import { UnsupportedEditorContentNotice } from "@/components/admin/UnsupportedEditorContentNotice";
import { AdminWysiwygEditorClient } from "@/components/admin/wysiwyg/AdminWysiwygEditorClient";
import type {
  AdminPostEditorPost,
  AdminSeriesOption,
  AdminTaxonomyOption,
} from "@/lib/admin/post-queries";
import {
  MAX_MARKDOWN_IMPORT_BYTES,
  MarkdownImportError,
  parseMarkdownImport,
  slugifyPostTitle,
} from "@/lib/admin/markdown-import";
import { scanMarkdownCompatibility } from "@/lib/admin/wysiwyg/compatibility";

type PostEditorShellProps = {
  mode: "create" | "edit";
  post?: AdminPostEditorPost | null;
  categories: AdminTaxonomyOption[];
  tags: AdminTaxonomyOption[];
  series: AdminSeriesOption[];
};

type DraftFormState = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  bodyMarkdown: string;
  categoryId: string;
  newCategoryName: string;
  tagIds: string[];
  newTagNames: string;
  seriesId: string;
  newSeriesName: string;
  seriesOrder: string;
  featured: boolean;
};

type EditorPublicationState = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  featured: boolean;
};

type DraftFieldErrors = Partial<Record<keyof DraftFormState | "form", string>>;

const draftFieldNames = new Set<keyof DraftFormState>([
  "title",
  "slug",
  "excerpt",
  "coverImage",
  "bodyMarkdown",
  "categoryId",
  "newCategoryName",
  "tagIds",
  "newTagNames",
  "seriesId",
  "newSeriesName",
  "seriesOrder",
  "featured",
]);

const invalidSlugMessage = "URL 路径只能使用小写字母、数字和连字符。";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function createInitialState(post?: AdminPostEditorPost | null): DraftFormState {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    coverImage: post?.coverImage ?? "",
    bodyMarkdown: post?.bodyMarkdown ?? "",
    categoryId: post?.category?.id ?? "",
    newCategoryName: "",
    tagIds: post?.tags.map((tag) => tag.id) ?? [],
    newTagNames: "",
    seriesId: post?.series?.id ?? "",
    newSeriesName: "",
    seriesOrder: post?.seriesOrder ? String(post.seriesOrder) : "",
    featured: post?.featured ?? false,
  };
}

function hasDraftContent(form: DraftFormState) {
  return Boolean(
    form.title.trim() ||
      form.slug.trim() ||
      form.excerpt.trim() ||
      form.bodyMarkdown.trim() ||
      form.coverImage.trim() ||
      form.categoryId ||
      form.newCategoryName.trim() ||
      form.tagIds.length ||
      form.newTagNames.trim() ||
      form.seriesId ||
      form.newSeriesName.trim() ||
      form.seriesOrder.trim() ||
      form.featured,
  );
}

function normalizedOptionValue(value: string) {
  return value.trim().toLocaleLowerCase();
}

function findTaxonomyOption<T extends AdminTaxonomyOption | AdminSeriesOption>(
  options: T[],
  value: string,
) {
  const normalized = normalizedOptionValue(value);

  return options.find((option) => {
    const label = "name" in option ? option.name : option.title;

    return (
      normalizedOptionValue(label) === normalized ||
      normalizedOptionValue(option.slug) === normalized
    );
  });
}

function validateDraft(form: DraftFormState): DraftFieldErrors {
  const errors: DraftFieldErrors = {};
  const slug = form.slug.trim().toLowerCase();
  const hasSeries = Boolean(form.seriesId || form.newSeriesName.trim());

  if (!form.title.trim()) {
    errors.title = "标题不能为空。";
  }

  if (!form.bodyMarkdown.trim()) {
    errors.bodyMarkdown = "正文不能为空。";
  }

  if (!slugPattern.test(slug)) {
    errors.slug = invalidSlugMessage;
  }

  if (form.seriesOrder.trim()) {
    const numericSeriesOrder = Number(form.seriesOrder);

    if (!hasSeries) {
      errors.seriesOrder = "设置排序前请先选择系列。";
    } else if (!Number.isInteger(numericSeriesOrder) || numericSeriesOrder < 1) {
      errors.seriesOrder = "系列排序必须是正整数。";
    }
  }

  return errors;
}

function normalizeDraftFieldErrors(
  fieldErrors: Record<string, string> | undefined,
): DraftFieldErrors {
  const normalized: DraftFieldErrors = {};
  const formMessages: string[] = [];

  for (const [field, message] of Object.entries(fieldErrors ?? {})) {
    if (typeof message !== "string" || !message.trim()) {
      continue;
    }

    if (field === "form") {
      formMessages.push(message);
    } else if (draftFieldNames.has(field as keyof DraftFormState)) {
      normalized[field as keyof DraftFormState] = message;
    } else {
      formMessages.push(message);
    }
  }

  if (formMessages.length > 0) {
    normalized.form = formMessages.join(" ");
  }

  return Object.keys(normalized).length > 0
    ? normalized
    : { form: "草稿保存失败。" };
}

function tagIdValuesEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const sortedRight = [...right].sort();

  return [...left]
    .sort()
    .every((tagId, index) => tagId === sortedRight[index]);
}

function mergeCanonicalDraft(
  current: DraftFormState,
  submitted: DraftFormState,
  canonical: DraftFormState,
) {
  const categoryUnchanged =
    current.categoryId === submitted.categoryId &&
    current.newCategoryName === submitted.newCategoryName;
  const tagsUnchanged =
    tagIdValuesEqual(current.tagIds, submitted.tagIds) &&
    current.newTagNames === submitted.newTagNames;
  const seriesUnchanged =
    current.seriesId === submitted.seriesId &&
    current.newSeriesName === submitted.newSeriesName &&
    current.seriesOrder === submitted.seriesOrder;

  return {
    title: current.title === submitted.title ? canonical.title : current.title,
    slug: current.slug === submitted.slug ? canonical.slug : current.slug,
    excerpt:
      current.excerpt === submitted.excerpt ? canonical.excerpt : current.excerpt,
    coverImage:
      current.coverImage === submitted.coverImage
        ? canonical.coverImage
        : current.coverImage,
    bodyMarkdown:
      current.bodyMarkdown === submitted.bodyMarkdown
        ? canonical.bodyMarkdown
        : current.bodyMarkdown,
    categoryId: categoryUnchanged
      ? canonical.categoryId
      : current.categoryId,
    newCategoryName: categoryUnchanged
      ? canonical.newCategoryName
      : current.newCategoryName,
    tagIds: tagsUnchanged ? canonical.tagIds : current.tagIds,
    newTagNames: tagsUnchanged
      ? canonical.newTagNames
      : current.newTagNames,
    seriesId: seriesUnchanged ? canonical.seriesId : current.seriesId,
    newSeriesName: seriesUnchanged
      ? canonical.newSeriesName
      : current.newSeriesName,
    seriesOrder: seriesUnchanged
      ? canonical.seriesOrder
      : current.seriesOrder,
    featured:
      current.featured === submitted.featured
        ? canonical.featured
        : current.featured,
  };
}

function splitTaxonomyNames(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  );
}

function taxonomyOptions(
  options: AdminTaxonomyOption[],
): TaxonomyPickerOption[] {
  return options.map((option) => ({
    id: option.id,
    label: option.name,
    slug: option.slug,
  }));
}

function seriesOptions(options: AdminSeriesOption[]): TaxonomyPickerOption[] {
  return options.map((option) => ({
    id: option.id,
    label: option.title,
    slug: option.slug,
  }));
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-2 text-[14px] leading-[1.4] text-[#ff8a8a]"
    >
      {message}
    </p>
  );
}

function TextInput({
  label,
  value,
  error,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url";
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="text-[14px] leading-[1.4] text-lab-text-muted"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 block min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3 text-[16px] leading-[1.5] text-lab-text outline-none transition-colors duration-150 placeholder:text-lab-muted focus:border-[var(--lab-border-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-border-active)]"
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function PostEditorShell({
  mode,
  post,
  categories,
  tags,
  series,
}: PostEditorShellProps) {
  const router = useRouter();
  const excerptId = useId();
  const excerptErrorId = `${excerptId}-error`;
  const markdownImportInputRef = useRef<HTMLInputElement | null>(null);
  const importRequestRef = useRef(0);
  const importBusyRef = useRef(false);
  const saveRequestRef = useRef(false);
  const publicationBusyRef = useRef(false);
  const formRevisionRef = useRef(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPublicationBusy, setIsPublicationBusy] = useState(false);
  const [isRefreshing, startTransition] = useTransition();
  const [form, setForm] = useState(() => createInitialState(post));
  const formRef = useRef(form);
  const [savedPostId, setSavedPostId] = useState(post?.id ?? "");
  const [publicationState, setPublicationState] =
    useState<EditorPublicationState>({
      id: post?.id ?? "",
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      status: post?.status ?? "DRAFT",
      publishedAt: post?.publishedAt ?? null,
      featured: post?.featured ?? false,
    });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [errors, setErrors] = useState<DraftFieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasSeries = Boolean(form.seriesId || form.newSeriesName.trim());
  const categoryOptions = taxonomyOptions(categories);
  const tagOptions = taxonomyOptions(tags);
  const seriesPickerOptions = seriesOptions(series);
  const compatibility = useMemo(
    () =>
      scanMarkdownCompatibility(mode === "edit" ? post?.bodyMarkdown ?? "" : ""),
    [mode, post?.bodyMarkdown],
  );
  const showVisualEditor = mode === "create" || compatibility.compatible;

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const handlePublicationBusyChange = useCallback((busy: boolean) => {
    publicationBusyRef.current = busy;
    setIsPublicationBusy((current) => (current === busy ? current : busy));
  }, []);

  function markDraftChanged() {
    formRevisionRef.current += 1;
    setHasUnsavedChanges(true);
    setStatus(null);
  }

  function updateForm(patch: Partial<DraftFormState>) {
    markDraftChanged();
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function updateTitle(title: string) {
    markDraftChanged();
    setForm((current) => ({
      ...current,
      title,
      slug: slugManuallyEdited ? current.slug : slugifyPostTitle(title),
    }));
  }

  async function importMarkdown(file: File) {
    if (importBusyRef.current) {
      return;
    }

    const requestId = importRequestRef.current + 1;
    importRequestRef.current = requestId;
    importBusyRef.current = true;
    setIsImporting(true);

    try {
      if (file.size > MAX_MARKDOWN_IMPORT_BYTES) {
        throw new MarkdownImportError("Markdown 文件不能超过 1 MiB。");
      }

      const imported = parseMarkdownImport({
        bytes: new Uint8Array(await file.arrayBuffer()),
        fileName: file.name,
      });

      if (requestId !== importRequestRef.current) {
        return;
      }

      if (
        hasDraftContent(formRef.current) &&
        !window.confirm("导入会覆盖当前未保存的草稿内容，是否继续？")
      ) {
        return;
      }

      const category = imported.categoryName
        ? findTaxonomyOption(categories, imported.categoryName)
        : undefined;
      const importedSeries = imported.seriesName
        ? findTaxonomyOption(series, imported.seriesName)
        : undefined;
      const matchedTags = imported.tagNames
        .map((name) => ({ name, option: findTaxonomyOption(tags, name) }))
        .filter(
          (entry): entry is typeof entry & { option: AdminTaxonomyOption } =>
            Boolean(entry.option),
        );
      const matchedTagIds = Array.from(
        new Set(matchedTags.map((entry) => entry.option.id)),
      );
      const matchedTagNames = new Set(
        matchedTags.map((entry) => normalizedOptionValue(entry.name)),
      );
      const newTagNames = imported.tagNames.filter(
        (name) => !matchedTagNames.has(normalizedOptionValue(name)),
      );

      markDraftChanged();
      setForm({
        ...createInitialState(),
        title: imported.title,
        slug: imported.slug,
        excerpt: imported.excerpt,
        coverImage: imported.coverImage,
        bodyMarkdown: imported.bodyMarkdown,
        categoryId: category?.id ?? "",
        newCategoryName: category ? "" : imported.categoryName,
        tagIds: matchedTagIds,
        newTagNames: newTagNames.join(", "),
        seriesId: importedSeries?.id ?? "",
        newSeriesName: importedSeries ? "" : imported.seriesName,
        seriesOrder: imported.seriesOrder ? String(imported.seriesOrder) : "",
      });
      setSlugManuallyEdited(true);
      setErrors({});
      setStatus(
        `已导入 ${file.name}${
          imported.normalizationNotes.length > 0
            ? `；${imported.normalizationNotes.join("；")}`
            : ""
        }。请检查后保存草稿。`,
      );
    } catch (error) {
      if (requestId !== importRequestRef.current) {
        return;
      }

      setStatus(null);
      setErrors({
        form:
          error instanceof MarkdownImportError
            ? error.message
            : "Markdown 文件读取失败。",
      });
    } finally {
      if (requestId === importRequestRef.current) {
        importBusyRef.current = false;
        setIsImporting(false);
      }
    }
  }

  async function saveDraft() {
    if (
      saveRequestRef.current ||
      publicationBusyRef.current ||
      importBusyRef.current
    ) {
      return;
    }

    if (!showVisualEditor) {
      setStatus(null);
      setErrors({
        form: "当前正文无法进入可视化编辑，不能保存。",
      });
      return;
    }

    const submittedForm = {
      ...form,
      tagIds: [...form.tagIds],
    };
    const nextForm = {
      ...submittedForm,
      slug: form.slug.trim().toLowerCase(),
    };
    const nextErrors = validateDraft(nextForm);

    setStatus(null);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    saveRequestRef.current = true;
    const submittedRevision = formRevisionRef.current;
    setIsSaving(true);

    try {
      const operation = savedPostId ? "edit" : "create";
      const response = await fetch(`/api/admin/posts/${operation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          ...nextForm,
          id: savedPostId || undefined,
          categoryId: nextForm.categoryId || null,
          newCategoryName: nextForm.newCategoryName.trim(),
          tagIds: nextForm.tagIds,
          newTagNames: splitTaxonomyNames(nextForm.newTagNames),
          seriesId: nextForm.seriesId || null,
          newSeriesName: nextForm.newSeriesName.trim(),
          featured: nextForm.featured,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            fieldErrors?: Record<string, string>;
            post?: {
              id: string;
              title: string;
              slug: string;
              status: string;
              publishedAt: string | null;
              featured: boolean;
              categoryId: string | null;
              seriesId: string | null;
              seriesOrder: number | null;
              tagIds: string[];
            };
          }
        | null;

      if (!response.ok) {
        setErrors(normalizeDraftFieldErrors(payload?.fieldErrors));
        return;
      }

      if (payload?.post?.id) {
        setSavedPostId(payload.post.id);
        setPublicationState({
          id: payload.post.id,
          title: payload.post.title,
          slug: payload.post.slug,
          status: payload.post.status,
          publishedAt: payload.post.publishedAt,
          featured: payload.post.featured,
        });
      }

      const canonicalForm: DraftFormState = {
        ...nextForm,
        title: payload?.post?.title ?? nextForm.title,
        slug: payload?.post?.slug ?? nextForm.slug,
        featured: payload?.post?.featured ?? nextForm.featured,
        categoryId: payload?.post
          ? (payload.post.categoryId ?? "")
          : nextForm.categoryId,
        newCategoryName: "",
        tagIds: payload?.post?.tagIds ?? nextForm.tagIds,
        newTagNames: "",
        seriesId: payload?.post
          ? (payload.post.seriesId ?? "")
          : nextForm.seriesId,
        newSeriesName: "",
        seriesOrder:
          payload?.post?.seriesOrder === null
            ? ""
            : String(payload?.post?.seriesOrder ?? nextForm.seriesOrder),
      };
      const savedCurrentRevision =
        formRevisionRef.current === submittedRevision;

      setForm((current) =>
        mergeCanonicalDraft(current, submittedForm, canonicalForm),
      );
      setErrors({});
      setHasUnsavedChanges(!savedCurrentRevision);
      setStatus(
        savedCurrentRevision
          ? (payload?.message ?? "草稿已保存")
          : "已保存上一版本；仍有未保存更改",
      );
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErrors({ form: "草稿保存失败，请检查网络后重试。" });
    } finally {
      saveRequestRef.current = false;
      setIsSaving(false);
    }
  }

  function handlePublicationMutation(nextPost: {
    id: string;
    title: string;
    slug: string;
    status: string;
    publishedAt: string | null;
    featured: boolean;
  }) {
    setPublicationState(nextPost);
    setForm((current) => ({
      ...current,
      featured: nextPost.featured,
    }));
    setStatus(nextPost.status === "PUBLISHED" ? "文章已发布" : "文章状态已更新");
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="min-w-0">
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2 rounded-lab border border-[var(--lab-border-hairline)] px-3 text-[14px] leading-[1.4] text-lab-text-muted hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            返回仪表盘
          </Link>
          <h1 className="mt-5 text-[28px] font-semibold leading-[1.2] text-lab-text max-[360px]:text-[20px]">
            {mode === "create" ? "新建草稿" : "编辑草稿"}
          </h1>
          <p className="mt-3 text-[16px] leading-[1.5] text-lab-text-muted">
            将技术笔记先保存为聚焦的 Markdown 草稿。
          </p>
          {mode === "create" ? (
            <div className="mt-4">
              <input
                ref={markdownImportInputRef}
                type="file"
                accept=".md,.markdown,text/markdown,text/plain"
                className="hidden"
                data-testid="markdown-import-input"
                disabled={isImporting}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void importMarkdown(file);
                  }

                  event.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={isImporting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface px-3 text-[14px] font-semibold leading-[1.4] text-lab-text hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong"
                onClick={() => markdownImportInputRef.current?.click()}
              >
                <FileUp aria-hidden="true" className="h-4 w-4" />
                {isImporting ? "正在解析…" : "导入 Markdown"}
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div
        data-testid="editor-actions"
        aria-busy={
          isSaving || isRefreshing || isPublicationBusy || isImporting
        }
        className="flex flex-col items-stretch gap-2 lg:sticky lg:top-4 lg:z-20 lg:ml-auto lg:w-fit lg:max-w-full lg:rounded-lab lg:border lg:border-[var(--lab-border-hairline)] lg:bg-lab-surface lg:p-3 lg:shadow-[3px_3px_0_rgba(16,18,23,0.12)]"
      >
        {status || hasUnsavedChanges ? (
          <p
            role="status"
            className="rounded-lab border border-[var(--lab-border-active)] px-3 py-2 text-[14px] leading-[1.4] text-lab-accent"
          >
            {status ?? "有未保存更改"}
          </p>
        ) : null}
        {savedPostId ? (
          <AdminPublishControls
            postId={savedPostId}
            title={publicationState.title}
            status={publicationState.status}
            featured={publicationState.featured}
            disabled={
              isSaving || isRefreshing || isImporting || hasUnsavedChanges
            }
            onBusyChange={handlePublicationBusyChange}
            onMutated={handlePublicationMutation}
          />
        ) : null}
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border border-[var(--lab-border-active)] bg-lab-accent px-4 text-[14px] font-semibold leading-[1.4] text-lab-base hover:bg-lab-text disabled:cursor-not-allowed disabled:opacity-70"
          disabled={
            isSaving ||
            isRefreshing ||
            isPublicationBusy ||
            isImporting ||
            !showVisualEditor
          }
          onClick={saveDraft}
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          保存草稿
        </button>
      </div>

      {errors.form ? (
        <p
          role="alert"
          className="rounded-lab border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-[14px] leading-[1.4] text-[#ff8a8a]"
        >
          {errors.form}
        </p>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-5 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4 sm:p-6">
          <TextInput
            label="标题"
            value={form.title}
            error={errors.title}
            placeholder="React Server Components 笔记"
            onChange={updateTitle}
          />
          <TextInput
            label="URL 路径"
            value={form.slug}
            error={errors.slug}
            placeholder="react-server-components-notes"
            onChange={(value) => {
              setSlugManuallyEdited(true);
              updateForm({ slug: value });
            }}
          />
          <div>
            <label
              htmlFor={excerptId}
              className="text-[14px] leading-[1.4] text-lab-text-muted"
            >
              摘要
            </label>
            <textarea
              id={excerptId}
              value={form.excerpt}
              rows={3}
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={errors.excerpt ? excerptErrorId : undefined}
              className="mt-2 block w-full resize-y rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3 py-2 text-[16px] leading-[1.5] text-lab-text outline-none transition-colors duration-150 placeholder:text-lab-muted focus:border-[var(--lab-border-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lab-border-active)]"
              placeholder="用于列表和公开卡片的简短摘要。"
              onChange={(event) => updateForm({ excerpt: event.target.value })}
            />
            <FieldError id={excerptErrorId} message={errors.excerpt} />
          </div>

          {showVisualEditor ? (
            <AdminWysiwygEditorClient
              value={form.bodyMarkdown}
              error={errors.bodyMarkdown}
              onMarkdownChange={(bodyMarkdown) => updateForm({ bodyMarkdown })}
            />
          ) : (
            <UnsupportedEditorContentNotice issues={compatibility.issues} />
          )}
        </section>

        <aside className="grid gap-5 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4 sm:p-6 xl:grid-cols-2 2xl:block 2xl:space-y-5">
          <div>
            <p className="font-mono text-[13px] leading-[1.4] text-lab-accent">
              状态
            </p>
            <p className="mt-2 inline-flex min-h-9 items-center rounded-lab border border-[var(--lab-border-active)] px-3 font-mono text-[13px] leading-[1.4] text-lab-accent">
              {publicationState.status === "PUBLISHED" ? "已发布" : "草稿"}
            </p>
            {publicationState.featured ? (
              <p className="mt-2 inline-flex min-h-9 items-center rounded-lab border border-[var(--lab-border-active)] px-3 font-mono text-[13px] leading-[1.4] text-lab-accent">
                精选
              </p>
            ) : null}
          </div>
          <TextInput
            label="封面图 URL"
            type="url"
            value={form.coverImage}
            error={errors.coverImage}
            placeholder="https://example.com/cover.png"
            onChange={(value) => updateForm({ coverImage: value })}
          />
          <TaxonomyPicker
            kind="category"
            label="分类"
            newLabel="新建分类"
            emptyLabel="未分类"
            options={categoryOptions}
            value={form.categoryId}
            newValue={form.newCategoryName}
            valueError={errors.categoryId}
            newValueError={errors.newCategoryName}
            placeholder="架构"
            onValueChange={(categoryId) =>
              updateForm({
                categoryId,
                newCategoryName: "",
              })
            }
            onNewValueChange={(newCategoryName) =>
              updateForm({
                categoryId: newCategoryName.trim() ? "" : form.categoryId,
                newCategoryName,
              })
            }
          />
          <TaxonomyPicker
            kind="tags"
            label="标签"
            newLabel="新建标签"
            options={tagOptions}
            values={form.tagIds}
            newValue={form.newTagNames}
            valuesError={errors.tagIds}
            newValueError={errors.newTagNames}
            placeholder="Next.js, Prisma"
            onValuesChange={(tagIds) => updateForm({ tagIds })}
            onNewValueChange={(newTagNames) => updateForm({ newTagNames })}
          />
          <TaxonomyPicker
            kind="series"
            label="系列"
            newLabel="新建系列"
            emptyLabel="无系列"
            options={seriesPickerOptions}
            value={form.seriesId}
            newValue={form.newSeriesName}
            valueError={errors.seriesId}
            newValueError={errors.newSeriesName}
            placeholder="构建日志"
            onValueChange={(seriesId) =>
              updateForm({
                seriesId,
                newSeriesName: "",
                seriesOrder: seriesId ? form.seriesOrder : "",
              })
            }
            onNewValueChange={(newSeriesName) =>
              updateForm({
                seriesId: newSeriesName.trim() ? "" : form.seriesId,
                newSeriesName,
                seriesOrder:
                  newSeriesName.trim() || form.seriesId
                    ? form.seriesOrder
                    : "",
              })
            }
          />
          {hasSeries ? (
            <SeriesOrderInput
              value={form.seriesOrder}
              error={errors.seriesOrder}
              onChange={(seriesOrder) => updateForm({ seriesOrder })}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
