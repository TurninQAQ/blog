# WYSIWYG Markdown Editor Design

## Goal

Replace the current admin authoring experience for post body editing with a pure WYSIWYG article canvas that feels close to Typora:

- no left-source / right-preview split
- no persistent Markdown source mode
- direct editing on rendered-looking article blocks
- persisted storage remains Markdown

This editor is for the protected single-admin workflow only.

## Decision

Use a structured rich-text document model for editing and convert at the boundaries:

- load: `Markdown -> editor document`
- edit: `editor document`
- save: `editor document -> Markdown`

Recommended editor foundation: `Tiptap` with Markdown support and custom node UI for code blocks and tables.

Reason:

- it best matches the required WYSIWYG interaction model
- it already has official Markdown import/export support
- it has first-party table and code-block node support
- it lets us own the UI and keep the existing visual language

## Rejected Approaches

### 1. Keep the current Markdown-first editor and only restyle it

Rejected because it does not satisfy the core requirement. A prettier single-column textarea is still a Markdown editor, not a Typora-like writing surface.

### 2. Custom `contenteditable` over the current preview renderer

Rejected because cursor behavior, undo/redo, block operations, selection handling, and Markdown serialization would all become custom problems. This is fragile and expensive to maintain.

### 3. Lexical with a custom Markdown bridge

Rejected for v1 because it shifts too much risk into a custom import/export layer. The interaction model is feasible, but the Markdown round-trip burden is larger than needed for this project.

## Product Constraints

These are locked by the current discussion and must shape implementation:

- editing is pure WYSIWYG by default
- there is no user-facing Markdown source fallback
- stored article body remains Markdown
- code blocks and tables enter a dedicated edit state when focused
- `raw HTML` is not supported in the new editor
- unsupported or obscure Markdown syntax is out of scope for v1

## Supported Content Model

v1 supports only content that can be safely edited and round-tripped without a source mode:

- headings
- paragraphs
- bold
- italic
- inline code
- blockquotes
- ordered lists
- unordered lists
- links
- images
- fenced code blocks
- tables

This list is not advisory. It defines the allowed editable grammar for the WYSIWYG editor.

## Explicitly Unsupported Content

The following are out of scope for v1:

- raw HTML
- arbitrary custom Markdown extensions
- nested or exotic table syntax
- task lists
- footnotes
- definition lists
- embedded React/MDX behavior
- direct editing of unknown Markdown constructs

If an existing post body contains unsupported constructs, the editor must not silently normalize or discard them.

## UX Model

### Main Layout

The post body editor becomes a single article canvas. The canvas occupies the primary visual focus of the page.

The right side remains available for lightweight post metadata only:

- slug
- excerpt
- cover image
- category
- tags
- series
- series order
- featured / publication state

The metadata rail must not compete with the writing canvas. On smaller screens it must collapse into a secondary drawer or stacked section below the main editor.

### Writing Surface

The body area must look like the final article:

- rendered heading sizes
- article paragraph rhythm
- real list spacing
- code blocks shown as code blocks
- tables shown as tables

The user edits directly inside these blocks. The interface must not expose a live side preview because the article canvas is the preview.

### Code Block Editing

Code blocks use a two-state interaction:

- resting state: rendered code block in the article flow
- edit state: focused code editor surface for that block

The edit state may expose:

- language label or selector
- monospace editing surface
- exit back to article view on blur or explicit confirm

The author must never need to type raw triple backticks in normal use.

### Table Editing

Tables also use a two-state interaction:

- resting state: rendered table in the article flow
- edit state: cell-level editing surface with visible grid behavior

The author must not need to type pipe-delimited Markdown directly.

### Empty / Insert States

The editor needs clear insertion affordances for:

- add heading
- add paragraph
- add quote
- add list
- add code block
- add table
- add image

These can be contextual block insert controls or a compact insertion menu. They must be minimal and not visually louder than the article content.

## Data Flow

### Load Path

When opening an existing post:

1. fetch stored Markdown from the database
2. parse Markdown into the editor document model
3. validate that all parsed nodes are inside the supported content model
4. if validation passes, mount the WYSIWYG editor
5. if validation fails, block editing with a compatibility notice

### Save Path

When saving:

1. validate the editor document model
2. serialize to Markdown
3. run post-serialization normalization if needed
4. persist Markdown as the canonical body format

The saved Markdown must remain compatible with the existing public rendering pipeline, including sanitization and Shiki-based public rendering later in the stack.

