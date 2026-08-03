"use client";

import { useState } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

export function TableNodeView() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <NodeViewWrapper className="lab-table-node">
      <div className="lab-table-node-toolbar">
        <span>表格</span>
        <button type="button" onClick={() => setIsEditing((value) => !value)}>
          {isEditing ? "完成表格编辑" : "编辑表格"}
        </button>
      </div>
      <div
        className={
          isEditing ? "lab-table-node-grid is-editing" : "lab-table-node-grid"
        }
      >
        <NodeViewContent<"table"> as="table" />
      </div>
    </NodeViewWrapper>
  );
}
