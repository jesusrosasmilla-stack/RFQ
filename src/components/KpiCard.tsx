import { STATUS } from "@/lib/colors";

export function KpiCard({
  label,
  value,
  sub,
  status,
}: {
  label: string;
  value: string;
  sub?: string;
  status?: keyof typeof STATUS;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className="text-2xl font-bold mt-1"
        style={{ color: status ? STATUS[status] : "#0b0b0b" }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
