import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateSettings, canEditRecord } from "@/lib/access";
import { parseDateParam, todayParam, formatDateEs } from "@/lib/date";
import { WhiteEquipmentCard } from "@/components/WhiteEquipmentCard";
import { AccessBanner } from "@/components/AccessBanner";
import { DateNav } from "@/components/DateNav";

export default async function CapturaBlancaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const settings = await getOrCreateSettings();
  const { date: dateQuery } = await searchParams;
  const isAdmin = session.user.role === "ADMIN";
  const dateStr = isAdmin && dateQuery ? dateQuery : todayParam();
  const date = parseDateParam(dateStr);

  const equipment = await prisma.equipment.findMany({
    where: { category: "LINEA_BLANCA", ...(isAdmin ? {} : { active: true }) },
    orderBy: { code: "asc" },
    include: {
      whiteRecords: {
        where: { date },
        include: { trips: { orderBy: { numero: "asc" } } },
      },
    },
  });

  const canOperate = isAdmin || (session.user.active && settings.dataEntryOpen);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Volquetes — Ciclos de viaje</h1>
          <p className="text-sm text-slate-500">{formatDateEs(date)}</p>
        </div>
        {isAdmin && <DateNav basePath="/captura/blanca" date={dateStr} />}
      </div>

      <AccessBanner settings={settings} isAdmin={isAdmin} userActive={session.user.active} />

      <div className="grid gap-4 sm:grid-cols-2">
        {equipment.map((eq) => {
          const record = eq.whiteRecords[0] ?? null;
          const editable =
            isAdmin ||
            (canOperate && (!record || canEditRecord(session.user, record, settings.dataEntryOpen)));
          return (
            <WhiteEquipmentCard
              key={`${eq.id}-${dateStr}`}
              equipment={{ id: eq.id, code: eq.code, name: eq.name, model: eq.model }}
              date={dateStr}
              record={record}
              editable={editable}
            />
          );
        })}
        {equipment.length === 0 && (
          <p className="text-slate-500 text-sm">No hay volquetes registrados.</p>
        )}
      </div>
    </div>
  );
}
