---
phase: 03
slug: markdown-authoring-workflow
status: approved
shadcn_initialized: false
preset: none
created: 2026-07-06
---

# Phase 03 - UI Design Contract

> Visual and interaction contract for the protected Markdown authoring workflow. Generated inline for `$gsd-ui-phase 3` because automatic UI subagent spawning is unavailable in this Codex session.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | `lucide-react` |
| Font | Inter/system sans for UI, JetBrains Mono/SFMono/Consolas for code and technical labels |
| Visual mode | Dark technical-lab admin surface, quieter and denser than the public homepage |

### Existing Tokens

Use existing Tailwind theme tokens and CSS variables from `src/app/globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `lab-base` | `#070a0f` | Page background, editor outer shell |
| `lab-surface` | `#111822` | Panels, dashboard sections, editor surfaces |
| `lab-surface-strong` | `#182232` | Active controls, selected rows, elevated toolbar areas |
| `lab-text` | `#e8f0f8` | Primary text |
| `lab-text-muted` | `#a8b3c2` | Secondary text, metadata, helper copy |
| `lab-muted` | `#728096` | Disabled labels and low-priority chrome |
| `lab-accent` | `#2ef2b5` | Primary action, active tabs, focus, live/draft signals |
| `--lab-border-hairline` | `rgba(168, 179, 194, 0.18)` | Default borders |
| `--lab-border-active` | `rgba(46, 242, 181, 0.32)` | Focus, selected, hover borders |
| `--lab-glow-soft` | `rgba(46, 242, 181, 0.14)` | Sparse glow only, never large decorative blobs |
| `rounded-lab` | `8px` | All admin cards, inputs, buttons, dialogs |

---

## Spacing Scale

Declared values must remain multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon-label gaps, inline badge gaps |
| sm | 8px | Compact control gaps, table row internals |
| md | 16px | Default component padding and stacked field gaps |
| lg | 24px | Panel padding, editor toolbar-to-body spacing |
| xl | 32px | Dashboard grid gaps, form column gaps |
| 2xl | 48px | Page section breaks |
| 3xl | 64px | Large desktop vertical page padding only |

Exceptions: none.

### Layout Widths

| Surface | Width Contract |
|---------|----------------|
| Admin shell | Keep current `max-w-[1120px]` for dashboard and list views. |
| Editor route | May expand to `max-w-[1440px]` to support a comfortable WYSIWYG writing canvas, but must keep `px-4 sm:px-6`. |
| Form metadata rail | Desktop `320px-384px`; collapses below editor on tablets/mobile. |
| WYSIWYG canvas | Main writing surface uses `minmax(0, 1fr)` with stable min/max constraints. Code blocks, tables, and images must not resize the page horizontally. |

---

## Typography

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Body | 16px | 400 | 1.5 | Forms, dashboard body, editor helper text |
| Label | 14px | 400 | 1.4 | Input labels, table metadata, badges |
| Small mono | 13-14px | 400 | 1.4 | Slugs, status tokens, route hints, code language labels |
| Heading | 20px | 600 | 1.2 | Panel headings, section titles |
| Page title | 28px | 600 | 1.2 | Dashboard/editor route title; reduce to 20px below 360px |
| Editor prose | 16px | 400 | 1.65 | WYSIWYG article canvas |
| Code block | 14px | 400 | 1.5 | WYSIWYG/public code blocks with horizontal scrolling inside the block only |

Rules:
- Letter spacing is `0`.
- Do not scale text with viewport width.
- Compact panels, badges, tables, and sidebars must not use hero-scale type.
- Chinese UI copy must keep enough line height and avoid clipping on mobile.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#070a0f` | Admin page background and editor route base |
| Secondary (30%) | `#111822`, `#182232` | Panels, cards, table rows, editor panes |
| Accent (10%) | `#2ef2b5` | Primary CTA, active tab, focus outline, draft/live signal, selected taxonomy chips |
| Destructive | `#ff6b6b` or Tailwind-compatible equivalent | Delete action, destructive dialog heading/button only |
| Warning | `#f5c542` | Validation caution and unsaved-error accents only |

