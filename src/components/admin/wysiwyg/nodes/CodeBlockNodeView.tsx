"use client";

import { useState } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

export function CodeBlockNodeView() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <NodeViewWrapper
      className={isEditing ? "lab-code-node is-editing" : "lab-code-node"}
      onClick={() => setIsEditing(true)}
    >
      <div className="lab-code-node-toolbar">
        <span>代码块</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsEditing((value) => !value);
          }}
        >
          {isEditing ? "完成代码编辑" : "编辑代码块"}
        </button>
      </div>
      <pre>
        <NodeViewContent<"code"> as="code" className="lab-code-node-content" />
      </pre>
    </NodeViewWrapper>
  );
}
