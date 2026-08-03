# Pitfalls Research

**Domain:** personal technical blog with single-admin CMS and immersive frontend
**Researched:** 2026-06-30
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Visual Effects Overpower Reading

**What goes wrong:**
The site looks impressive on the homepage but articles become hard to read because glow, motion, parallax, or animated backgrounds compete with prose and code.

**Why it happens:**
The project priority includes visual impact, so it is tempting to apply the same intensity everywhere.

**How to avoid:**
Define separate visual intensity levels: homepage high, listing pages medium, article body low. Article pages should use stable backgrounds, strong contrast, and restrained accent motion.

**Warning signs:**
Article text sits on moving backgrounds, code blocks have low contrast, mobile scrolling feels janky, or reduced-motion mode still has major movement.

**Phase to address:**
Phase 1 visual foundation and public shell.

---

### Pitfall 2: Admin UI Hidden but Mutations Unprotected

**What goes wrong:**
Admin pages appear protected, but publish/update/delete actions can still be called without a valid admin session.

**Why it happens:**
Developers protect layouts or buttons but forget that server actions/API routes are separate trust boundaries.

**How to avoid:**
Require `requireAdmin()` inside every mutation handler. Add tests for unauthorized mutations.

**Warning signs:**
Mutation functions do not import auth helpers, tests only cover visible UI, or API routes trust client-provided role/user data.

**Phase to address:**
Phase 2 backend/auth foundation.

---

### Pitfall 3: Markdown XSS and Unsafe HTML

**What goes wrong:**
Markdown content allows raw HTML or plugin output that can inject scripts/styles into public pages.

**Why it happens:**
Markdown feels safe because only the site owner writes content, but admin accounts and previews still form a content injection boundary.

**How to avoid:**
Disallow raw HTML in v1, or sanitize with a strict schema. Keep preview and public rendering pipelines audited.

**Warning signs:**
`rehype-raw` is added casually, sanitizer config is missing, or article body is rendered with `dangerouslySetInnerHTML` without a controlled transform.

**Phase to address:**
Phase 3 content rendering and editor.

---

### Pitfall 4: Slug, Status, and Cache Invalidation Bugs

**What goes wrong:**
Drafts appear publicly, old content remains cached after publishing, duplicate slugs break routes, or renamed posts leave broken links.

**Why it happens:**
Publishing workflows span database constraints, route generation, status filters, and cache revalidation.

**How to avoid:**
Use unique slug constraints, central published-post query helpers, explicit draft/published status checks, and revalidate all affected paths after mutations.

**Warning signs:**
Public queries repeat ad hoc `where` clauses, publish action does not revalidate, or slug changes are not tested.

**Phase to address:**
Phase 3 article management and public rendering.

---

### Pitfall 5: Search and Related Posts Leak Draft Content

**What goes wrong:**
Draft or unpublished content appears in search results, related articles, archive pages, or sitemap output.

**Why it happens:**
Search indexes and related content are often generated separately from article list queries.

**How to avoid:**
Create a single public-content query boundary and reuse it for lists, search index generation, archive, tags, series, related articles, and sitemap.

**Warning signs:**
Search index code queries all posts directly, related-post logic ignores status, or tests do not include draft fixtures.

**Phase to address:**
Phase 4 content library features.

---

### Pitfall 6: WebGL or Heavy Animation Hurts Mobile Performance

**What goes wrong:**
The first viewport looks cool on a desktop monitor but drains battery, drops frames, or fails on mobile and low-end GPUs.

**Why it happens:**
Particle fields, shaders, parallax, and blur effects are added without measuring cost.

**How to avoid:**
Lazy-load WebGL, cap device pixel ratio, pause offscreen animation, respect `prefers-reduced-motion`, and provide CSS fallback.

**Warning signs:**
Main bundle includes Three.js on article pages, Lighthouse/Playwright traces show long tasks, or mobile screenshots show blank canvas/overlap.

