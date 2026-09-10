"use client";

import { useRef, useState, useTransition } from "react";

export function PhotoUploadButton({
  label,
  currentUrl,
  disabled,
  onUpload,
}: {
  label: string;
  currentUrl?: string | null;
  disabled?: boolean;
  onUpload: (file: File) => Promise<unknown>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        await onUpload(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir la foto.");
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <div className="flex items-center gap-1.5">
        {currentUrl && (
          <a href={currentUrl} target="_blank" rel="noreferrer" className="shrink-0">
            <img
              src={currentUrl}
              alt={label}
              className="w-8 h-8 rounded object-cover border border-slate-300"
            />
          </a>
        )}
        <button
          type="button"
          disabled={disabled || pending}
          onClick={() => inputRef.current?.click()}
          className="text-xs px-2 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 flex items-center gap-1"
        >
          📷 {pending ? "Subiendo..." : currentUrl ? "Cambiar foto" : label}
        </button>
      </div>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
