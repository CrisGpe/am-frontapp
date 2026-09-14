import { Agente, Servicio, BorradorEntry, AsistenciaRecord, CitaRecord } from "./types";

export interface ScoreAgente {
  agente: Agente;
  elegible: boolean;
  motivoNoElegible?: string;
  enAtencionActiva: boolean;
  totalAtencionesHoy: number;
  ultimaHoraFin?: string;
  prioridadScore: number; // Mayor puntaje = mayor prioridad para recibir el turno
}

/**
 * Algoritmo de asignación inteligente de turnos para clientes no fidelizados.
 * Prioriza:
 * 1. Especialidad requerida por el servicio.
 * 2. Disponibilidad explícita del colaborador (`disponible_turnos`).
 * 3. Asistencia confirmada hoy (check-in sin check-out).
 * 4. Que no esté actualmente ocupado en una atención activa.
 * 5. Que no tenga una cita programada en los próximos 45 minutos.
 * 6. Mayor tiempo de espera en cola (menor número de atenciones hoy y mayor tiempo desde su última atención).
 */
export function evaluarAgentesParaTurno(
  servicio: Servicio,
  agentes: Agente[],
  borradorHoy: BorradorEntry[],
  asistenciasHoy?: AsistenciaRecord[],
  citasHoy?: CitaRecord[]
): ScoreAgente[] {
  const especialidad = (servicio?.especialidad_requerida || "").trim().toLowerCase();

  return agentes.map((agente) => {
    // Validar estado activo
    if (!agente?.activo) {
      return {
        agente,
        elegible: false,
        motivoNoElegible: "Colaborador inactivo en el sistema",
        enAtencionActiva: false,
        totalAtencionesHoy: 0,
        prioridadScore: -99999,
      };
    }

    // Validar especialidad
    const especialidades = (agente.especialidades || []).map((e) => e.trim().toLowerCase());
    const tieneEspecialidad = especialidad === "" || especialidades.includes(especialidad);

    if (!tieneEspecialidad) {
      return {
        agente,
        elegible: false,
        motivoNoElegible: `No cuenta con la especialidad requerida (${especialidad})`,
        enAtencionActiva: false,
        totalAtencionesHoy: 0,
        prioridadScore: -99999,
      };
    }

    // Validar toggle de disponibilidad manual
    if (!agente.disponible_turnos) {
      return {
        agente,
        elegible: false,
        motivoNoElegible: "No disponible para turnos actualmente",
        enAtencionActiva: false,
        totalAtencionesHoy: 0,
        prioridadScore: -99999,
      };
    }

    // Validar asistencia si hay registros del día
    if (asistenciasHoy && asistenciasHoy.length > 0) {
      const registroAsistencia = asistenciasHoy.find((a) => a.id_agente === agente.id);
      if (!registroAsistencia || !registroAsistencia.hora_checkin) {
        return {
          agente,
          elegible: false,
          motivoNoElegible: "No ha registrado entrada hoy",
          enAtencionActiva: false,
          totalAtencionesHoy: 0,
          prioridadScore: -99999,
        };
      }
      if (registroAsistencia.hora_checkout) {
        return {
          agente,
          elegible: false,
          motivoNoElegible: "Ya registró salida hoy",
          enAtencionActiva: false,
          totalAtencionesHoy: 0,
          prioridadScore: -99999,
        };
      }
    }

    // 2. Evaluar carga actual en el Borrador
    const atencionesDelAgente = borradorHoy.filter((b) => b.id_agente === agente.id);
    const enAtencionActiva = atencionesDelAgente.some(
      (b) => b.etapa === "asesoria" || b.etapa === "atencion" || b.etapa === "fin_atencion" || b.etapa === "cobranza"
    );

    // Calcular última hora de fin
    const terminadas = atencionesDelAgente
      .filter((b) => b.etapa === "completada" || Boolean(b.hora_fin))
      .sort((a, b) => (a.hora_fin || "").localeCompare(b.hora_fin || ""));
    const ultimaHoraFin = terminadas.length > 0 ? terminadas[terminadas.length - 1].hora_fin : undefined;

    // 3. Evaluar citas próximas
    let tieneCitaProxima = false;
    if (citasHoy && citasHoy.length > 0) {
      const ahora = new Date();
      const minActuales = ahora.getHours() * 60 + ahora.getMinutes();
      tieneCitaProxima = citasHoy.some((c) => {
        if (c.id_agente !== agente.id || c.estado !== "confirmada") return false;
        const [h, m] = (c.hora || "00:00").split(":").map(Number);
        const minCita = h * 60 + m;
        // Cita programada dentro de los próximos 45 minutos
        return minCita >= minActuales && minCita - minActuales <= 45;
      });
    }

    // 4. Puntuación de prioridad
    let score = 1000 - atencionesDelAgente.length * 100;
    if (enAtencionActiva) {
      score -= 500;
    }
    if (tieneCitaProxima) {
      score -= 400; // Fuerte penalización si tiene cita agendada próxima
    }

    // Bonificación por tiempo de espera desde la última atención terminada
    if (ultimaHoraFin) {
      const [uH, uM] = ultimaHoraFin.split(":").map(Number);
      const ahora = new Date();
      const minDesdeFin = (ahora.getHours() * 60 + ahora.getMinutes()) - (uH * 60 + uM);
      if (minDesdeFin > 0) {
        // Hasta +100 puntos por espera prolongada
        score += Math.min(100, Math.floor(minDesdeFin / 2));
      }
    }

    return {
      agente,
      elegible: true,
      enAtencionActiva,
      totalAtencionesHoy: atencionesDelAgente.length,
      ultimaHoraFin,
      prioridadScore: score,
    };
  }).sort((a, b) => b.prioridadScore - a.prioridadScore);
}

/**
 * Selecciona al mejor colaborador disponible para el servicio.
 */
export function seleccionarMejorAgenteParaTurno(
  servicio: Servicio,
  agentes: Agente[],
  borradorHoy: BorradorEntry[],
  asistenciasHoy?: AsistenciaRecord[],
  citasHoy?: CitaRecord[]
): ScoreAgente | null {
  const evaluaciones = evaluarAgentesParaTurno(
    servicio,
    agentes,
    borradorHoy,
    asistenciasHoy,
    citasHoy
  );
  const elegiblesLibres = evaluaciones.filter(
    (e) => e.elegible && !e.enAtencionActiva
  );

  if (elegiblesLibres.length > 0) {
    return elegiblesLibres[0];
  }

  // Si todos los elegibles están ocupados, tomar al elegible con mayor score
  const elegibles = evaluaciones.filter((e) => e.elegible);
  return elegibles.length > 0 ? elegibles[0] : null;
}