Accent reserved for:
- `New article` / `Save draft` primary buttons
- Active editor toolbar control
- Focus ring and selected taxonomy chips
- Dashboard draft/live status accents
- Inline links inside admin helper copy

Do not use accent for every border, icon, hover, or label. The admin experience must read as a calm workbench, not a neon display.

---

## Primary Screens

### `/admin` Dashboard

Purpose: fast return to writing.

Required regions:
- Header inherited from `AdminShell`.
- Page title: `Writing Console`.
- Primary CTA: `New article`.
- Recent edits panel: 5 most recently updated posts, sorted by `updatedAt` descending.
- Draft queue panel: drafts needing attention, including title, excerpt/empty state, updated time, and quick edit action.
- Compact metrics row: `Drafts`, `Recently edited`, `Categories`, `Tags`, `Series`. Metrics are secondary and must not dominate.
- Empty state when no posts exist: clear Chinese-first copy plus `New article` action.

Dashboard behavior:
- Rows/cards are stable height where practical and must not shift when status badges or timestamps load.
- Each article item exposes `Edit` as the main action and `Delete` as a quieter destructive action.
- Avoid marketing hero composition. This is a work surface.

### Article List

Purpose: manage all draft articles in Phase 3.

Required controls:
- Search/filter input may be included if implementation cost is low, but Phase 3 must not become public search.
- Status filter must at least support `All drafts` and `Archived/other` if the implementation displays non-draft records.
- Sort default: `updatedAt` descending.
- List row fields: title, slug, status, updated time, category, tags count or visible chips, optional series, edit action, delete action.

Table/list rules:
- Desktop may use a dense table or table-like rows.
- Mobile must use stacked rows/cards with stable action placement.
- Tags may wrap, but row actions must remain reachable and not overlap.

### Article Editor

Purpose: create/edit a draft technical note.

Required regions:
- Route title and status strip.
- Primary action: `Save draft`.
- Secondary action: `Back to dashboard` or `All articles`.
- Title field.
- Slug field with "generated from title, editable" behavior.
- Excerpt textarea.
- Cover image URL field.
- Markdown-backed WYSIWYG editor.
- Metadata rail or collapsible section for category, tags, series, and `seriesOrder`.

Desktop layout:
- Use a two-zone workbench:
  - Main authoring area: title/slug/excerpt plus one rendered WYSIWYG article canvas.
  - Metadata rail: cover URL, category, tags, series, series order, validation summary.
- The editor canvas must be the primary writing surface at desktop widths.
- The canvas uses article-like typography and code styling, not a generic raw textarea.

Mobile layout:
- Editor route becomes single column.
- WYSIWYG canvas remains a single writing surface; there are no `Edit`/`Preview` tabs.
- Metadata appears below the main writing fields in collapsible or stacked groups.
- Save action remains visible near the top and bottom, or a sticky footer may be used if it does not cover fields.

---

## Component Inventory

| Component | Contract |
|-----------|----------|
| `AdminDashboard` | Server-rendered data shell with recent edits, draft queue, metrics, and new article CTA. |
| `AdminPostList` | Dense desktop list/table plus mobile stacked cards. Defaults to recently updated first. |
| `AdminPostListItem` | Shows title, slug, status, updated time, category/tags/series metadata, edit, delete. |
| `PostEditorShell` | Route-level layout for create/edit. Owns high-level editor spacing and responsive zones. |
| `PostMetadataFields` | Title, slug, excerpt, cover URL, status display. Save-draft requirements are title + body. |
| `AdminWysiwygEditorClient` | Client-only Tiptap editor UI. Must not be imported by public routes. |
| `WysiwygToolbar` | Compact editor toolbar for headings, quote/list, code block, table, image URL insertion, and compatible inline formatting. |
| `TaxonomyPicker` | Reusable picker for category, tags, and series with inline creation affordance. |
| `SeriesOrderInput` | Numeric input shown only when a series is selected. |
| `ValidationSummary` | Field-level and form-level validation messages with direct links/focus targets where possible. |
| `DeletePostDialog` | Confirmation dialog showing article title before hard delete. |

