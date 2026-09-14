import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAgentes, getServicios, getCitas } from "@/lib/google-sheets";
import { calcularSlotsDisponibles, obtenerHorarioDia } from "@/lib/agenda-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const agenteId = searchParams.get("agenteId");
  const servicioId = searchParams.get("servicioId");
  const fecha = searchParams.get("fecha");

  if (!agenteId || !servicioId || !fecha) {
    return NextResponse.json(
      { error: "agenteId, servicioId y fecha son requeridos" },
      { status: 400 }
    );
  }

  const [agentes, servicios, citas] = await Promise.all([
    getAgentes(),
    getServicios(),
    getCitas(),
  ]);

  const agente = agentes.find((a) => a.id === agenteId && a.activo);
  const servicio = servicios.find((s) => s.id === servicioId && s.activo);

  if (!agente || !servicio) {
    return NextResponse.json(
      { error: "Agente o servicio no encontrado" },
      { status: 404 }
    );
  }

  const horario = obtenerHorarioDia(agente, fecha);
  const slots = calcularSlotsDisponibles(agente, servicio, fecha, citas, servicios);

  return NextResponse.json({
    fecha,
    agente: { id: agente.id, nombre: agente.nombre },
    servicio: { id: servicio.id, nombre: servicio.nombre, duracion_min: servicio.duracion_min },
    horarioLaboral: horario,
    slots,
  });
}
