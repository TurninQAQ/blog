# Phase 6 Context

## Locked product decisions

- Runtime brand spelling is exactly `Hans‘s Blog`, matching the owner-provided text.
- Remove the entire homepage “阅读界面 / 阅读版式预览” block; do not replace it with another filler section.
- Replace all three public mecha assets with newly generated original artwork. Preserve the light manga composition and responsive contracts, but prohibit recognizable Gundam identifiers, logos, weapons, V-fin crowns, faceplates, and the classic white/blue/red/yellow block scheme.
- Extend the existing Tiptap editor; do not replace it. Keep Markdown as the saved source and keep raw HTML disabled.
- Text color is a fixed four-tone allowlist serialized as Markdown directives, never arbitrary CSS or HTML.
- Markdown import is available on new drafts, is bounded to 1 MiB, validates WYSIWYG compatibility before updating form state, and never publishes.
- Uploaded images are stored in PostgreSQL, validated after authentication, decoded and re-encoded as metadata-free WebP, and served privately until first referenced by a published post.
- Existing external HTTPS image URLs remain supported for compatibility. The server never fetches them.
- Public launch still requires provider-owned TLS/Host/WAF/secrets/private-database/restore/monitoring evidence; local verification must not claim those controls are complete.

## Success standard

The phase is complete only when the revised UI works at desktop, 390 px, and 320 px; editor/import/upload round trips persist; hostile media and raw HTML are rejected; and the repository’s full automated/security gates pass with fresh browser evidence.