Use lucide icons for actions:
- `FilePlus` or `SquarePen` for new/edit
- `Save` for save draft
- `Trash2` for delete
- `Tag`, `Folder`, `ListOrdered` for taxonomy/series
- `Image`, `Table`, `Code`, and text-format icons for editor tools
- `AlertTriangle` for validation/destructive warnings

---

## Interaction Contracts

### Save Draft

- Primary copy: `Save draft`.
- Saving a draft requires title and Markdown body.
- Successful save should keep the user in the editor and show a restrained success status such as `Draft saved`.
- Validation failures must show a summary plus field-level messages.
- No publish button appears in Phase 3.

### Slug

- Slug auto-generates from the title until the user manually edits the slug field.
- After manual edit, title changes must not overwrite the slug without explicit user action.
- Invalid slug copy: `Use lowercase letters, numbers, and hyphens only.`
- Duplicate slug copy: `This slug is already used by another note.`

### Delete

- Delete action opens `DeletePostDialog`.
- Dialog must show the exact article title.
- Confirmation copy:
  - Title: `Delete article?`
  - Body: `This permanently deletes "{title}". This cannot be undone.`
  - Confirm button: `Delete article`
  - Cancel button: `Cancel`
- Destructive color is used only for delete text/button/dialog emphasis.

### Taxonomy Creation

- Category: single selection with inline create.
- Tags: multiple selection with inline create.
- Series: optional single selection with inline create.
- Series order input appears only after a series is selected.
- Inline creation should normalize names and generate slugs consistently with article slug rules.
- Duplicate taxonomy names/slugs must surface a clear inline error.

### WYSIWYG Markdown Canvas

- Desktop and mobile use the same rendered writing canvas.
- Raw HTML is disabled. Unsupported Markdown should show a compatibility notice instead of opening a lossy editor.
- Code blocks must scroll horizontally inside the code surface and never expand the page width.
- Tables must remain readable with internal overflow handling on mobile.
- Image URL insertion is available from the toolbar and persists as Markdown image syntax.

---

## Responsive Contract

| Breakpoint | Layout |
|------------|--------|
| `< 640px` | Single-column admin surfaces. Dashboard panels stack. Editor keeps one WYSIWYG canvas. Metadata stacks below writing fields. |
| `640px-1023px` | Dashboard may use 2-column metric cards. Editor remains mostly single column with the WYSIWYG canvas above metadata. |
| `>= 1024px` | Dashboard uses dashboard grid. Editor uses WYSIWYG canvas plus optional metadata rail. |
| `>= 1280px` | Editor route may expand to `max-w-[1440px]`; dashboard/list stay around existing admin width unless planner has a strong reason. |

Hard requirements:
- No horizontal page overflow at 320px and 390px widths.
- Buttons must be at least 44px tall on touch targets.
- Long slugs, URLs, code, tags, and category names must truncate, wrap, or scroll inside their own containers.
- Text inside buttons and chips must not overflow; long words need `min-w-0`, truncation, or wrapping.

---

## Motion and Effects

Admin Phase 3 should be quieter than the public homepage.

Allowed:
- 150ms color/border transitions.
- Subtle hover border on rows/cards.
- Sparse existing `lab-flow-border` or `lab-glow-card` treatment on major panels only.
- Reduced-motion friendly tab changes without layout jumps.

Avoid:
- Particle/canvas backgrounds in admin editor.
- Animated backgrounds behind editor text.
- Large gradient orbs, bokeh blobs, or heavy blur decoration.
- Motion that carries meaning or hides content until hydration.

