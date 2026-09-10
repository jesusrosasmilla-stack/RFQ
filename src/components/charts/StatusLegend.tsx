import { STATUS } from "@/lib/colors";

export function StatusLegend({
  items,
}: {
  items: { label: string; status: keyof typeof STATUS }[];
}) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: STATUS[it.status] }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}
