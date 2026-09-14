import { NextResponse } from "next/server";
import { getAgentes } from "@/lib/google-sheets";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const agentes = await getAgentes();
  // Sanitizar PIN antes de exponer
  const sanitized = agentes.map(({ pin, ...rest }) => rest);
  return NextResponse.json({ agentes: sanitized });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { nombre, pin, rol, especialidades, telefono, email } = body;

    if (!nombre || !pin) {
      return NextResponse.json(
        { error: "Nombre y PIN son requeridos" },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(pin.trim())) {
      return NextResponse.json({ error: "PIN inválido" }, { status: 400 });
    }

    const validRol = (rol === "admin" || rol === "agente") ? rol : "agente";

    const { addAgente } = await import("@/lib/google-sheets");
    const nuevoAgente = await addAgente({
      id: `AG-${Math.floor(100 + Math.random() * 900)}`,
      nombre: nombre.trim(),
      pin: pin.trim(),
      rol: validRol,
      especialidades: Array.isArray(especialidades) ? especialidades : ["estilista"],
      telefono: telefono?.trim(),
      email: email?.trim(),
      disponible_turnos: true,
      activo: true,
    });

    return NextResponse.json({ success: true, agente: { ...nuevoAgente, pin: undefined } });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al crear colaborador" },
      { status: 500 }
    );
  }
}
