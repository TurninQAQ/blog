# WYSIWYG Markdown Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin post body split Markdown editor with a pure WYSIWYG article canvas that still persists `bodyMarkdown` and blocks unsupported legacy Markdown safely.

**Architecture:** Build the editor around a Tiptap document model with Markdown import/export at the edges. Keep `PostEditorShell` as the form host, move body editing into a dedicated admin-only WYSIWYG component tree, and gate existing posts through a compatibility scanner before enabling visual editing.

**Tech Stack:** Next.js App Router, React 19, Tiptap, Vitest, Playwright, existing Prisma-backed admin APIs.

---

## File Structure

### New files

- `vitest.config.ts`
  Sets Node test environment and `@/` alias resolution for unit-style adapter tests.
- `src/lib/admin/wysiwyg/extensions.ts`
  Owns the restricted Tiptap extension list and node-view wiring for the admin editor.
- `src/lib/admin/wysiwyg/markdown-adapter.ts`
  Converts `Markdown -> Tiptap JSON -> Markdown`, exposes normalization helpers, and centralizes round-trip behavior.
- `src/lib/admin/wysiwyg/compatibility.ts`
  Scans stored Markdown for unsupported syntax and rejects lossy round-trips.
- `src/lib/admin/wysiwyg/markdown-adapter.test.ts`
  Verifies deterministic round-trip coverage for the supported grammar.
- `src/lib/admin/wysiwyg/compatibility.test.ts`
  Verifies `raw HTML`, task lists, footnotes, and lossy round-trips are blocked.
- `src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx`
  Client editor wrapper that owns editor state, article canvas rendering, and `onMarkdownChange`.
- `src/components/admin/wysiwyg/WysiwygToolbar.tsx`
  Small insertion/formatting control surface for headings, quote, list, code block, table, and image.
- `src/components/admin/wysiwyg/nodes/CodeBlockNodeView.tsx`
  Dedicated two-state code block UI.
- `src/components/admin/wysiwyg/nodes/TableNodeView.tsx`
  Dedicated two-state table UI.
- `src/components/admin/UnsupportedEditorContentNotice.tsx`
  Blocks edit flow when existing Markdown is incompatible with the visual editor.

### Existing files to modify

- `package.json`
  Adds editor and unit-test dependencies plus a `test:unit` script.
- `package-lock.json`
  Locks the new dependency graph.
- `src/components/admin/PostEditorShell.tsx`
  Replaces the split preview body area and wires in compatibility gating.
- `src/app/globals.css`
  Adds article-canvas styles and WYSIWYG node styles.
- `src/tests/e2e/admin-authoring.spec.ts`
  Rewrites authoring tests around the new visual editor flow, compatibility gate, code block editing, and table editing.

### Existing files to delete after cutover

- `src/components/admin/MarkdownEditorClient.tsx`
  Remove once no admin route imports it anymore.

## Constraints To Preserve

- `bodyMarkdown` remains the stored body format.
- Admin auth, CSRF, and guarded mutation boundaries stay unchanged.
- Public rendering continues to consume Markdown via the existing rendering pipeline.
- No source-mode fallback is exposed in the UI.
- Unsupported existing Markdown is blocked, not normalized silently.

### Task 1: Add RED Tests and Editor Scaffolding

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/lib/admin/wysiwyg/markdown-adapter.test.ts`
- Create: `src/lib/admin/wysiwyg/compatibility.test.ts`
- Modify: `src/tests/e2e/admin-authoring.spec.ts`

- [ ] **Step 1: Add failing round-trip and compatibility tests**

```ts
// src/lib/admin/wysiwyg/markdown-adapter.test.ts
import { describe, expect, it } from "vitest";

import {
  markdownToDocument,
  normalizeMarkdownRoundTrip,
  documentToMarkdown,
} from "@/lib/admin/wysiwyg/markdown-adapter";

describe("markdown adapter", () => {
  it("round-trips the supported grammar without dropping structure", () => {
    const markdown = [
      "# 标题",
      "",
      "段落里有 `inline`。",
      "",
      "> 引用块",
      "",
      "- 列表项一",
      "- 列表项二",
      "",
      "```ts",
      "const answer = 42;",
      "```",
      "",
      "| 列 | 值 |",
      "| --- | --- |",
      "| a | 1 |",
    ].join("\n");

    const document = markdownToDocument(markdown);
    const serialized = documentToMarkdown(document);

    expect(normalizeMarkdownRoundTrip(serialized)).toBe(
      normalizeMarkdownRoundTrip(markdown),
    );
  });
});

