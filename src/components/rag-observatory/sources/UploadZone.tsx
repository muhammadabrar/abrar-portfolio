"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPT =
  ".pdf,.md,.markdown,.docx,.doc,.csv,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,image/*";

export function UploadZone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length || disabled) return;
      onFiles(Array.from(list));
    },
    [onFiles, disabled],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`relative cursor-pointer overflow-hidden rounded-[var(--rag-radius)] border border-dashed p-8 text-center transition-colors sm:p-10 ${
        dragging
          ? "border-[var(--rag-accent)] bg-[var(--rag-accent-dim)]"
          : "border-[var(--rag-border-strong)] bg-[var(--rag-surface)] hover:border-[rgba(45,212,191,0.35)]"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(45,212,191,0.12), transparent 55%)",
        }}
      />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="relative text-base font-medium text-[var(--rag-ink)]">
        Drop knowledge sources here
      </p>
      <p className="relative mt-1 text-sm text-[var(--rag-muted)]">
        PDF & images use <span className="text-teal-300">Mistral OCR</span> ·
        also MD, DOCX, CSV
      </p>
      <p className="relative mt-4 rag-mono text-[11px] text-[var(--rag-faint)]">
        Real upload · OCR runs on the server with your Mistral key / free key
      </p>
    </div>
  );
}
