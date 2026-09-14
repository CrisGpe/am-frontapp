import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getTurnos,
  addTurno,
  getServicios,
  getAgentes,
  getBorrador,
  getAsistenciaHoy,
  getCitas,
  getSalonConfig,
} from "@/lib/google-sheets";
import { evaluarAgentesParaTurno } from "@/lib/turnos-algorithm";
import { getCurrentTimeString, getTodayDateString } from "@/lib/utils";
import { TurnoEspera, ColaAgenteItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const config = await getSalonConfig();
  const tz = config?.zona_horaria || "America/Lima";
  const hoy = getTodayDateString(tz);

  const [turnos, servicios, agentes, borrador, asistencias, citas] = await Promise.all([
    getTurnos(),
    getServicios(),
    getAgentes(),
    getBorrador(),
    getAsistenciaHoy(hoy),
    getCitas(),
  ]);

  const turnosEnEspera = turnos.filter((t) => t.estado === "en_espera");

  // Para cada turno en espera, enriquecer con la sugerencia del algoritmo
  const turnosConSugerencia = turnosEnEspera.map((turno) => {
    const servicio = servicios.find((s) => s.id === turno.id_servicio);
    if (!servicio) return { turno, sugerencia: null };

    const evaluaciones = evaluarAgentesParaTurno(servicio, agentes, borrador, asistencias, citas);
    const mejorCandidato = evaluaciones.find((e) => e.elegible && !e.enAtencionActiva) || evaluaciones.find((e) => e.elegible) || null;

    return {
      ...turno,
      servicio,
      evaluaciones,
      agenteSugerido: mejorCandidato
        ? {
            id: mejorCandidato.agente.id,
            nombre: mejorCandidato.agente.nombre,
            score: mejorCandidato.prioridadScore,
            enAtencionActiva: mejorCandidato.enAtencionActiva,
          }
        : null,
    };
  });

  // Evaluación de la Cola General de Colaboradores (Rotación actual)
  const servicioGenerico = {
    id: "SV-GEN",
    nombre: "General",
    categoria: "otro" as const,
    especialidad_requerida: "",
    duracion_min: 45,
    precio_base: 0,
    activo: true,
  };

  const evaluacionesGenerales = evaluarAgentesParaTurno(
    servicioGenerico,
    agentes,
    borrador,
    asistencias,
    citas
  );

  const colaAgentes: ColaAgenteItem[] = evaluacionesGenerales.map((e) => {
    const atencionesActivas = borrador.filter(
      (b) =>
        b.id_agente === e.agente.id &&
        (b.etapa === "atencion" || b.etapa === "asesoria" || b.etapa === "fin_atencion")
    );
    const ordenActiva = atencionesActivas.length > 0 ? atencionesActivas[0] : null;

    return {
      id: e.agente.id,
      nombre: e.agente.nombre,
      especialidades: e.agente.especialidades || [],
      disponible_turnos: e.agente.disponible_turnos,
      elegible: e.elegible,
      motivoNoElegible: e.motivoNoElegible,
      enAtencionActiva: e.enAtencionActiva,
      ordenActiva: ordenActiva
        ? {
            id_oatc: ordenActiva.id_oatc,
            nombre_servicio: ordenActiva.nombre_servicio,
            etapa: ordenActiva.etapa,
            hora_inicio: ordenActiva.hora_inicio,
          }
        : null,
      totalAtencionesHoy: e.totalAtencionesHoy,
      ultimaHoraFin: e.ultimaHoraFin,
      prioridadScore: e.prioridadScore,
    };
  });

  return NextResponse.json({
    turnos: turnosConSugerencia,
    colaAgentes,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nombre_consumidor, id_servicio, notas } = body;

    if (!nombre_consumidor || !id_servicio) {
      return NextResponse.json(
        { error: "Nombre del consumidor y servicio son requeridos" },
        { status: 400 }
      );
    }

    const servicios = await getServicios();
    const servicio = servicios.find((s) => s.id === id_servicio);

    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const config = await getSalonConfig();
    const tz = config?.zona_horaria || "America/Lima";

    const nuevoTurno: TurnoEspera = {
      id: `TRN-${Math.floor(100 + Math.random() * 900)}`,
      nombre_consumidor: nombre_consumidor.trim(),
      id_servicio: servicio.id,
      nombre_servicio: servicio.nombre,
      especialidad_requerida: servicio.especialidad_requerida,
      fecha: getTodayDateString(tz),
      hora_llegada: getCurrentTimeString(tz),
      estado: "en_espera",
      notas: notas ? notas.trim() : undefined,
    };

    const guardado = await addTurno(nuevoTurno);
    return NextResponse.json({ success: true, turno: guardado });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al solicitar turno" },
      { status: 500 }
    );
  }
}
