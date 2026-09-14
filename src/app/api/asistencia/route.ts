import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAsistenciaHoy, registrarAsistencia, getSalonConfig } from "@/lib/google-sheets";
import {
  getTodayDateString,
  getCurrentTimeString,
  calcularDistanciaMetros,
  SALON_RADIO_METROS,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fechaParam = searchParams.get("fecha");
  const config = await getSalonConfig();
  const tz = config.zona_horaria || "America/Lima";

  const hoy = fechaParam || getTodayDateString(tz);
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
    const { tipoAccion, fecha, hora, ubicacion } = body; // 'checkin' | 'checkout'
    const config = await getSalonConfig();
    const tz = config.zona_horaria || "America/Lima";

    const hoy = fecha || getTodayDateString(tz);
    const horaActual = hora || getCurrentTimeString(tz);

    // Validación de Geocercado GPS
    let distancia_metros: number | undefined;
    let alerta_ubicacion = false;
    let latitud: number | undefined;
    let longitud: number | undefined;

    if (ubicacion?.latitud != null && ubicacion?.longitud != null) {
      latitud = Number(ubicacion.latitud);
      longitud = Number(ubicacion.longitud);
      distancia_metros = calcularDistanciaMetros(latitud, longitud);
      alerta_ubicacion = distancia_metros > SALON_RADIO_METROS;
    } else {
      // Si el agente no envió coordenadas GPS (bloqueó permisos), se genera alerta de auditoría
      alerta_ubicacion = true;
    }

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
        latitud,
        longitud,
        distancia_metros,
        alerta_ubicacion,
      });

      return NextResponse.json({
        success: true,
        asistencia: nuevoRegistro,
        alerta_ubicacion,
        distancia_metros,
      });
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
        latitud: latitud ?? miRegistro.latitud,
        longitud: longitud ?? miRegistro.longitud,
        distancia_metros: distancia_metros ?? miRegistro.distancia_metros,
        alerta_ubicacion: alerta_ubicacion || miRegistro.alerta_ubicacion,
      });

      return NextResponse.json({
        success: true,
        asistencia: actualizado,
        alerta_ubicacion,
        distancia_metros,
      });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Error al registrar asistencia" },
      { status: 500 }
    );
  }
}
