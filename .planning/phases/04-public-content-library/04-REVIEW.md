---
phase: 04-public-content-library
reviewed: 2026-07-07T07:15:50Z
depth: standard
files_reviewed: 49
files_reviewed_list:
  - prisma/migrations/20260706000000_add_post_featured/migration.sql
  - prisma/schema.prisma
  - src/app/(public)/archive/page.tsx
  - src/app/(public)/categories/[slug]/page.tsx
  - src/app/(public)/notes/[slug]/page.tsx
  - src/app/(public)/notes/page.tsx
  - src/app/(public)/page.tsx
  - src/app/(public)/search/page.tsx
  - src/app/(public)/series/[slug]/page.tsx
  - src/app/(public)/series/page.tsx
  - src/app/(public)/tags/[slug]/page.tsx
  - src/app/globals.css
  - src/components/admin/AdminPostList.tsx
  - src/components/admin/AdminPublishControls.tsx
  - src/components/admin/PostEditorShell.tsx
  - src/components/public/content/ArchiveTimeline.tsx
  - src/components/public/content/ArticleHeader.tsx
  - src/components/public/content/ArticleMarkdown.tsx
  - src/components/public/content/ArticlePage.tsx
  - src/components/public/content/FeaturedNotesModule.tsx
  - src/components/public/content/PostVisualBlock.tsx
  - src/components/public/content/PublicEmptyState.tsx
  - src/components/public/content/PublicNoteCard.tsx
  - src/components/public/content/PublicNoteList.tsx
  - src/components/public/content/RelatedArticlesRail.tsx
  - src/components/public/content/SearchForm.tsx
  - src/components/public/content/SearchResults.tsx
  - src/components/public/content/SeriesDetailList.tsx
  - src/components/public/content/SeriesIndex.tsx
  - src/components/public/content/SeriesNavigation.tsx
  - src/components/public/content/TableOfContents.tsx
  - src/components/public/content/TaxonomyPageHeader.tsx
  - src/generated/prisma/commonInputTypes.ts
  - src/generated/prisma/internal/class.ts
  - src/generated/prisma/internal/prismaNamespace.ts
  - src/generated/prisma/internal/prismaNamespaceBrowser.ts
  - src/generated/prisma/models/Post.ts
  - src/lib/admin/post-input.ts
  - src/lib/admin/post-mutations.ts
  - src/lib/admin/post-queries.ts
  - src/lib/markdown/public-render.tsx
  - src/lib/public/content-queries.ts
  - src/lib/public/revalidate.ts
  - src/lib/seo/article-metadata.ts
  - src/tests/e2e/admin-authoring.spec.ts
  - src/tests/e2e/admin-mutations.spec.ts
  - src/tests/e2e/data-model-foundation.spec.ts
  - src/tests/e2e/public-content-library.spec.ts
  - src/tests/e2e/public-shell.spec.ts
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-07-07T07:15:50Z
**Depth:** standard
**Files Reviewed:** 49
**Status:** issues_found

## Summary

Reviewed the public content library, admin publication controls, Prisma schema/generated client updates, Markdown rendering, public query/revalidation helpers, and listed E2E coverage. The public read boundary consistently filters to published posts, and the Markdown renderer sanitizes/strips raw HTML before rendering. The main defects found are in client-side admin mutation handling: failed network requests are not caught, and draft saves are not guarded against duplicate submits.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Publish controls can stay disabled after a failed request

**Classification:** WARNING
**File:** `src/components/admin/AdminPublishControls.tsx:70`
**Issue:** `runMutation` sets `pendingOperation` before `fetch`, but the request and JSON parsing are not wrapped in `try`/`finally`. If the network request rejects, the dev server restarts, or the browser aborts the request, execution skips `setPendingOperation(null)`, no user-facing error is set, and both publish/featured buttons remain disabled for the lifetime of that component.
**Fix:**
```tsx
async function runMutation(operation: PublishOperation) {
  setError(null);
  setPendingOperation(operation);

  try {
    const response = await fetch(`/api/admin/posts/${operation}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: postId }),
    });
    const payload = (await response.json().catch(() => null)) as
      | AdminMutationPayload
      | null;

    if (!response.ok || !payload?.post) {
      setError(payload?.message ?? "发布状态更新失败，请重试。");
      return;
    }

    setPublicationState({
      featured: payload.post.featured,
      status: payload.post.status,
    });
    onMutated?.(payload.post);
    router.refresh();
  } catch {
    setError("发布状态更新失败，请重试。");
  } finally {
    setPendingOperation(null);
  }
}
```

### WR-02: Draft saves can race and surface stale errors

**Classification:** WARNING
**File:** `src/components/admin/PostEditorShell.tsx:253`
**Issue:** `saveDraft` starts the `/api/admin/posts/create|edit` request without a saving state or exception handling. The save button is disabled only by `isPending` at line 398, but that flag is tied to the post-success `router.refresh()` transition at lines 339-341, not to the in-flight fetch. A user can double-click "保存草稿" while creating a new post, sending duplicate create requests with the same slug; the second response can overwrite the successful save with a duplicate-slug error. A rejected fetch also produces no form error.
**Fix:** Add a dedicated saving guard and clear it in `finally`; catch request failures into `errors.form`.
```tsx
const [isSaving, setIsSaving] = useState(false);

async function saveDraft() {
  if (isSaving) {
    return;
  }

  // existing validation...
  setIsSaving(true);
  try {
    const response = await fetch(`/api/admin/posts/${operation}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(/* existing payload */),
    });
    // existing response handling...
  } catch {
    setErrors({ form: "草稿保存失败。" });
  } finally {
    setIsSaving(false);
  }
}

<button disabled={isSaving || isPending} onClick={saveDraft}>
  保存草稿
</button>
```

---

_Reviewed: 2026-07-07T07:15:50Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
