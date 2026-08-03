"use client";

import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Code2,
  ImageIcon,
  List,
  ListOrdered,
  Quote,
  Table2,
  Underline,
} from "lucide-react";

import {
  isTextTone,
  textTones,
  type TextTone,
} from "@/lib/markdown/markdown-policy";

import { ImageInsertDialog } from "./ImageInsertDialog";

type WysiwygToolbarProps = {
  editor: Editor | null;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  buttonRef: (button: HTMLButtonElement | null) => void;
  tabIndex: number;
  onFocus: () => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onClick: () => void;
};

type ToolbarButtonItem = {
  id: string;
  label: string;
  active?: boolean;
  icon: ReactNode;
  onClick: () => void;
};

const blockStyles = [
  {
    value: "paragraph",
    label: "正文",
    isActive: (editor: Editor) => !editor.isActive("heading"),
    apply: (editor: Editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    value: "heading-1",
    label: "一级标题",
    isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
    apply: (editor: Editor) =>
      editor.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    value: "heading-2",
    label: "二级标题",
    isActive: (editor: Editor) => editor.isActive("heading", { level: 2 }),
    apply: (editor: Editor) =>
      editor.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    value: "heading-3",
    label: "三级标题",
    isActive: (editor: Editor) => editor.isActive("heading", { level: 3 }),
    apply: (editor: Editor) =>
      editor.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    value: "heading-4",
    label: "四级标题",
    isActive: (editor: Editor) => editor.isActive("heading", { level: 4 }),
    apply: (editor: Editor) =>
      editor.chain().focus().setHeading({ level: 4 }).run(),
  },
] as const;

const textToneLabels: Record<TextTone, string> = {
  blue: "蓝色",
  red: "红色",
  green: "绿色",
  amber: "琥珀色",
};

function ToolbarButton({
  label,
  active,
  disabled = false,
  icon,
  buttonRef,
  tabIndex,
  onFocus,
  onKeyDown,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      tabIndex={tabIndex}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className="lab-wysiwyg-toolbar-button"
      disabled={disabled}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function WysiwygToolbar({ editor }: WysiwygToolbarProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedButtonIndex, setFocusedButtonIndex] = useState(0);
  const disabled = !editor;
  const activeState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return {
          blockStyle: "paragraph",
          tone: "",
          bold: false,
          underline: false,
          blockquote: false,
          bulletList: false,
          orderedList: false,
          codeBlock: false,
        };
      }

      const tone = currentEditor.getAttributes("textTone").tone;

      return {
        blockStyle:
          blockStyles.find((style) => style.isActive(currentEditor))?.value ??
          "paragraph",
        tone: isTextTone(tone) ? tone : "",
        bold: currentEditor.isActive("bold"),
        underline: currentEditor.isActive("underline"),
        blockquote: currentEditor.isActive("blockquote"),
        bulletList: currentEditor.isActive("bulletList"),
        orderedList: currentEditor.isActive("orderedList"),
        codeBlock: currentEditor.isActive("codeBlock"),
      };
    },
  }) ?? {
    blockStyle: "paragraph",
    tone: "",
    bold: false,
    underline: false,
    blockquote: false,
    bulletList: false,
    orderedList: false,
    codeBlock: false,
  };

  function openImageDialog() {
    if (!editor) {
      return;
    }

    setIsImageDialogOpen(true);
  }

  const closeImageDialog = useCallback(() => {
    setIsImageDialogOpen(false);
  }, []);

  const restoreImageButtonFocus = useCallback(() => {
    buttonRefs.current.at(-1)?.focus();
  }, []);

  const toolbarButtons: ToolbarButtonItem[] = [
    {
      id: "bold",
      label: "加粗",
      active: activeState.bold,
      icon: <Bold aria-hidden="true" className="h-4 w-4" />,
      onClick: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      id: "underline",
      label: "下划线",
      active: activeState.underline,
      icon: <Underline aria-hidden="true" className="h-4 w-4" />,
      onClick: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      id: "blockquote",
      label: "插入引用",
      active: activeState.blockquote,
      icon: <Quote aria-hidden="true" className="h-4 w-4" />,
      onClick: () => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
      id: "bullet-list",
      label: "无序列表",
      active: activeState.bulletList,
      icon: <List aria-hidden="true" className="h-4 w-4" />,
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      id: "ordered-list",
      label: "有序列表",
      active: activeState.orderedList,
      icon: <ListOrdered aria-hidden="true" className="h-4 w-4" />,
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      id: "code-block",
      label: "插入代码块",
      active: activeState.codeBlock,
      icon: <Code2 aria-hidden="true" className="h-4 w-4" />,
      onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: "table",
      label: "插入表格",
      icon: <Table2 aria-hidden="true" className="h-4 w-4" />,
      onClick: () =>
        editor
          ?.chain()
          .focus()
          .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
          .run(),
    },
    {
      id: "image",
      label: "插入图片",
      active: isImageDialogOpen,
      icon: <ImageIcon aria-hidden="true" className="h-4 w-4" />,
      onClick: openImageDialog,
    },
  ];

  function toolbarButtonProps(index: number) {
    const buttonCount = toolbarButtons.length;

    return {
      buttonRef: (button: HTMLButtonElement | null) => {
        buttonRefs.current[index] = button;
      },
      tabIndex: focusedButtonIndex === index ? 0 : -1,
      onFocus: () => setFocusedButtonIndex(index),
      onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        let nextIndex: number;

        switch (event.key) {
          case "ArrowRight":
            nextIndex = (index + 1) % buttonCount;
            break;
          case "ArrowLeft":
            nextIndex = (index + buttonCount - 1) % buttonCount;
            break;
          case "Home":
            nextIndex = 0;
            break;
          case "End":
            nextIndex = buttonCount - 1;
            break;
          default:
            return;
        }

        event.preventDefault();
        setFocusedButtonIndex(nextIndex);
        buttonRefs.current[nextIndex]?.focus();
      },
    };
  }

  function applyBlockStyle(value: string) {
    if (!editor) {
      return;
    }

    blockStyles.find((style) => style.value === value)?.apply(editor);
  }

  function applyTextTone(value: string) {
    if (!editor) {
      return;
    }

    if (isTextTone(value)) {
      editor.chain().focus().setTextTone(value).run();
      return;
    }

    editor.chain().focus().unsetTextTone().run();
  }

  function insertImage({ src, alt }: { src: string; alt: string }) {
    if (!editor) {
      return;
    }

    editor
      .chain()
      .focus()
      .insertContentAt(editor.state.selection.to, {
        type: "image",
        attrs: { src, alt },
      })
      .run();
  }

  return (
    <>
      <div
        role="toolbar"
        aria-label="正文工具栏"
        aria-orientation="horizontal"
        className="lab-wysiwyg-toolbar"
      >
        <label className="lab-wysiwyg-toolbar-select-label">
          <span className="sr-only">文本层级</span>
          <select
            aria-label="文本层级"
            className="lab-wysiwyg-toolbar-select"
            disabled={disabled}
            value={activeState.blockStyle}
            onChange={(event) => applyBlockStyle(event.target.value)}
          >
            {blockStyles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </label>
        <label className="lab-wysiwyg-toolbar-select-label">
          <span className="sr-only">文字颜色</span>
          <select
            aria-label="文字颜色"
            className="lab-wysiwyg-toolbar-select"
            disabled={disabled}
            value={activeState.tone}
            onChange={(event) => applyTextTone(event.target.value)}
          >
            <option value="">默认色（清除）</option>
            {textTones.map((tone) => (
              <option key={tone} value={tone}>
                {textToneLabels[tone]}
              </option>
            ))}
          </select>
        </label>
        {toolbarButtons.map((button, index) => (
          <ToolbarButton
            key={button.id}
            {...toolbarButtonProps(index)}
            label={button.label}
            active={button.active}
            disabled={disabled}
            icon={button.icon}
            onClick={button.onClick}
          />
        ))}
      </div>
      <ImageInsertDialog
        open={isImageDialogOpen}
        onClose={closeImageDialog}
        onInsert={insertImage}
        restoreFocus={restoreImageButtonFocus}
      />
    </>
  );
}