Reduced motion:
- All nonessential transitions must be disabled or simplified by the existing `prefers-reduced-motion` rule.
- Editor toolbar controls must remain usable without animation.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Dashboard title | `Writing Console` |
| Dashboard support | `最近编辑的草稿和技术笔记都在这里。` |
| Primary CTA | `New article` |
| Empty state heading | `还没有草稿` |
| Empty state body | `创建第一篇技术笔记，先保存为草稿。` |
| Article list empty | `没有匹配的文章。调整筛选或新建一篇草稿。` |
| Save success | `Draft saved` |
| Save error | `保存失败。请检查高亮字段后重试。` |
| Required title error | `Title is required.` |
| Required body error | `Markdown body is required.` |
| Slug format error | `Use lowercase letters, numbers, and hyphens only.` |
| Duplicate slug error | `This slug is already used by another note.` |
| Delete confirmation | `This permanently deletes "{title}". This cannot be undone.` |

Tone:
- Admin navigation and controls may use concise English.
- Empty states and explanatory body copy may be Chinese-first for readability.
- Avoid visible in-app instructions about implementation details, keyboard shortcuts, or how visual effects work.

---

## Accessibility Contract

- Every input has a visible label.
- Field errors are programmatically associated with fields.
- Dialog focus is trapped while open and returns to the delete trigger on close.
- Editor toolbar controls have stable accessible names and do not collide with field labels.
- Focus outlines use `#2ef2b5` and remain visible on dark surfaces.
- Icon-only buttons require accessible names and tooltips when meaning is not obvious.
- Delete actions must not rely on color alone.
- Dashboard/list rows must be keyboard navigable through real links/buttons.

---

## Bundle and Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registry | none | not allowed for Phase 3 without explicit review |

Bundle rules:
- Admin Markdown editor package code must be imported only from protected admin editor client components.
- Public routes under `(public)` must not import Tiptap editor packages, legacy `@uiw/react-md-editor`, or editor CSS.
- Shared Markdown renderer/style utilities are allowed only if they do not import editor UI packages.
- Add a static test or bundle/source scan proving public pages do not load admin-only editor code.

---

## Verification Checklist for Implementation

- Dashboard renders recent edits, draft queue, metrics, empty state, and `New article`.
- Article list defaults to `updatedAt` descending.
- Create draft requires title and Markdown body.
- Slug auto-generates from title and remains manually editable.
- Editor desktop layout uses one rendered WYSIWYG canvas with comfortable width.
- Editor mobile layout uses one rendered WYSIWYG canvas without a split preview.
- WYSIWYG canvas handles headings, links, lists, tables, inline code, images, and code blocks without page overflow.
- Raw HTML fixture does not execute/render as unsafe markup.
- Category, tags, optional series, and `seriesOrder` can be assigned in the article form.
- Inline taxonomy creation works and handles duplicates clearly.
- Delete confirmation shows the exact article title before hard delete.
- Public route source/bundle checks prove editor dependencies are admin-only.
- 320px, 390px, desktop, and reduced-motion Playwright checks pass without overlap or horizontal overflow.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS - specific CTAs, empty states, validation, and destructive copy are defined.
- [x] Dimension 2 Visuals: PASS - admin workbench layout, components, states, and responsive behavior are specified without marketing-style composition.
- [x] Dimension 3 Color: PASS - uses existing dark lab tokens with reserved accent and destructive roles.
- [x] Dimension 4 Typography: PASS - role-based sizes, weights, line heights, code/prose behavior, and mobile constraints are defined.
- [x] Dimension 5 Spacing: PASS - 4px-multiple scale, layout widths, pane constraints, and touch targets are defined.
- [x] Dimension 6 Registry Safety: PASS - no third-party UI registry blocks; editor bundle isolation is a hard requirement.

**Approval:** approved 2026-07-06