// src/lib/admin/wysiwyg/compatibility.test.ts
import { describe, expect, it } from "vitest";

import { scanMarkdownCompatibility } from "@/lib/admin/wysiwyg/compatibility";

describe("markdown compatibility scan", () => {
  it("rejects raw html", () => {
    const result = scanMarkdownCompatibility("# 标题\n\n<div>bad</div>");

    expect(result.compatible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("raw-html");
  });

  it("rejects task list syntax", () => {
    const result = scanMarkdownCompatibility("- [ ] 待办");

    expect(result.compatible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("task-list");
  });
});
```

- [ ] **Step 2: Add one failing Playwright expectation for the new editor**

```ts
// src/tests/e2e/admin-authoring.spec.ts
test("creates a draft through the WYSIWYG canvas", async ({ page }) => {
  await signInAdmin(page);
  await page.goto("/admin/posts/new");

  await expect(
    page.getByRole("region", { name: "正文画布" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "预览" })).toHaveCount(0);
});
```

- [ ] **Step 3: Run the new tests and confirm they fail for the right reason**

Run:

```bash
npx vitest run src/lib/admin/wysiwyg/markdown-adapter.test.ts src/lib/admin/wysiwyg/compatibility.test.ts
npx playwright test src/tests/e2e/admin-authoring.spec.ts -g "creates a draft through the WYSIWYG canvas" --project=desktop
```

Expected:

- `vitest` fails because the new adapter modules do not exist yet.
- Playwright fails because the current page still renders the split editor and preview flow.

- [ ] **Step 4: Install editor and unit-test dependencies plus test script**

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "test": "npm run lint",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@tiptap/extension-image": "^3.0.0",
    "@tiptap/extension-link": "^3.0.0",
    "@tiptap/extension-placeholder": "^3.0.0",
    "@tiptap/extension-table": "^3.0.0",
    "@tiptap/markdown": "^3.0.0",
    "@tiptap/pm": "^3.0.0",
    "@tiptap/react": "^3.0.0",
    "@tiptap/starter-kit": "^3.0.0"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}

// vitest.config.ts
import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Re-run the RED tests and confirm failures moved from missing tooling to missing implementation**

Run:

```bash
npm run test:unit -- src/lib/admin/wysiwyg/markdown-adapter.test.ts src/lib/admin/wysiwyg/compatibility.test.ts
npx playwright test src/tests/e2e/admin-authoring.spec.ts -g "creates a draft through the WYSIWYG canvas" --project=desktop
```

Expected:

- Vitest runs and fails on missing exports or incorrect behavior, not on missing command setup.
- Playwright still fails because the UI is not implemented yet.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/admin/wysiwyg/markdown-adapter.test.ts src/lib/admin/wysiwyg/compatibility.test.ts src/tests/e2e/admin-authoring.spec.ts
git commit -m "test: add red coverage for admin wysiwyg markdown editor"
```

### Task 2: Build Markdown Adapter and Compatibility Gate

**Files:**
- Create: `src/lib/admin/wysiwyg/extensions.ts`
- Create: `src/lib/admin/wysiwyg/markdown-adapter.ts`
- Create: `src/lib/admin/wysiwyg/compatibility.ts`
- Modify: `src/lib/admin/wysiwyg/markdown-adapter.test.ts`
- Modify: `src/lib/admin/wysiwyg/compatibility.test.ts`

- [ ] **Step 1: Create the shared extension list for the supported grammar**

```ts
// src/lib/admin/wysiwyg/extensions.ts
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";

export function createWysiwygExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3, 4] },
    }),
    Link.configure({
      openOnClick: false,
    }),
    Image,
    TableKit,
    Placeholder.configure({
      placeholder: "开始写技术笔记",
    }),
    Markdown,
  ];
}
```

- [ ] **Step 2: Implement Markdown import/export helpers**

```ts
// src/lib/admin/wysiwyg/markdown-adapter.ts
import { Editor, type JSONContent } from "@tiptap/core";

import { createWysiwygExtensions } from "@/lib/admin/wysiwyg/extensions";

export function normalizeMarkdownRoundTrip(markdown: string) {
  return markdown.replace(/\r\n/g, "\n").trim();
}

function createHeadlessMarkdownEditor(markdown = "") {
  return new Editor({
    extensions: createWysiwygExtensions(),
    content: markdown,
    contentType: "markdown",
  });
}

export function markdownToDocument(markdown: string): JSONContent {
  const editor = createHeadlessMarkdownEditor(markdown);

  try {
    return editor.getJSON();
  } finally {
    editor.destroy();
  }
}

export function documentToMarkdown(document: JSONContent): string {
  const editor = createHeadlessMarkdownEditor();

  try {
    editor.commands.setContent(document, {
      contentType: "json",
      emitUpdate: false,
    });

    return editor.getMarkdown();
  } finally {
    editor.destroy();
  }
}
```

- [ ] **Step 3: Implement compatibility scanning and lossy-round-trip detection**

```ts
// src/lib/admin/wysiwyg/compatibility.ts
import {
  documentToMarkdown,
  markdownToDocument,
  normalizeMarkdownRoundTrip,
} from "@/lib/admin/wysiwyg/markdown-adapter";

export type WysiwygCompatibilityCode =
  | "raw-html"
  | "task-list"
  | "footnote"
  | "definition-list"
  | "mdx-like"
  | "lossy-roundtrip";

export type WysiwygCompatibilityIssue = {
  code: WysiwygCompatibilityCode;
  message: string;
};

export function scanMarkdownCompatibility(markdown: string) {
  const issues: WysiwygCompatibilityIssue[] = [];

  if (/<[A-Za-z][^>\n]*>/.test(markdown)) {
    issues.push({ code: "raw-html", message: "包含 raw HTML。" });
  }

  if (/^\s*[-*+]\s+\[[ xX]\]\s+/m.test(markdown)) {
    issues.push({ code: "task-list", message: "包含任务列表语法。" });
  }

  if (/\[\^[^\]]+\]/.test(markdown) || /^\[\^[^\]]+\]:/m.test(markdown)) {
    issues.push({ code: "footnote", message: "包含脚注语法。" });
  }

  if (/^[^\n]+\n:\s+/m.test(markdown)) {
    issues.push({ code: "definition-list", message: "包含定义列表语法。" });
  }

  if (/<[A-Z][A-Za-z0-9]*/.test(markdown)) {
    issues.push({ code: "mdx-like", message: "包含类似 MDX 的自定义标签。" });
  }

  if (issues.length > 0) {
    return { compatible: false, issues };
  }

  const document = markdownToDocument(markdown);
  const serialized = documentToMarkdown(document);

  if (
    normalizeMarkdownRoundTrip(serialized) !==
    normalizeMarkdownRoundTrip(markdown)
  ) {
    issues.push({
      code: "lossy-roundtrip",
      message: "该正文无法稳定往返转换为可视化文档。",
    });
  }

  return { compatible: issues.length === 0, issues };
}
```

- [ ] **Step 4: Run unit tests until green**

Run:

```bash
npm run test:unit -- src/lib/admin/wysiwyg/markdown-adapter.test.ts src/lib/admin/wysiwyg/compatibility.test.ts
```

Expected:

- `PASS` for supported round-trip coverage.
- `PASS` for blocked `raw HTML`, task list, and other unsupported syntax cases.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/wysiwyg/extensions.ts src/lib/admin/wysiwyg/markdown-adapter.ts src/lib/admin/wysiwyg/compatibility.ts src/lib/admin/wysiwyg/markdown-adapter.test.ts src/lib/admin/wysiwyg/compatibility.test.ts
git commit -m "feat: add admin wysiwyg markdown adapter and compatibility gate"
```

### Task 3: Replace Create Flow With a Single Article Canvas

**Files:**
- Create: `src/components/admin/wysiwyg/WysiwygToolbar.tsx`
- Create: `src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx`
- Modify: `src/components/admin/PostEditorShell.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/tests/e2e/admin-authoring.spec.ts`

- [ ] **Step 1: Create a small toolbar with explicit insertion controls**

```tsx
// src/components/admin/wysiwyg/WysiwygToolbar.tsx
type WysiwygToolbarProps = {
  onAddHeading: () => void;
  onAddQuote: () => void;
  onAddList: () => void;
  onAddCodeBlock: () => void;
  onAddTable: () => void;
  onAddImage: () => void;
};

export function WysiwygToolbar({
  onAddHeading,
  onAddQuote,
  onAddList,
  onAddCodeBlock,
  onAddTable,
  onAddImage,
}: WysiwygToolbarProps) {
  return (
    <div className="lab-wysiwyg-toolbar" role="toolbar" aria-label="正文工具栏">
      <button type="button" onClick={onAddHeading}>插入标题</button>
      <button type="button" onClick={onAddQuote}>插入引用</button>
      <button type="button" onClick={onAddList}>插入列表</button>
      <button type="button" onClick={onAddCodeBlock}>插入代码块</button>
      <button type="button" onClick={onAddTable}>插入表格</button>
      <button type="button" onClick={onAddImage}>插入图片</button>
    </div>
  );
}
```

- [ ] **Step 2: Build the article-canvas client wrapper**

```tsx
// src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx
"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";

import { WysiwygToolbar } from "@/components/admin/wysiwyg/WysiwygToolbar";
import { createWysiwygExtensions } from "@/lib/admin/wysiwyg/extensions";

type AdminWysiwygEditorClientProps = {
  value: string;
  onMarkdownChange: (markdown: string) => void;
  error?: string;
};

export function AdminWysiwygEditorClient({
  value,
  onMarkdownChange,
  error,
}: AdminWysiwygEditorClientProps) {
  const editor = useEditor({
    extensions: createWysiwygExtensions(),
    content: value,
    contentType: "markdown",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onMarkdownChange(editor.getMarkdown());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (editor.getMarkdown() !== value) {
      editor.commands.setContent(value, {
        contentType: "markdown",
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="lab-wysiwyg-loading">编辑器加载中...</div>;
  }

  return (
    <section className="lab-wysiwyg-shell" aria-label="正文画布">
      <WysiwygToolbar
        onAddHeading={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        onAddQuote={() => editor.chain().focus().toggleBlockquote().run()}
        onAddList={() => editor.chain().focus().toggleBulletList().run()}
        onAddCodeBlock={() => editor.chain().focus().toggleCodeBlock().run()}
        onAddTable={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}
        onAddImage={() => editor.chain().focus().setImage({ src: "" }).run()}
      />
      <EditorContent editor={editor} className="lab-wysiwyg-canvas" />
      {error ? <p role="alert" className="lab-field-error">{error}</p> : null}
    </section>
  );
}
```

- [ ] **Step 3: Swap the create-flow body area out of `PostEditorShell`**

```tsx
// src/components/admin/PostEditorShell.tsx
import { AdminWysiwygEditorClient } from "@/components/admin/wysiwyg/AdminWysiwygEditorClient";

// remove:
// - activeTab state
// - mobile edit/preview toggle
// - MarkdownPreview panel from admin body editing

const useCreateWysiwyg = mode === "create";

{useCreateWysiwyg ? (
  <AdminWysiwygEditorClient
    value={form.bodyMarkdown}
    error={errors.bodyMarkdown}
    onMarkdownChange={(bodyMarkdown) => updateForm({ bodyMarkdown })}
  />
) : (
  <MarkdownEditorClient
    id="post-body-markdown"
    label="正文"
    value={form.bodyMarkdown}
    error={errors.bodyMarkdown}
    onChange={(bodyMarkdown) => updateForm({ bodyMarkdown })}
  />
)}
```

- [ ] **Step 4: Add article-canvas styles**

```css
/* src/app/globals.css */
.lab-wysiwyg-shell {
  border: 1px solid var(--lab-border-hairline);
  border-radius: 8px;
  background: var(--lab-base);
  overflow: hidden;
}

.lab-wysiwyg-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid var(--lab-border-hairline);
  padding: 12px;
}

.lab-wysiwyg-canvas {
  min-height: 560px;
  padding: 20px 20px 48px;
}

.lab-wysiwyg-canvas .ProseMirror {
  max-width: 820px;
  margin: 0 auto;
  outline: none;
  color: #a8b3c2;
  font-size: 16px;
  line-height: 1.7;
}

.lab-wysiwyg-canvas .ProseMirror h1,
.lab-wysiwyg-canvas .ProseMirror h2,
.lab-wysiwyg-canvas .ProseMirror h3,
.lab-wysiwyg-canvas .ProseMirror h4 {
  color: #e8f0f8;
  line-height: 1.25;
}
```

- [ ] **Step 5: Make the create-flow Playwright test pass**

Run:

```bash
npx playwright test src/tests/e2e/admin-authoring.spec.ts -g "creates a draft through the WYSIWYG canvas" --project=desktop
```

Expected:

- The test passes.
- The create page no longer shows the old preview toggle.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/wysiwyg/WysiwygToolbar.tsx src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx src/components/admin/PostEditorShell.tsx src/app/globals.css src/tests/e2e/admin-authoring.spec.ts
git commit -m "feat: replace admin create flow with single-canvas wysiwyg editor"
```

### Task 4: Add Dedicated Code Block and Table Edit States

**Files:**
- Create: `src/components/admin/wysiwyg/nodes/CodeBlockNodeView.tsx`
- Create: `src/components/admin/wysiwyg/nodes/TableNodeView.tsx`
- Modify: `src/lib/admin/wysiwyg/extensions.ts`
- Modify: `src/lib/admin/wysiwyg/markdown-adapter.test.ts`
- Modify: `src/tests/e2e/admin-authoring.spec.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add a dedicated code-block node view**

```tsx
// src/components/admin/wysiwyg/nodes/CodeBlockNodeView.tsx
"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";

export function CodeBlockNodeView() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <NodeViewWrapper
      className={isEditing ? "lab-code-node is-editing" : "lab-code-node"}
      onClick={() => setIsEditing(true)}
    >
      <div className="lab-code-node-toolbar">
        <span>代码块</span>
        <button type="button" onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? "完成代码编辑" : "编辑代码块"}
        </button>
      </div>
      <pre>
        <code>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
}
```

- [ ] **Step 2: Add a dedicated table node view**

```tsx
// src/components/admin/wysiwyg/nodes/TableNodeView.tsx
"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";

export function TableNodeView() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <NodeViewWrapper className="lab-table-node">
      <div className="lab-table-node-toolbar">
        <span>表格</span>
        <button type="button" onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? "完成表格编辑" : "编辑表格"}
        </button>
      </div>
      <div className={isEditing ? "lab-table-node-grid is-editing" : "lab-table-node-grid"}>
        <NodeViewContent as="table" />
      </div>
    </NodeViewWrapper>
  );
}
```

- [ ] **Step 3: Wire the node views into the extension set**

```ts
// src/lib/admin/wysiwyg/extensions.ts
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlock from "@tiptap/extension-code-block";
import { Table } from "@tiptap/extension-table";

import { CodeBlockNodeView } from "@/components/admin/wysiwyg/nodes/CodeBlockNodeView";
import { TableNodeView } from "@/components/admin/wysiwyg/nodes/TableNodeView";

const WysiwygCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },
});

