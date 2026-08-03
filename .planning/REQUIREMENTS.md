# Requirements: Personal Tech Lab Blog

**Defined:** 2026-06-30
**Core Value:** Publish technical notes through a visually distinctive developer blog that feels memorable on entry and remains useful for reading, searching, and revisiting technical content.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Visual Experience

- [x] **VIS-01**: Visitor can see a homepage hero that clearly presents the owner as a programmer, including a concise technical profile and primary navigation into content.
- [x] **VIS-02**: Visitor can experience an immersive technical-lab background on the homepage using effects such as particles, grid motion, mouse-following interaction, or parallax.
- [x] **VIS-03**: Visitor can see a consistent flowing-light visual language across key UI elements such as navigation, cards, buttons, section dividers, and article feature areas.
- [x] **VIS-04**: Visitor can use the public site on mobile without visual effects causing layout overlap, unreadable text, or broken interactions.
- [x] **VIS-05**: Visitor with reduced-motion preferences receives a calmer experience where nonessential animation is disabled or simplified.

### Public Reading

- [x] **READ-01**: Visitor can browse a public article list containing published posts with title, excerpt, date, cover or visual treatment, tags, and category.
- [x] **READ-02**: Visitor can open a published article detail page by slug.
- [x] **READ-03**: Visitor can read Markdown article content rendered with stable typography, headings, links, lists, tables, and images.
- [x] **READ-04**: Visitor can read code blocks with syntax highlighting appropriate for technical notes.
- [x] **READ-05**: Visitor can use a generated table of contents to jump to article sections.
- [x] **READ-06**: Visitor can see estimated reading time on article pages.
- [x] **READ-07**: Visitor can see SEO/share metadata for public article pages derived from article title, excerpt, cover, and tags.

### Content Organization

- [x] **ORG-01**: Visitor can browse posts by tag.
- [x] **ORG-02**: Visitor can browse posts by category.
- [x] **ORG-03**: Visitor can browse an archive grouped by publication date.
- [x] **ORG-04**: Visitor can browse series pages containing ordered posts for a technical topic.
- [x] **ORG-05**: Visitor can navigate previous/next posts inside a series when applicable.
- [x] **ORG-06**: Visitor can see related articles on article detail pages based on shared tags, category, or series.

### Search

- [x] **SRCH-01**: Visitor can search published posts from the public site.
- [x] **SRCH-02**: Search results include enough context to choose a post, including title, excerpt, date, and tags or category.
- [x] **SRCH-03**: Draft or unpublished posts never appear in search results.

### Admin Authentication

- [x] **AUTH-01**: Administrator can log in to a protected admin area.
- [x] **AUTH-02**: Unauthenticated visitors cannot access admin pages.
- [x] **AUTH-03**: Unauthenticated visitors cannot create, edit, delete, publish, or unpublish articles by calling backend mutations directly.
- [x] **AUTH-04**: The system supports a single-admin model for v1 without multi-author roles.

### Article Management

- [x] **CMS-01**: Administrator can create a new article with title, slug, excerpt, Markdown body, cover, tags, category, optional series, and publication status.
- [x] **CMS-02**: Administrator can edit an existing article.
- [x] **CMS-03**: Administrator can delete or remove an article from public visibility.
- [x] **CMS-04**: Administrator can save an article as draft.
- [x] **CMS-05**: Administrator can publish an article so it becomes visible on public article, list, tag, category, archive, series, search, and related-post surfaces.
- [x] **CMS-06**: Administrator can unpublish an article so it is removed from all public surfaces.
- [x] **CMS-07**: Administrator receives validation for required fields, invalid slugs, and duplicate slugs before an article is saved or published.

### Markdown Authoring

- [x] **EDIT-01**: Administrator can write article content in a Markdown-backed editor.
- [x] **EDIT-02**: Administrator can see the rendered article shape while editing in the WYSIWYG canvas.
- [x] **EDIT-03**: The editor canvas uses article-like typography and code/table styling close enough to make writing decisions reliable.
- [x] **EDIT-04**: Public Markdown rendering prevents unsafe raw HTML or sanitizes it before display.
- [x] **EDIT-05**: Administrator can format selected text with bold, ordered and unordered lists, body/H1-H4 levels, safe preset colors, and code blocks while preserving Markdown round trips.
- [x] **EDIT-06**: Administrator can insert a local image through an accessible modal, file picker, drag-and-drop, or clipboard paste; uploaded files are validated, metadata-stripped, and stored durably.
- [x] **EDIT-07**: Administrator can import a local `.md` or `.markdown` file into a new draft with safe frontmatter/title parsing and compatibility validation before any form state is replaced.

### Brand Revision

- [x] **VIS-06**: The public and administrator surfaces use the `Hans‘s Blog` brand, the redundant homepage reading-layout preview is absent, and all public mecha artwork uses an original non-infringing visual identity.

### Taxonomy and Series Management

