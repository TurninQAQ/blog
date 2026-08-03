import "server-only";

import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { z } from "zod";

import { inspectTextToneDirective } from "@/lib/markdown/markdown-policy";
import {
  hasOnlyAllowedMarkdownImageDestinations,
  hasOnlyAllowedMarkdownLinkDestinations,
  isAllowedCoverImageUrl,
} from "@/lib/security/url-policy";

export const invalidSlugMessage =
  "URL 路径只能使用小写字母、数字和连字符。";
export const duplicateSlugMessage = "这个 URL 路径已被其他笔记使用。";
export const duplicateCategoryMessage =
  "这个分类已存在，请直接选择。";
export const duplicateTagMessage = "这个标签已存在，请直接选择。";
export const duplicateSeriesMessage = "这个系列已存在，请直接选择。";
export const duplicateSeriesOrderMessage = "这个系列排序已被使用。";
export const missingCategoryMessage = "选择的分类不存在。";
export const missingTagMessage = "选择的标签不存在。";
export const missingSeriesMessage = "选择的系列不存在。";

export const MAX_POST_TITLE_CHARACTERS = 200;
export const MAX_POST_SLUG_CHARACTERS = 160;
export const MAX_POST_EXCERPT_CHARACTERS = 1_000;
export const MAX_POST_BODY_BYTES = 1024 * 1024;
export const MAX_POST_COVER_URL_CHARACTERS = 2_048;
export const MAX_POST_TAXONOMY_ITEMS = 32;
export const MAX_POST_ID_CHARACTERS = 64;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const invalidSeriesOrderMessage = "系列排序必须是正整数。";
const invalidBodyImageMessage = "正文包含不受支持的图片地址。";
const invalidBodyLinkMessage = "正文包含不安全的链接地址。";
const invalidTextToneDirectiveMessage =
  "正文只支持无属性的蓝、红、绿、琥珀文字颜色标记。";

type MarkdownDirectiveNode = {
  type?: string;
  name?: string;
  attributes?: Record<string, unknown>;
  children?: MarkdownDirectiveNode[];
  position?: {
    start?: { offset?: number };
  };
};

function hasOnlySupportedTextToneDirectives(markdown: string) {
  let tree: MarkdownDirectiveNode;

  try {
    tree = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .parse(markdown) as MarkdownDirectiveNode;
  } catch {
    return false;
  }

  function isValid(node: MarkdownDirectiveNode): boolean {
    if (node.type === "containerDirective" || node.type === "leafDirective") {
      return false;
    }

    if (node.type === "textDirective") {
      const directive = inspectTextToneDirective(node, markdown);

      if (directive.kind === "literal") {
        return !directive.hasLabel;
      }

      if (
        directive.kind === "invalid-tone" ||
        Object.keys(node.attributes ?? {}).length > 0
      ) {
        return false;
      }
    }

    return (node.children ?? []).every(isValid);
  }

  return isValid(tree);
}

const trimmedRequiredString = (
  message: string,
  max: number,
  maxMessage: string,
) => z.string().trim().min(1, { message }).max(max, { message: maxMessage });

const optionalTrimmedString = (max: number, message: string) =>
  z.string().trim().max(max, { message }).optional().default("");

const taxonomyIdSchema = z
  .string()
  .trim()
  .max(MAX_POST_ID_CHARACTERS, { message: "分类标识无效。" });

const optionalTaxonomyIdSchema = z
  .union([taxonomyIdSchema, z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" ? value.trim() : ""));

export const taxonomyNameInputSchema = z
  .string()
  .trim()
  .min(1, { message: "请输入名称。" })
  .max(80, { message: "名称不能超过 80 个字符。" });

const taxonomyNamesSchema = z
  .array(taxonomyNameInputSchema)
  .max(MAX_POST_TAXONOMY_ITEMS, {
    message: `每篇文章最多添加 ${MAX_POST_TAXONOMY_ITEMS} 个新标签。`,
  })
  .optional()
  .default([])
  .transform((names) => Array.from(new Set(names)));

const taxonomyIdsSchema = z
  .array(taxonomyIdSchema.min(1))
  .max(MAX_POST_TAXONOMY_ITEMS, {
    message: `每篇文章最多选择 ${MAX_POST_TAXONOMY_ITEMS} 个标签。`,
  })
  .optional()
  .default([])
  .transform((ids) => Array.from(new Set(ids)));

const seriesOrderSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value, context) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string" && value.trim() === "") {
      return null;
    }

    const numericValue = typeof value === "number" ? value : Number(value);

    if (
      !Number.isSafeInteger(numericValue) ||
      numericValue < 1 ||
      numericValue > 10_000
    ) {
      context.addIssue({
        code: "custom",
        message: invalidSeriesOrderMessage,
      });
      return z.NEVER;
    }

    return numericValue;
  });

