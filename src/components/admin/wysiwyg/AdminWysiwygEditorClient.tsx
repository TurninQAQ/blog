"use client";

import { useEffect, useId } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import { createWysiwygExtensions } from "@/lib/admin/wysiwyg/extensions";

import { WysiwygToolbar } from "./WysiwygToolbar";

type AdminWysiwygEditorClientProps = {
  value: string;
  error?: string;
  onMarkdownChange: (value: string) => void;
};

function editorErrorAttributes(error: string | undefined, errorId: string) {
  return {
    "aria-label": "正文",
    "aria-multiline": "true",
    "aria-invalid": error ? "true" : "false",
    role: "textbox",
    ...(error ? { "aria-describedby": errorId } : {}),
  };
}

export function AdminWysiwygEditorClient({
  value,
  error,
  onMarkdownChange,
}: AdminWysiwygEditorClientProps) {
  const errorId = useId();
  const editor = useEditor({
    extensions: createWysiwygExtensions(),
    content: value,
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: editorErrorAttributes(error, errorId),
    },
    onUpdate: ({ editor: currentEditor }) => {
      onMarkdownChange(currentEditor.getMarkdown());
    },
  });

  useEffect(() => {
    if (!editor || editor.getMarkdown() === value) {
      return;
    }

    editor.commands.setContent(value, {
      contentType: "markdown",
      emitUpdate: false,
    });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        attributes: editorErrorAttributes(error, errorId),
      },
    });
  }, [editor, error, errorId]);

  return (
    <section aria-label="正文画布" className="lab-wysiwyg-shell">
      <WysiwygToolbar editor={editor} />
      <EditorContent editor={editor} className="lab-wysiwyg-canvas" />
      {error ? (
        <p id={errorId} role="alert" className="lab-field-error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