**Phase to address:**
Phase 1 visual foundation and every UI verification pass.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store all post metadata in a JSON blob | Faster schema setup | Harder filters, search, relations, and admin forms | Only for experimental fields, not core title/status/tags/series. |
| Render Markdown on the client | Simple implementation | Worse SEO, slower article load, hard TOC/metadata | Never for main public article body. |
| Skip migrations and edit DB manually | Faster local iteration | Production drift and broken deploys | Never after first schema commit. |
| Use one global animation component on every page | Fast visual consistency | Performance and readability problems | Only if it is cheap CSS and disabled on articles/mobile as needed. |
| Use one admin form for every taxonomy edge case | Faster CRUD | Complex state, fragile validation | Acceptable for v1 if validation is strong and fields are scoped. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Auth.js + Prisma | Assuming UI route protection protects API mutations | Check session/admin authorization in every mutation. |
| Prisma + serverless Postgres | Opening too many connections or using unsupported runtime assumptions | Follow provider-specific adapter/runtime guidance and test production deploy early. |
| Markdown renderer | Mixing raw HTML, syntax highlighting, and heading plugins without sanitizer strategy | Design the unified pipeline first and test malicious/edge markdown fixtures. |
| Next.js cache | Publishing content without revalidating list/detail/tag/search paths | Centralize revalidation in post mutation services. |
| Three.js/R3F | Bundling WebGL into all public pages | Dynamic import only on pages that need it; provide fallback. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Large client bundle from editor dependencies | Public pages load editor code | Keep editor only under admin client components | Immediately visible in bundle analysis. |
| Client-side Shiki highlighting | Slow hydration and long tasks | Highlight on server or precompute on publish | Long code-heavy posts. |
| Search index too large | Search modal slow to open/type | Limit indexed fields and move to server search later | Hundreds/thousands of posts. |
| Unbounded particle/WebGL effects | Mobile frame drops, battery drain | Cap particles, DPR, and animation scope | Low-end devices and mobile. |
| Excessive blur/filter effects | Paint cost spikes | Use fewer layered filters and test on mobile | Complex homepage scenes. |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting client role/user data | Unauthorized content mutation | Server-side session lookup and admin allowlist. |
| Unsafe Markdown HTML | XSS or style/script injection | No raw HTML by default; sanitize if allowed. |
| Missing CSRF/session assumptions | Admin actions callable unexpectedly | Use framework/auth patterns and test auth boundaries. |
| Leaking drafts through APIs | Private notes become public | Central public-query helper and draft fixtures in tests. |
| Unvalidated slugs | Route collisions, broken links, or path tricks | zod validation, normalization, uniqueness constraints. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Homepage is cool but content is buried | Visitors cannot find articles | Put personal profile first, then clear article/search/tag entry points. |
| Admin editor preview differs greatly from public article | Writer cannot trust preview | Share prose/code styles and document known preview differences. |
| Tags/categories/series are too many choices | Content organization becomes noisy | Use categories sparingly, tags freely, series only for ordered learning paths. |
| Search results lack context | Readers cannot choose the right post | Show title, excerpt, tags, date, and highlighted match if feasible. |
| Mobile effects overlap text | Page feels broken | Verify mobile screenshots and disable heavy layers when necessary. |

## "Looks Done But Isn't" Checklist

- [ ] **Homepage visual system:** Verify reduced-motion, mobile layout, and no text overlap.
- [ ] **Article renderer:** Verify code highlighting, heading anchors, TOC, tables, long code lines, and malicious markdown fixtures.
- [ ] **Admin auth:** Verify unauthenticated users cannot load admin pages or call mutations.
- [ ] **Publishing workflow:** Verify draft, publish, unpublish, slug rename, cache revalidation, and public visibility.
- [ ] **Search:** Verify only published posts appear.
- [ ] **Series/archive/tags:** Verify ordering, empty states, and unpublished filtering.
- [ ] **Responsive reading:** Verify article body, TOC, code blocks, and metadata on mobile.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Effects hurt readability | MEDIUM | Introduce visual intensity tokens, disable motion on article body, add reduced-motion behavior. |
| Auth boundary missing | HIGH | Stop publishing, audit all mutation routes, add `requireAdmin`, add unauthorized tests. |
| Unsafe Markdown rendering | HIGH | Disable raw HTML, sanitize content, audit stored posts, add malicious fixture tests. |
| Draft leakage | HIGH | Centralize public queries, rebuild search/sitemap, add draft fixtures and regression tests. |
| Search too slow | MEDIUM | Trim index, lazy-load search, switch to server search if content volume requires it. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Visual effects overpower reading | Phase 1 | Desktop/mobile screenshots, reduced-motion check, article contrast check. |
| Admin UI hidden but mutations unprotected | Phase 2 | Unauthorized mutation tests. |
| Markdown XSS and unsafe HTML | Phase 3 | Malicious markdown fixture tests and sanitizer review. |
| Slug/status/cache bugs | Phase 3 | Publish/unpublish/rename flow tests. |
| Search leaks drafts | Phase 4 | Draft fixture excluded from search/archive/tags/series. |
| WebGL hurts mobile performance | Phase 1 and Phase 5 | Browser screenshot and performance checks on desktop/mobile. |

## Sources

- https://nextjs.org/docs/app/guides/authentication - Authentication and authorization guidance.
- https://nextjs.org/docs/app/guides/content-security-policy - CSP and nonce guidance.
- https://nextjs.org/docs/app/api-reference/functions/revalidatePath - Cache revalidation behavior.
- https://github.com/remarkjs/react-markdown - Markdown rendering constraints.
- https://github.com/rehypejs/rehype-sanitize - HTML sanitization.
- https://shiki.style/ - Code highlighting implementation considerations.
- https://threejs.org/docs/ and https://r3f.docs.pmnd.rs/ - WebGL architecture and runtime considerations.
- https://owasp.org/www-community/attacks/xss/ - XSS risk background.

---
*Pitfalls research for: personal technical blog with single-admin CMS*
*Researched: 2026-06-30*
