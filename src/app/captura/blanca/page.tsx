import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateSettings, canEditRecord } from "@/lib/access";
import { parseDateParam, todayParam, formatDateEs } from "@/lib/date";
import { WhiteEquipmentCard } from "@/components/WhiteEquipmentCard";
import { InoperativoCard } from "@/components/InoperativoCard";
import { EquipmentPicker } from "@/components/EquipmentPicker";
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
        include: {
          trips: { orderBy: { numero: "asc" }, include: { equipoCarguio: { select: { code: true } } } },
        },
      },
      dailyRosters: { where: { date } },
    },
  });

  const equiposCarguio = await prisma.equipment.findMany({
    where: { category: "LINEA_AMARILLA", active: true },
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true },
  });

  const canOperate = isAdmin || (session.user.active && settings.dataEntryOpen);
  const editableRoster = isAdmin || canOperate;

  const enRoster = equipment.filter((eq) => eq.dailyRosters[0]);
  const disponibles = equipment
    .filter((eq) => !eq.dailyRosters[0])
    .map((eq) => ({ id: eq.id, code: eq.code, name: eq.name, placa: eq.placa }));

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

      {editableRoster && <EquipmentPicker date={dateStr} available={disponibles} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {enRoster.map((eq) => {
          const roster = eq.dailyRosters[0];
          const record = eq.whiteRecords[0] ?? null;

          if (roster.estado === "INOPERATIVO") {
            return (
              <InoperativoCard
                key={`${eq.id}-${dateStr}`}
                equipment={{ code: eq.code, name: eq.name, model: eq.model, placa: eq.placa }}
                roster={roster}
                editable={editableRoster}
              />
            );
          }

          const editable =
            isAdmin ||
            (canOperate && (!record || canEditRecord(session.user, record, settings.dataEntryOpen)));
          return (
            <WhiteEquipmentCard
              key={`${eq.id}-${dateStr}`}
              equipment={{
                id: eq.id,
                code: eq.code,
                name: eq.name,
                model: eq.model,
                placa: eq.placa,
                volumen: eq.volumen,
              }}
              date={dateStr}
              record={record}
              roster={roster}
              editable={editable}
              equiposCarguio={equiposCarguio}
            />
          );
        })}
        {enRoster.length === 0 && (
          <p className="text-slate-500 text-sm">
            Ningún volquete ha sido seleccionado para hoy todavía. Agrégalos arriba.
          </p>
        )}
      </div>
    </div>
  );
}