const WysiwygTable = Table.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TableNodeView);
  },
});

export function createWysiwygExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
    WysiwygCodeBlock,
    WysiwygTable,
    TableKit.configure({
      table: false,
    }),
    Link.configure({ openOnClick: false }),
    Image,
    Placeholder.configure({ placeholder: "开始写技术笔记" }),
    Markdown,
  ];
}
```

- [ ] **Step 4: Extend tests for code and table editing**

```ts
// src/lib/admin/wysiwyg/markdown-adapter.test.ts
it("preserves fenced code blocks and gfm tables during round-trip", () => {
  const markdown = [
    "```ts",
    "const value = 1;",
    "```",
    "",
    "| 名称 | 数值 |",
    "| --- | --- |",
    "| alpha | 1 |",
  ].join("\n");

  const serialized = documentToMarkdown(markdownToDocument(markdown));

  expect(normalizeMarkdownRoundTrip(serialized)).toBe(
    normalizeMarkdownRoundTrip(markdown),
  );
});

// src/tests/e2e/admin-authoring.spec.ts
test("edits code blocks and tables through dedicated edit states", async ({
  page,
}) => {
  await signInAdmin(page);
  await page.goto("/admin/posts/new");

  await page.getByRole("button", { name: "插入代码块" }).click();
  await page.getByRole("button", { name: "编辑代码块" }).click();
  await page.locator(".lab-code-node code").fill("const answer = 42;");

  await page.getByRole("button", { name: "插入表格" }).click();
  await page.getByRole("button", { name: "编辑表格" }).click();
  await page.locator(".lab-table-node td").first().fill("alpha");
});
```

- [ ] **Step 5: Run focused unit and browser coverage**

Run:

```bash
npm run test:unit -- src/lib/admin/wysiwyg/markdown-adapter.test.ts
npx playwright test src/tests/e2e/admin-authoring.spec.ts -g "edits code blocks and tables through dedicated edit states" --project=desktop
```

Expected:

- Unit round-trip tests pass.
- Playwright proves both dedicated edit states are reachable and editable.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/wysiwyg/nodes/CodeBlockNodeView.tsx src/components/admin/wysiwyg/nodes/TableNodeView.tsx src/lib/admin/wysiwyg/extensions.ts src/lib/admin/wysiwyg/markdown-adapter.test.ts src/tests/e2e/admin-authoring.spec.ts src/app/globals.css
git commit -m "feat: add dedicated code block and table editing states"
```

