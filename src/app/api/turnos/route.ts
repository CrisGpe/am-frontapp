import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getTurnos,
  addTurno,
  getServicios,
  getAgentes,
  getBorrador,
} from "@/lib/google-sheets";
import { evaluarAgentesParaTurno } from "@/lib/turnos-algorithm";
import { getCurrentTimeString } from "@/lib/utils";
import { TurnoEspera } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [turnos, servicios, agentes, borrador] = await Promise.all([
    getTurnos(),
    getServicios(),
    getAgentes(),
    getBorrador(),
  ]);

  const turnosEnEspera = turnos.filter((t) => t.estado === "en_espera");

  // Para cada turno en espera, enriquecer con la sugerencia del algoritmo
  const turnosConSugerencia = turnosEnEspera.map((turno) => {
    const servicio = servicios.find((s) => s.id === turno.id_servicio);
    if (!servicio) return { turno, sugerencia: null };

    const evaluaciones = evaluarAgentesParaTurno(servicio, agentes, borrador);
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

  return NextResponse.json({ turnos: turnosConSugerencia });
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

    const nuevoTurno: TurnoEspera = {
      id: `TRN-${Math.floor(100 + Math.random() * 900)}`,
      nombre_consumidor: nombre_consumidor.trim(),
      id_servicio: servicio.id,
      nombre_servicio: servicio.nombre,
      especialidad_requerida: servicio.especialidad_requerida,
      hora_llegada: getCurrentTimeString(),
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
