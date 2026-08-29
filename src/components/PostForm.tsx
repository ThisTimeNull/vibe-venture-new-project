"use client";

import { useState, useTransition } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { ActionResult } from "@/lib/actions/posts";

export default function PostForm({
  action,
  defaultTitle = "",
  defaultContent = "",
  defaultThumbnail = "",
  submitLabel = "출간하기",
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  defaultTitle?: string;
  defaultContent?: string;
  defaultThumbnail?: string;
  submitLabel?: string;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [thumbnail, setThumbnail] = useState(defaultThumbnail);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);
    formData.set("thumbnail_url", thumbnail);

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full border-b border-gray-200 pb-3 text-2xl font-bold outline-none focus:border-black"
        maxLength={150}
      />
      <input
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
        placeholder="썸네일 이미지 URL (선택)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
      />
      <MarkdownEditor value={content} onChange={setContent} />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
