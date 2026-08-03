# Phase 1: Visual Foundation and Public Shell - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>

## Phase Boundary

Phase 1 delivers the public-facing application shell and homepage for the personal technical lab blog. It includes the homepage identity, shared public layout, placeholder public routes, navigation, route/index placeholders, and the ambient technical-lab visual foundation.

This phase does not deliver real article data, article rendering, search results, archive data, admin authentication, admin UI, or CMS workflows. Those are covered by later roadmap phases.

</domain>

<decisions>

## Implementation Decisions

### Public Identity Copy

- **D-01:** Use an English/Chinese mixed personal brand direction, such as `Hans' Tech Lab` / `Hans 的技术实验室`. Keep owner/name configurable; do not hard-code `Personal Tech Lab` as the final brand.
- **D-02:** Hero support copy should use a lab-exploration tone: a digital lab for code notes, system sketches, and experiments in building software.
- **D-03:** Only include Email in the first viewport for Phase 1. Use `zhdydkdh@163.com`. Do not include GitHub, RSS, or Projects placeholders in the hero.
- **D-04:** Use mixed English and Chinese on the homepage. Main title and CTA can be English; supporting explanations and empty states may include Chinese for readability.

### Background Personality

- **D-05:** Use a Signal network background: nodes, connecting lines, pulse signals, and slight mouse attraction. It should feel like system topology or a distributed network.
- **D-06:** Motion intensity should be Ambient subtle: slow drift and occasional pulses. Prioritize stable hero readability over spectacle.
- **D-07:** Use Light attraction on desktop: nearby nodes subtly move toward the pointer or connected lines brighten. Do not use pointer-follow behavior on mobile.
- **D-08:** The signal network should feel like a Data pulse field: fewer nodes, with emphasis on pulses flowing along connections like packet or data transmission.

### Placeholder Content Style

- **D-09:** Homepage preview cards should be System placeholders, not fake articles. Cards should represent content/system modules such as Notes, Series, and Archive, and make clear that real content will connect later.
- **D-10:** Module placeholder copy should use an Editorial tone. The cards should read like content-column descriptions, not fake articles and not overly console-like jargon.
- **D-11:** Placeholder route empty states on `/notes`, `/series`, `/archive`, and `/search` should be Chinese-first so Chinese readers understand immediately. Homepage copy can remain mixed English/Chinese.
- **D-12:** The code/prose reading preview should be a generic preview that demonstrates code block and technical-note typography without implying a real article exists.

### Navigation Priority

- **D-13:** Primary CTA points to Notes. Keep `Explore Notes` as the first action even while Phase 1 only has placeholder/empty-state content.
- **D-14:** Secondary CTA should be `Open Lab Index`, jumping to the homepage route strip or index section showing Notes, Series, Archive, and Search.
- **D-15:** Header navigation order is Notes / Series / Archive / Search.
- **D-16:** Mobile menu uses the same order as the header: Notes / Series / Archive / Search.

### The Agent's Discretion

- Choose exact final phrasing for mixed English/Chinese supporting copy as long as it follows the decisions above and the approved UI-SPEC.
- Choose the exact signal-node animation implementation within the UI-SPEC limits: CSS + 2D Canvas + Motion, no Three.js/R3F in Phase 1.
- Choose placeholder card titles/descriptions as long as they are editorial module placeholders and cannot be mistaken for real published posts.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope and Requirements

- `.planning/PROJECT.md` - Project identity, core value, constraints, out-of-scope items, and confirmed product direction.
- `.planning/REQUIREMENTS.md` - Phase 1 requirement IDs VIS-01 through VIS-05, QUAL-02, and QUAL-03.
- `.planning/ROADMAP.md` - Phase 1 goal, MVP mode, success criteria, and planned slices.
- `.planning/STATE.md` - Current GSD project state and session continuity.

### Design Contract

- `.planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md` - Approved UI design contract. This is the primary design source for spacing, typography, color, motion, accessibility, responsive behavior, component inventory, and verification checklist.

### Research Context

- `.planning/research/SUMMARY.md` - Research summary and phase-ordering rationale.
- `.planning/research/STACK.md` - Recommended stack: Next.js, Tailwind CSS v4, Motion, optional Three.js later, lucide-react, and related frontend tooling.
- `.planning/research/PITFALLS.md` - Visual-performance, readability, reduced-motion, and mobile pitfalls to avoid.

### Project Guide

- `AGENTS.md` - Generated project guide and workflow enforcement notes.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- None yet. The repository currently contains planning artifacts and no application scaffold.

### Established Patterns

- No app-level code patterns exist yet. Phase 1 should establish initial conventions rather than adapt existing components.
- GSD planning artifacts are authoritative. Use the approved UI-SPEC and this CONTEXT.md before implementation planning.

### Integration Points

- Phase 1 starts from scaffold. It should create the public shell, homepage, placeholder public routes, and local primitives described in `01-UI-SPEC.md`.
- Future phases will connect real content, admin auth, CMS workflows, and public content routes to the shell created here.

</code_context>

<specifics>

## Specific Ideas

- Brand direction should support a configurable personal name, with examples like `Hans' Tech Lab` / `Hans 的技术实验室`.
- Email link to include in Phase 1: `zhdydkdh@163.com`.
- Hero should feel like a quiet distributed-system signal field, not a starfield, terminal wallpaper, or high-energy animation.
- Empty states for placeholder routes should be clear in Chinese, while homepage brand language can remain mixed English/Chinese.

</specifics>

<deferred>

## Deferred Ideas

None - discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 1-Visual Foundation and Public Shell*
*Context gathered: 2026-06-30*