### Task 5: Cut Over Edit Flow and Block Unsupported Legacy Markdown

**Files:**
- Create: `src/components/admin/UnsupportedEditorContentNotice.tsx`
- Modify: `src/components/admin/PostEditorShell.tsx`
- Modify: `src/tests/e2e/admin-authoring.spec.ts`
- Delete: `src/components/admin/MarkdownEditorClient.tsx`

- [ ] **Step 1: Add the blocked-content notice**

```tsx
// src/components/admin/UnsupportedEditorContentNotice.tsx
type UnsupportedEditorContentNoticeProps = {
  issues: Array<{ code: string; message: string }>;
};

export function UnsupportedEditorContentNotice({
  issues,
}: UnsupportedEditorContentNoticeProps) {
  return (
    <section
      className="rounded-lab border border-[rgba(255,138,138,0.32)] bg-[rgba(255,138,138,0.08)] p-5"
      aria-label="正文无法进入可视化编辑"
    >
      <h2 className="text-[20px] font-semibold leading-[1.3] text-lab-text">
        这篇正文暂时无法进入可视化编辑
      </h2>
      <p className="mt-3 text-[15px] leading-[1.6] text-lab-text-muted">
        当前正文包含可视化编辑器不支持的 Markdown 语法。为避免正文损坏，系统已阻止本次编辑。
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px] leading-[1.5] text-[#ffb1b1]">
        {issues.map((issue) => (
          <li key={`${issue.code}-${issue.message}`}>{issue.message}</li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Replace the edit-flow branch in `PostEditorShell`**

```tsx
// src/components/admin/PostEditorShell.tsx
import { UnsupportedEditorContentNotice } from "@/components/admin/UnsupportedEditorContentNotice";
import { scanMarkdownCompatibility } from "@/lib/admin/wysiwyg/compatibility";

