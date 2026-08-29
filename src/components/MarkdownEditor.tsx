"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// SSR 시 window 참조 문제로 인해 클라이언트 전용으로 동적 로드
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={480}
        preview="live"
        textareaProps={{ placeholder: "마크다운으로 글을 작성해보세요..." }}
      />
    </div>
  );
}
