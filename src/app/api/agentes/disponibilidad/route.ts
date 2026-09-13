import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateAgenteDisponibilidad, getAgentes } from "@/lib/google-sheets";

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
  if (!user || user.tipo !== "agente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { disponible } = await req.json();
    const actualizado = await updateAgenteDisponibilidad(user.userId, Boolean(disponible));

    return NextResponse.json({
      success: true,
      disponible_turnos: actualizado?.disponible_turnos,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar disponibilidad" },
      { status: 500 }
    );
  }
}