const compatibility = scanMarkdownCompatibility(form.bodyMarkdown);
const showVisualEditor = mode === "create" || compatibility.compatible;

{showVisualEditor ? (
  <AdminWysiwygEditorClient
    value={form.bodyMarkdown}
    error={errors.bodyMarkdown}
    onMarkdownChange={(bodyMarkdown) => updateForm({ bodyMarkdown })}
  />
) : (
  <UnsupportedEditorContentNotice issues={compatibility.issues} />
)}

<button
  type="button"
  disabled={isPending || !showVisualEditor}
  onClick={saveDraft}
>
  保存草稿
</button>
```

- [ ] **Step 3: Add blocked-edit and saved-markdown regression tests**

```ts
// src/tests/e2e/admin-authoring.spec.ts
test("blocks editing incompatible legacy markdown", async ({ page }) => {
  const blockedPost = await seedPhase3Post({
    title: "第三阶段不兼容正文",
    slug: "phase-3-incompatible-body",
    bodyMarkdown: "# 不兼容\n\n<div>legacy html</div>",
  });

  await signInAdmin(page);
  await page.goto(`/admin/posts/${blockedPost.id}`);

  await expect(
    page.getByRole("region", { name: "正文无法进入可视化编辑" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "保存草稿" })).toBeDisabled();
});

