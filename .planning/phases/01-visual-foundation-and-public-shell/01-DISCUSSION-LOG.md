# Phase 1: Visual Foundation and Public Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 1-Visual Foundation and Public Shell
**Areas discussed:** Public identity copy, Background personality, Placeholder content style, Navigation priority

---

## Public Identity Copy

### Homepage Public Identity Direction

| Option | Description | Selected |
|--------|-------------|----------|
| Keep generic English brand | `Personal Tech Lab`; fast to land, replace later | |
| Chinese programmer identity | Chinese personal-lab framing | |
| English/Chinese mixed personal brand | Example: `Hans' Tech Lab` / `Hans 的技术实验室` | yes |
| Other | Freeform brand/owner name | |

**User's choice:** English/Chinese mixed personal brand.  
**Notes:** Keep owner/name configurable; do not hard-code `Personal Tech Lab` as final brand.

### Hero Support Copy Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Engineer notes tone | Practical programming notes and implementation logs | |
| Lab exploration tone | Digital lab for code notes, system sketches, and experiments | yes |
| Personal brand tone | First-person writing about code, systems, and decisions | |
| Other | Freeform support copy | |

**User's choice:** Lab exploration tone.  
**Notes:** Should feel exploratory without becoming vague marketing copy.

### Personal Links in First Viewport

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub + Email | Minimal technical profile links | |
| GitHub + Email + RSS | Adds subscription affordance | |
| GitHub + Email + RSS + Projects | More portfolio-like | |
| Other | Freeform link list | yes |

**User's choice:** Only Email.  
**Notes:** Use `zhdydkdh@163.com`. Do not include GitHub, RSS, or Projects placeholders.

### Homepage Copy Language

| Option | Description | Selected |
|--------|-------------|----------|
| English-first | Brand, CTAs, routes, and explanation mostly English | |
| Mixed English and Chinese | English title/CTA with Chinese or mixed support copy | yes |
| Chinese-first | Most explanation and empty states in Chinese | |
| Other | Freeform language preference | |

**User's choice:** Mixed English and Chinese.  
**Notes:** Main title/CTA can be English; supporting text and empty states can use Chinese for readability.

---

## Background Personality

### Homepage Immersive Background Personality

| Option | Description | Selected |
|--------|-------------|----------|
| Signal network | Nodes, lines, pulses, system topology feel | yes |
| Terminal grid | Coordinates, scanlines, terminal metadata | |
| Particle starfield | Deep-space particle field | |
| Code scanner | Code/data scanline motion | |

**User's choice:** Signal network.  
**Notes:** Should feel like system topology or a distributed network.

### Motion Intensity

| Option | Description | Selected |
|--------|-------------|----------|
| Ambient subtle | Slow drift, occasional pulses, most readable | yes |
| Noticeable but calm | Clearly alive, still restrained | |
| High-energy lab | Stronger pulses and connection changes | |
| Other | Freeform intensity | |

**User's choice:** Ambient subtle.  
**Notes:** Prioritize stable hero readability over spectacle.

### Pointer Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Light attraction | Nearby nodes or lines subtly react to pointer | yes |
| Spotlight field | Soft pointer-centered light field | |
| Click ripple | Click-triggered signal pulse | |
| No pointer effect | Automatic ambient animation only | |

**User's choice:** Light attraction.  
**Notes:** Desktop only; mobile has no pointer-follow behavior.

### Signal Network Spatial Feel

| Option | Description | Selected |
|--------|-------------|----------|
| Clean technical graph | Clear nodes and fine lines | |
| Data pulse field | Fewer nodes, pulse flow along connections | yes |
| Dense lab mesh | More nodes and denser immersion | |
| Other | Freeform spatial feel | |

**User's choice:** Data pulse field.  
**Notes:** Emphasize data/packet transmission over density.

---

## Placeholder Content Style

### Homepage Preview Card Placeholder Approach

| Option | Description | Selected |
|--------|-------------|----------|
| System placeholders | Module placeholders, not fake articles | yes |
| Draft-like sample topics | Obviously marked sample/draft topics | |
| Skeleton/empty state only | No preview cards | |
| Other | Freeform placeholder approach | |

**User's choice:** System placeholders.  
**Notes:** Cards should represent modules such as Notes, Series, and Archive.

### Module Placeholder Copy Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Operational | System-status style copy | |
| Editorial | Content-column descriptions | yes |
| Lab status | More console/lab-status style | |
| Other | Freeform tone | |

**User's choice:** Editorial.  
**Notes:** Avoid fake-article copy and overly console-like jargon.

### Placeholder Route Empty-State Language

| Option | Description | Selected |
|--------|-------------|----------|
| Mixed English and Chinese | Matches homepage language mix | |
| Chinese-first | Prioritizes immediate clarity for Chinese readers | yes |
| English-first | Keeps technical brand language consistent | |
| Other | Freeform language choice | |

**User's choice:** Chinese-first.  
**Notes:** Applies to `/notes`, `/series`, `/archive`, and `/search` placeholder routes.

### Code/Prose Reading Preview Content

| Option | Description | Selected |
|--------|-------------|----------|
| Generic preview | Demonstrates code and note typography without fake article content | yes |
| Shell build preview | Preview about building this blog shell | |
| No code preview yet | Defer code preview to real article rendering phase | |
| Other | Freeform preview content | |

**User's choice:** Generic preview.  
**Notes:** Must not imply a real article exists.

---

## Navigation Priority

### Homepage Primary CTA Destination

| Option | Description | Selected |
|--------|-------------|----------|
| Notes | First action leads to technical notes | yes |
| Series | First action leads to ordered topics | |
| Search | First action leads to search | |
| Lab Index | First action leads to route/index section | |

**User's choice:** Notes.  
**Notes:** Keep `Explore Notes` as primary action.

### Homepage Secondary CTA

| Option | Description | Selected |
|--------|-------------|----------|
| Open Lab Index | Jump to homepage route strip/index section | yes |
| Contact | Open/copy email | |
| Series | Lead to series | |
| Search | Lead to search | |

**User's choice:** Open Lab Index by recommendation.  
**Notes:** User asked to follow recommendation after asking what CTA means.

### Header Navigation Order

| Option | Description | Selected |
|--------|-------------|----------|
| Notes / Series / Archive / Search | Content first, then organization, history, and tool | yes |
| Notes / Search / Series / Archive | Emphasizes search earlier | |
| Series / Notes / Archive / Search | Emphasizes topic reading | |
| Other | Freeform order | |

**User's choice:** Notes / Series / Archive / Search.  
**Notes:** None.

### Mobile Menu Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Same order as header | Notes / Series / Archive / Search | yes |
| Notes highlighted | Notes as large primary mobile item | |
| Lab Index style | Four large touch cards | |
| Other | Freeform mobile approach | |

**User's choice:** Same order as header.  
**Notes:** Keep mobile consistent with desktop navigation.

## The Agent's Discretion

- Exact mixed English/Chinese copy can be finalized during implementation as long as it follows CONTEXT.md and UI-SPEC.
- Exact Canvas signal-network implementation details are flexible within UI-SPEC performance and reduced-motion limits.

## Deferred Ideas

None.
