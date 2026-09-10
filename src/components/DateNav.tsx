"use client";

import { useRouter } from "next/navigation";

export function DateNav({ basePath, date }: { basePath: string; date: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-600">Fecha:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => router.push(`${basePath}?date=${e.target.value}`)}
        className="border border-slate-300 rounded-md px-2 py-1 text-sm"
      />
    </div>
  );
}