- [x] **TAX-01**: Administrator can assign tags to an article.
- [x] **TAX-02**: Administrator can assign one category to an article.
- [x] **TAX-03**: Administrator can assign an article to a series.
- [x] **TAX-04**: Administrator can control article order inside a series.
- [x] **TAX-05**: Public taxonomy and series pages only include published posts.

### Performance and Quality

- [x] **QUAL-01**: Public pages avoid loading admin-only editor code.
- [x] **QUAL-02**: Public article pages are readable before nonessential visual effects hydrate.
- [x] **QUAL-03**: Heavy visual effects are isolated so article reading remains responsive.
- [x] **QUAL-04**: Publishing, unpublishing, and editing revalidate affected public pages or indexes so visitors see current content.
- [x] **QUAL-05**: Core public flows and admin publishing flows are covered by automated or scripted verification.
- [x] **QUAL-06**: The revised brand, authoring, media, Markdown import, responsive visuals, and public-exposure security boundaries are reverified with current automated and visual evidence.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Community

- **COMM-01**: Visitor can comment on posts.
- **COMM-02**: Visitor can react to posts.

### Multi-Author CMS

- **ROLE-01**: Multiple authors can log in.
- **ROLE-02**: Users can have role-based permissions.
- **ROLE-03**: Articles can track author ownership.

### Rich Technical Demos

- **DEMO-01**: Author can embed MDX or React-powered interactive demos inside posts.

### External Content Sync

- **SYNC-01**: System can import or sync content from external platforms such as Notion, Yuque, GitHub, or similar tools.

### Advanced Search

- **ASEA-01**: System can use a dedicated search engine or advanced server-side search service when content volume or relevance needs exceed v1 search.

## Out of Scope

Explicitly excluded from v1. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Public comments and reactions | Adds moderation, spam prevention, and notification concerns that do not support the v1 writing/reading loop. |
| Multi-author accounts and role permissions | The product is a personal blog; single-admin workflow is sufficient for v1. |
| MDX interactive demos | The selected authoring experience is Markdown-backed WYSIWYG authoring; MDX can be added later once the base blog is stable. |
| External content-source sync | v1 owns content in the app/backend to avoid sync complexity. |
| Dedicated search engine | Fuse.js or simple database-backed search is enough for a personal blog v1; dedicated infrastructure can wait. |
| Native mobile app | Responsive web covers mobile needs for v1. |
| Full editorial CMS workflow | Too heavy for a single-author technical notebook. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 1 | Complete |
| VIS-02 | Phase 1 | Complete |
| VIS-03 | Phase 1 | Complete |
| VIS-04 | Phase 1 | Complete |
| VIS-05 | Phase 1 | Complete |
| READ-01 | Phase 4 | Complete |
| READ-02 | Phase 4 | Complete |
| READ-03 | Phase 4 | Complete |
| READ-04 | Phase 4 | Complete |
| READ-05 | Phase 4 | Complete |
| READ-06 | Phase 4 | Complete |
| READ-07 | Phase 4 | Complete |
| ORG-01 | Phase 4 | Complete |
| ORG-02 | Phase 4 | Complete |
| ORG-03 | Phase 4 | Complete |
| ORG-04 | Phase 4 | Complete |
| ORG-05 | Phase 4 | Complete |
| ORG-06 | Phase 4 | Complete |
| SRCH-01 | Phase 4 | Complete |
| SRCH-02 | Phase 4 | Complete |
| SRCH-03 | Phase 4 | Complete |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| CMS-01 | Phase 3 | Complete |
| CMS-02 | Phase 3 | Complete |
| CMS-03 | Phase 3 | Complete |
| CMS-04 | Phase 3 | Complete |
| CMS-05 | Phase 4 | Complete |
| CMS-06 | Phase 4 | Complete |
| CMS-07 | Phase 3 | Complete |
| EDIT-01 | Phase 3 | Complete |
| EDIT-02 | Phase 3 | Complete |
| EDIT-03 | Phase 3 | Complete |
| EDIT-04 | Phase 3 | Complete |
| EDIT-05 | Phase 6 | Complete |
| EDIT-06 | Phase 6 | Complete |
| EDIT-07 | Phase 6 | Complete |
| TAX-01 | Phase 3 | Complete |
| TAX-02 | Phase 3 | Complete |
| TAX-03 | Phase 3 | Complete |
| TAX-04 | Phase 3 | Complete |
| TAX-05 | Phase 4 | Complete |
| QUAL-01 | Phase 3 | Complete |
| QUAL-02 | Phase 1 | Complete |
| QUAL-03 | Phase 1 | Complete |
| QUAL-04 | Phase 4 | Complete |
| QUAL-05 | Phase 5 | Complete |
| VIS-06 | Phase 6 | Complete |
| QUAL-06 | Phase 6 | Complete |

**Coverage:**

- v1 requirements: 51 total
- Mapped to phases: 51
- Unmapped: 0

---
*Requirements defined: 2026-06-30*
*Last updated: 2026-07-12 for Phase 6 technical completion*
