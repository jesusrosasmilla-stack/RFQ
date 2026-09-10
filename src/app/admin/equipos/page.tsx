import { prisma } from "@/lib/prisma";
import { NewEquipmentForm } from "@/components/admin/NewEquipmentForm";
import { EquipmentRow } from "@/components/admin/EquipmentRow";

export default async function EquiposPage() {
  const equipment = await prisma.equipment.findMany({ orderBy: [{ category: "asc" }, { code: "asc" }] });
  const amarilla = equipment.filter((e) => e.category === "LINEA_AMARILLA");
  const blanca = equipment.filter((e) => e.category === "LINEA_BLANCA");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Equipos</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="font-semibold text-slate-800 mb-3">Registrar equipo</h2>
        <NewEquipmentForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Línea amarilla</h2>
          <table className="w-full text-sm">
            <tbody>
              {amarilla.map((eq) => (
                <EquipmentRow key={eq.id} equipment={eq} />
              ))}
              {amarilla.length === 0 && (
                <tr>
                  <td className="text-slate-400 text-sm py-2">Sin equipos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Volquetes (línea blanca)</h2>
          <table className="w-full text-sm">
            <tbody>
              {blanca.map((eq) => (
                <EquipmentRow key={eq.id} equipment={eq} />
              ))}
              {blanca.length === 0 && (
                <tr>
                  <td className="text-slate-400 text-sm py-2">Sin equipos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