const coverImageSchema = z
  .union([
    z.string().max(MAX_POST_COVER_URL_CHARACTERS, {
      message: "封面图 URL 不能超过 2048 个字符。",
    }),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .refine(isAllowedCoverImageUrl, {
    message: "请输入有效的封面图 URL。",
  });

const slugSchema = z
  .string()
  .trim()
  .max(MAX_POST_SLUG_CHARACTERS, {
    message: "URL 路径不能超过 160 个字符。",
  })
  .transform(normalizeEditableSlug)
  .pipe(
    z
      .string()
      .min(1, { message: invalidSlugMessage })
      .regex(slugPattern, { message: invalidSlugMessage }),
  );

const baseDraftInputSchema = z.object({
  title: trimmedRequiredString(
    "标题不能为空。",
    MAX_POST_TITLE_CHARACTERS,
    "标题不能超过 200 个字符。",
  ),
  slug: slugSchema,
  excerpt: optionalTrimmedString(
    MAX_POST_EXCERPT_CHARACTERS,
    "摘要不能超过 1000 个字符。",
  ),
  bodyMarkdown: trimmedRequiredString(
    "正文不能为空。",
    MAX_POST_BODY_BYTES,
    "正文不能超过 1 MiB。",
  )
    .refine(
      (value) => new TextEncoder().encode(value).byteLength <= MAX_POST_BODY_BYTES,
      { message: "正文不能超过 1 MiB。" },
    )
    .refine(hasOnlyAllowedMarkdownImageDestinations, {
      message: invalidBodyImageMessage,
    })
    .refine(hasOnlyAllowedMarkdownLinkDestinations, {
      message: invalidBodyLinkMessage,
    })
    .refine(hasOnlySupportedTextToneDirectives, {
      message: invalidTextToneDirectiveMessage,
    }),
  coverImage: coverImageSchema,
  featured: z.boolean().optional().default(false),
  categoryId: optionalTaxonomyIdSchema,
  newCategoryName: optionalTrimmedString(80, "分类名称不能超过 80 个字符。"),
  tagIds: taxonomyIdsSchema,
  newTagNames: taxonomyNamesSchema,
  seriesId: optionalTaxonomyIdSchema,
  newSeriesName: optionalTrimmedString(80, "系列名称不能超过 80 个字符。"),
  seriesOrder: seriesOrderSchema,
}).strict().superRefine((input, context) => {
  if (
    input.seriesOrder !== null &&
    !input.seriesId &&
    !input.newSeriesName.trim()
  ) {
    context.addIssue({
      code: "custom",
      path: ["seriesOrder"],
      message: "设置排序前请先选择系列。",
    });
  }
});

export const createPostInputSchema = baseDraftInputSchema;

export const editPostInputSchema = baseDraftInputSchema.extend({
  id: trimmedRequiredString(
    "缺少文章 ID。",
    MAX_POST_ID_CHARACTERS,
    "文章 ID 无效。",
  ),
});

export const deletePostInputSchema = z
  .object({
    id: trimmedRequiredString(
      "缺少文章 ID。",
      MAX_POST_ID_CHARACTERS,
      "文章 ID 无效。",
    ),
  })
  .strict();

export const publishPostInputSchema = deletePostInputSchema;
export const unpublishPostInputSchema = deletePostInputSchema;
export const featurePostInputSchema = deletePostInputSchema;
export const unfeaturePostInputSchema = deletePostInputSchema;

export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type EditPostInput = z.infer<typeof editPostInputSchema>;
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;
export type PublishPostInput = z.infer<typeof publishPostInputSchema>;
export type UnpublishPostInput = z.infer<typeof unpublishPostInputSchema>;
export type FeaturePostInput = z.infer<typeof featurePostInputSchema>;
export type UnfeaturePostInput = z.infer<typeof unfeaturePostInputSchema>;

export type AdminPostFieldErrors = Partial<
  Record<keyof EditPostInput | "form", string>
>;

export class AdminPostValidationError extends Error {
  fieldErrors: AdminPostFieldErrors;

  constructor(fieldErrors: AdminPostFieldErrors) {
    super("Admin post validation failed.");
    this.name = "AdminPostValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class AdminPostRequestError extends Error {
  status: 400 | 413 | 415;

  constructor(message: string, status: 400 | 413 | 415) {
    super(message);
    this.name = "AdminPostRequestError";
    this.status = status;
  }
}

export function slugifyPostTitle(title: string) {
  const normalized = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (normalized) {
    return normalized;
  }

  const fallback = Array.from(title.trim())
    .map((character) => character.codePointAt(0)?.toString(36))
    .filter(Boolean)
    .join("-");

  return fallback ? `u-${fallback}` : "";
}

export function normalizeEditableSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export function normalizeTaxonomySlug(name: string) {
  return slugifyPostTitle(name);
}

export function validationErrorFromZod(error: z.ZodError) {
  const flattened = error.flatten();
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened.fieldErrors)
      .map(([field, messages]) => [
        field,
        Array.isArray(messages) ? messages[0] : undefined,
      ])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as AdminPostFieldErrors;

  if (flattened.formErrors.length > 0) {
    fieldErrors.form = "请求包含未声明或无效的字段。";
  }

  return new AdminPostValidationError(fieldErrors);
}

export function parseCreatePostInput(input: unknown) {
  const result = createPostInputSchema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}

export function parseEditPostInput(input: unknown) {
  const result = editPostInputSchema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}

export function parseDeletePostInput(input: unknown) {
  const result = deletePostInputSchema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}

export function parsePublishPostInput(input: unknown) {
  const result = publishPostInputSchema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}

export function parseUnpublishPostInput(input: unknown) {
  const result = unpublishPostInputSchema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}

export function parseFeaturePostInput(input: unknown) {
  const result = featurePostInputSchema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}

export function parseUnfeaturePostInput(input: unknown) {
  const result = unfeaturePostInputSchema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}
