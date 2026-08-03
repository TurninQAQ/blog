type UnsupportedEditorContentNoticeProps = {
  issues: Array<{ code: string; message: string }>;
};

const issueMessages: Record<string, string> = {
  "definition-list": "包含定义列表语法。",
  footnote: "包含脚注语法。",
  "lossy-roundtrip": "该正文无法稳定转换为可视化文档。",
  "mdx-like": "包含 MDX 语法。",
  "raw-html": "包含 raw HTML。",
  "task-list": "包含任务列表语法。",
  "unsupported-mark": "包含不支持的文本标记。",
  "unsupported-node": "包含不支持的内容块。",
};

export function UnsupportedEditorContentNotice({
  issues,
}: UnsupportedEditorContentNoticeProps) {
  return (
    <section
      className="rounded-lab border border-[rgba(255,138,138,0.32)] bg-[rgba(255,138,138,0.08)] p-5"
      aria-label="正文无法进入可视化编辑"
    >
      <h2 className="text-[20px] font-semibold leading-[1.3] text-lab-text">
        这篇正文暂时无法进入可视化编辑
      </h2>
      <p className="mt-3 text-[15px] leading-[1.6] text-lab-text-muted">
        当前正文包含可视化编辑器不支持的 Markdown
        语法。为避免正文损坏，系统已阻止本次编辑。
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[14px] leading-[1.5] text-[#ffb1b1]">
        {issues.map((issue) => (
          <li key={`${issue.code}-${issue.message}`}>
            {issueMessages[issue.code] ?? issue.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
