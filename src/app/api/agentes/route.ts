import { NextResponse } from "next/server";
import { getAgentes } from "@/lib/google-sheets";

export async function GET() {
  const agentes = await getAgentes();
  // Sanitizar PIN antes de exponer
  const sanitized = agentes.map(({ pin, ...rest }) => rest);
  return NextResponse.json({ agentes: sanitized });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, pin, rol, especialidades, telefono, email } = body;

    if (!nombre || !pin) {
      return NextResponse.json(
        { error: "Nombre y PIN son requeridos" },
        { status: 400 }
      );
    }

    const { addAgente } = await import("@/lib/google-sheets");
    const nuevoAgente = await addAgente({
      id: `AG-${Math.floor(100 + Math.random() * 900)}`,
      nombre: nombre.trim(),
      pin: pin.trim(),
      rol: rol || "agente",
      especialidades: Array.isArray(especialidades) ? especialidades : ["estilista"],
      telefono: telefono?.trim(),
      email: email?.trim(),
      disponible_turnos: true,
      activo: true,
    });

    return NextResponse.json({ success: true, agente: nuevoAgente });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al crear colaborador" },
      { status: 500 }
    );
  }
}