## Compatibility Gate For Existing Content

This is mandatory.

The editor cannot assume all legacy Markdown is editable.

Before allowing an existing post into the new WYSIWYG editor, the system must detect whether the post body uses only supported constructs. If not, the UI must block entry and explain that the content contains unsupported syntax for the visual editor.

Acceptable blocked examples:

- raw HTML blocks
- unsupported Markdown extensions
- ambiguous table-like content that does not map cleanly into the editor schema

Unacceptable behavior:

- silently stripping unsupported syntax
- rewriting the post into a lossy format
- partially loading a post and saving back corrupted Markdown

## Serialization Rule

Markdown remains the only persisted body format in v1.

The editor document is runtime-only. We do not add a second canonical rich-text JSON column as part of this change.

This keeps the public pipeline and existing data model stable, but it makes serializer correctness a release gate. The implementation must treat Markdown round-trip reliability as a core requirement, not a polish item.

## Security Rule

Because source editing is removed, safety has to be stronger at the schema boundary:

- no raw HTML editing path
- no arbitrary HTML passthrough
- no custom node that serializes unknown HTML fragments

The WYSIWYG editor must only emit constructs representable in the approved Markdown subset.

## Technical Architecture

### Editor Package

Introduce a dedicated admin-only WYSIWYG editor component tree. It must not leak into public bundles.

Expected structure:

- `AdminWysiwygEditorClient`
- editor extensions / node configuration
- Markdown import/export adapter
- node UI for code block editing
- node UI for table editing
- compatibility scanner for legacy Markdown

### Integration Boundary

`PostEditorShell` remains the host for title, slug, taxonomy, status, and save flow, but the body editing implementation changes from:

- current: UIW Markdown input + separate project preview

to:

- new: WYSIWYG article canvas + structured body state

The body value passed into save mutations remains a Markdown string after serialization.

### Public Rendering

No public rendering change is required for this feature. Public readers still consume stored Markdown via the existing render path.

## Migration Strategy

This must be implemented as a guarded replacement, not a silent swap.

Suggested rollout shape:

1. add the new editor behind a feature boundary in admin only
2. support create flow first
3. add compatibility scanning for edit flow
4. enable edit flow only for compatible documents
5. keep old content blocked until compatibility is confirmed

This avoids immediate risk to legacy notes.

## Testing Requirements

### Unit / Integration

Must add deterministic round-trip coverage for supported syntax:

- Markdown import to editor document
- editor document export back to Markdown
- stable behavior for headings, lists, quotes, links, images, code blocks, and tables

Tests must fail on lossy or structurally incorrect serialization.

### E2E

Must cover:

- create a new note visually and save successfully
- reopen and continue editing a compatible note
- edit code block through dedicated code-block edit state
- edit table through dedicated table edit state
- save and confirm the public Markdown body still renders correctly
- blocked edit flow for unsupported legacy content

### Regression

Must verify:

- public bundles do not import the WYSIWYG editor stack
- existing admin auth and mutation boundaries still hold
- reduced-motion and mobile layouts remain usable

## Risks

### Markdown Extension Maturity

Tiptap's Markdown support is officially documented as early release / beta. That is acceptable only if we narrow the grammar and enforce round-trip tests aggressively.

### Legacy Content Compatibility

Existing posts may contain syntax the new editor cannot safely represent. This is expected and must be handled explicitly through blocking and migration guidance.

### Table Fidelity

Tables are the highest-risk common block after code blocks. They need focused serializer tests and must stay inside a constrained feature set in v1.

## Success Criteria

The feature is successful when all of the following are true:

- admin authors write in a single article-like WYSIWYG canvas
- no default source editor is exposed
- saved body format remains Markdown
- code blocks and tables are editable through dedicated block states
- unsupported existing Markdown is blocked rather than corrupted
- public article rendering remains correct without data-model expansion

## Sources

- Tiptap Markdown docs: https://tiptap.dev/docs/editor/markdown
- Tiptap Markdown install/setup: https://tiptap.dev/docs/editor/markdown/getting-started/installation
- Tiptap Table extension: https://tiptap.dev/docs/editor/extensions/nodes/table
- Tiptap CodeBlock extension: https://tiptap.dev/docs/editor/extensions/nodes/code-block
- Lexical Markdown package: https://lexical.dev/docs/packages/lexical-markdown
- Lexical Table package: https://lexical.dev/docs/packages/lexical-table
