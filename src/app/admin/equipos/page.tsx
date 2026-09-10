import { prisma } from "@/lib/prisma";
import { NewEquipmentForm } from "@/components/admin/NewEquipmentForm";
import { EquipmentRow } from "@/components/admin/EquipmentRow";

export const dynamic = "force-dynamic";

function EquipmentTable({
  title,
  equipment,
}: {
  title: string;
  equipment: Awaited<ReturnType<typeof prisma.equipment.findMany>>;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
      <h2 className="font-semibold text-slate-800 mb-3">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-100">
            <th className="py-2 pr-2">Código</th>
            <th className="py-2 pr-2">Nombre / Descripción</th>
            <th className="py-2 pr-2">Contratista</th>
            <th className="py-2 pr-2">Modelo</th>
            <th className="py-2 pr-2">Placa</th>
            <th className="py-2 pr-2">Volumen</th>
            <th className="py-2 pr-2">Costo / HM</th>
            <th className="py-2 pr-2">Estado</th>
            <th className="py-2 pr-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((eq) => (
            <EquipmentRow key={eq.id} equipment={eq} />
          ))}
          {equipment.length === 0 && (
            <tr>
              <td colSpan={9} className="py-3 text-slate-400 text-sm">
                Sin equipos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function EquiposPage() {
  const equipment = await prisma.equipment.findMany({ orderBy: [{ category: "asc" }, { code: "asc" }] });
  const amarilla = equipment.filter((e) => e.category === "LINEA_AMARILLA");
  const blanca = equipment.filter((e) => e.category === "LINEA_BLANCA");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Equipos</h1>
        <p className="text-sm text-slate-500">
          Base de datos maestra: código, contratista, placa y costo por hora-máquina de cada
          equipo. El resto de la aplicación (captura, planificación, panel de productividad) toma
          estos datos de aquí.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="font-semibold text-slate-800 mb-3">Registrar equipo</h2>
        <NewEquipmentForm />
      </div>

      <EquipmentTable title="Línea amarilla" equipment={amarilla} />
      <EquipmentTable title="Volquetes (línea blanca)" equipment={blanca} />
    </div>
  );
}
