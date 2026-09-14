import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateAgenteDisponibilidad, getAgentes } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.tipo !== "agente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const agentes = await getAgentes();
  const agente = agentes.find((a) => a.id === user.userId);

  return NextResponse.json({
    disponible_turnos: agente ? agente.disponible_turnos : false,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id_agente, disponible } = await req.json();
    const targetId = user.rol === "admin" && id_agente ? id_agente : user.userId;
    const actualizado = await updateAgenteDisponibilidad(targetId, Boolean(disponible));

    return NextResponse.json({
      success: true,
      disponible_turnos: actualizado?.disponible_turnos,
      agente: actualizado,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar disponibilidad" },
      { status: 500 }
    );
  }
}
