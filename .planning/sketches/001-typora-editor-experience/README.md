---
sketch: 001
name: typora-editor-experience
question: "Which editor interaction model best replaces the split Markdown source and preview layout?"
winner: A
tags: [admin, editor, markdown, typora]
---

# Sketch 001: Typora Editor Experience

## Design Question

Which editing model should replace the current left Markdown source and right preview layout for the admin new/edit article page?

## How to View

Open `.planning/sketches/001-typora-editor-experience/index.html` in a browser, or use the visual companion URL if one is running.

## Variants

- **A: True WYSIWYG Blocks** — Selected and implemented. Directly edit rendered headings, paragraphs, lists, code blocks, tables, and image URLs while Markdown remains the persisted format.
- **B: Focused Typora-like Markdown** — Historical alternate. Single-column writing canvas that stores Markdown, hides preview split, and offers a source toggle.
- **C: Dual Mode Compact** — Historical alternate. Default writing canvas plus an explicit source drawer for technical fixes.

## Final Decision

Variant A was selected. The implemented admin editor uses a Tiptap WYSIWYG canvas, persists Markdown through an adapter, and blocks unsupported Markdown through a compatibility notice instead of preserving a source-edit fallback.

## What to Look For

- Whether the page feels like writing an article instead of filling a form.
- Whether Markdown persists reliably for technical notes without exposing a source fallback in the normal editor.
- Whether metadata controls stay useful without stealing space from the writing surface.
- Whether mobile behavior is understandable without a side-by-side preview.