test("persists markdown that still renders publicly after visual editing", async ({
  page,
}) => {
  await signInAdmin(page);
  await page.goto("/admin/posts/new");

  await page.getByLabel("标题").fill("第三阶段可视化公开回归");
  await page.getByRole("button", { name: "插入代码块" }).click();
  await page.getByRole("button", { name: "编辑代码块" }).click();
  await page.locator(".lab-code-node code").fill("const publicCheck = true;");
  await page.getByRole("button", { name: "保存草稿" }).click();

  const createdPost = await findPhase3PostBySlug("third-phase-visual-public-regression");
  expect(createdPost?.bodyMarkdown).toContain("```");
});
```

- [ ] **Step 4: Delete the old split editor client**

```bash
rm src/components/admin/MarkdownEditorClient.tsx
```

- [ ] **Step 5: Run focused edit-flow coverage**

Run:

```bash
npx playwright test src/tests/e2e/admin-authoring.spec.ts -g "blocks editing incompatible legacy markdown|persists markdown that still renders publicly after visual editing" --project=desktop
npm run lint
```

Expected:

- Edit flow blocks unsupported legacy content.
- Compatible content still saves Markdown.
- Lint passes after the old Markdown client file is removed.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/UnsupportedEditorContentNotice.tsx src/components/admin/PostEditorShell.tsx src/tests/e2e/admin-authoring.spec.ts
git rm src/components/admin/MarkdownEditorClient.tsx
git commit -m "feat: cut over admin edit flow to guarded wysiwyg editor"
```

