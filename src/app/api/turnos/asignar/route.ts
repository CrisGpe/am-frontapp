import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getTurnos,
  updateTurno,
  getServicios,
  getAgentes,
  getBorrador,
  addBorradorEntry,
} from "@/lib/google-sheets";
import { seleccionarMejorAgenteParaTurno } from "@/lib/turnos-algorithm";
import { getTodayDateString, getCurrentTimeString } from "@/lib/utils";
import { BorradorEntry } from "@/lib/types";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id_turno, id_agente_manual } = await req.json();

    if (!id_turno) {
      return NextResponse.json({ error: "id_turno es requerido" }, { status: 400 });
    }

    const [turnos, servicios, agentes, borrador] = await Promise.all([
      getTurnos(),
      getServicios(),
      getAgentes(),
      getBorrador(),
    ]);

    const turno = turnos.find((t) => t.id === id_turno && t.estado === "en_espera");
    if (!turno) {
      return NextResponse.json({ error: "Turno no encontrado o ya atendido" }, { status: 404 });
    }

    const servicio = servicios.find((s) => s.id === turno.id_servicio);
    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    // Determinar agente: o especificado manualmente o seleccionado por el algoritmo
    let agenteSeleccionado: any = null;

    if (id_agente_manual) {
      agenteSeleccionado = agentes.find((a) => a.id === id_agente_manual);
    } else {
      const mejorScore = seleccionarMejorAgenteParaTurno(servicio, agentes, borrador);
      if (!mejorScore) {
        return NextResponse.json(
          { error: `No hay colaboradores disponibles con la especialidad: ${servicio.especialidad_requerida}` },
          { status: 400 }
        );
      }
      agenteSeleccionado = mejorScore.agente;
    }

    if (!agenteSeleccionado) {
      return NextResponse.json({ error: "Colaborador no disponible" }, { status: 400 });
    }

    const hoy = getTodayDateString();
    const hora = getCurrentTimeString();
    const randomCorr = Math.floor(100 + Math.random() * 900);
    const idOatc = `OATC-${hoy.replace(/-/g, "")}-${randomCorr}`;

    // 1. Crear OATC en el Borrador
    const nuevaOATC: BorradorEntry = {
      id_oatc: idOatc,
      fecha: hoy,
      hora_inicio: hora,
      tipo_consumidor: "turno",
      nombre_consumidor: `${turno.nombre_consumidor} (Turno)`,
      id_agente: agenteSeleccionado.id,
      nombre_agente: agenteSeleccionado.nombre,
      id_servicio: servicio.id,
      nombre_servicio: servicio.nombre,
      etapa: "asesoria",
      precio_final: servicio.precio_base,
      correlativo_sistema: `OATC-${randomCorr}`,
      notas: turno.notas || "Turno asignado automáticamente por algoritmo de cola",
    };

    await addBorradorEntry(nuevaOATC);

    // 2. Marcar turno como atendido
    await updateTurno(turno.id, { estado: "atendido" });

    return NextResponse.json({
      success: true,
      oatc: nuevaOATC,
      agenteAsignado: {
        id: agenteSeleccionado.id,
        nombre: agenteSeleccionado.nombre,
      },
    });
  } catch (error: any) {
    console.error("Error asignando turno:", error);
    return NextResponse.json(
      { error: "Error al asignar turno" },
      { status: 500 }
    );
  }
}
