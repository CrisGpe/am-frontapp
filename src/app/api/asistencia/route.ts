import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAsistenciaHoy, registrarAsistencia } from "@/lib/google-sheets";
import { getTodayDateString, getCurrentTimeString } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const hoy = getTodayDateString();
  const registros = await getAsistenciaHoy(hoy);
  return NextResponse.json({ asistencia: registros, fecha: hoy });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.tipo !== "agente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { tipoAccion } = body; // 'checkin' | 'checkout'
    const hoy = getTodayDateString();
    const horaActual = getCurrentTimeString();

    const registros = await getAsistenciaHoy(hoy);
    const miRegistro = registros.find((r) => r.id_agente === user.userId);

    if (tipoAccion === "checkin") {
      if (miRegistro && miRegistro.hora_checkin) {
        return NextResponse.json(
          { error: "Ya registraste tu check-in hoy" },
          { status: 400 }
        );
      }

      const nuevoRegistro = await registrarAsistencia({
        fecha: hoy,
        id_agente: user.userId,
        nombre_agente: user.nombre,
        hora_checkin: horaActual,
        estado: "presente",
      });

      return NextResponse.json({ success: true, asistencia: nuevoRegistro });
    } else if (tipoAccion === "checkout") {
      if (!miRegistro) {
        return NextResponse.json(
          { error: "Debes registrar check-in antes de registrar salida" },
          { status: 400 }
        );
      }

      const actualizado = await registrarAsistencia({
        ...miRegistro,
        hora_checkout: horaActual,
      });

      return NextResponse.json({ success: true, asistencia: actualizado });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al registrar asistencia" },
      { status: 500 }
    );
  }
}