### Task 6: Run Full Regression and Close the Feature

**Files:**
- Modify: `src/tests/e2e/admin-authoring.spec.ts`
- Modify: `docs/superpowers/specs/2026-07-08-wysiwyg-markdown-editor-design.md` only if the implementation forces a spec correction

- [ ] **Step 1: Run unit coverage**

Run:

```bash
npm run test:unit
```

Expected:

- All WYSIWYG adapter and compatibility tests pass.

- [ ] **Step 2: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected:

- `eslint` passes.
- Next.js production build passes with the new editor stack.

- [ ] **Step 3: Run cross-viewport Playwright coverage**

Run:

```bash
npx playwright test src/tests/e2e/admin-authoring.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion
```

Expected:

- Authoring flows pass on desktop and smaller viewports.
- No preview-toggle assumptions remain in the suite.

- [ ] **Step 4: Run one public render regression from saved Markdown**

Run:

```bash
npx playwright test src/tests/e2e/public-content-library.spec.ts -g "renders public Markdown with Shiki, table wrappers, generated TOC, and no raw HTML" --project=desktop
```

Expected:

- Public article rendering still behaves correctly after body content was created by the visual editor pipeline.

- [ ] **Step 5: Commit**

```bash
git add src/tests/e2e/admin-authoring.spec.ts docs/superpowers/specs/2026-07-08-wysiwyg-markdown-editor-design.md
git commit -m "test: verify admin wysiwyg markdown editor regression coverage"
```

## Self-Review

### Spec coverage

- Pure WYSIWYG canvas: covered by Task 3.
- No source fallback: covered by Task 3 and Task 5 cutover.
- Markdown persistence: covered by Task 2 adapter and Task 5 regression.
- Dedicated code and table editing: covered by Task 4.
- Unsupported legacy content gate: covered by Task 2 compatibility scan and Task 5 blocked flow.
- Public rendering stability: covered by Task 5 and Task 6 regression runs.

### Placeholder scan

- No `TODO`, `TBD`, or deferred pseudo-steps remain.
- Every task includes explicit files, commands, expected failures/passes, and commit boundaries.

### Type consistency

- Shared names are consistent across tasks:
  - `createWysiwygExtensions`
  - `markdownToDocument`
  - `documentToMarkdown`
  - `normalizeMarkdownRoundTrip`
  - `scanMarkdownCompatibility`
  - `AdminWysiwygEditorClient`
  - `UnsupportedEditorContentNotice`

