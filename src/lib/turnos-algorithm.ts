import { Agente, Servicio, BorradorEntry, TurnoEspera } from "./types";

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
 * 3. Que no esté actualmente ocupado en una atención ('asesoria' o 'atencion').
 * 4. Mayor tiempo de espera en cola (menor número de atenciones hoy o última atención terminada más temprano).
 */
export function evaluarAgentesParaTurno(
  servicio: Servicio,
  agentes: Agente[],
  borradorHoy: BorradorEntry[]
): ScoreAgente[] {
  const especialidad = servicio.especialidad_requerida.trim().toLowerCase();

  return agentes.map((agente) => {
    // 1. Validar especialidad
    const tieneEspecialidad = agente.especialidades.some(
      (esp) => esp.trim().toLowerCase() === especialidad
    );

    if (!agente.activo) {
      return {
        agente,
        elegible: false,
        motivoNoElegible: "Colaborador inactivo en el sistema",
        enAtencionActiva: false,
        totalAtencionesHoy: 0,
        prioridadScore: -1,
      };
    }

    if (!tieneEspecialidad) {
      return {
        agente,
        elegible: false,
        motivoNoElegible: `No cuenta con la especialidad requerida (${especialidad})`,
        enAtencionActiva: false,
        totalAtencionesHoy: 0,
        prioridadScore: -1,
      };
    }

    if (!agente.disponible_turnos) {
      return {
        agente,
        elegible: false,
        motivoNoElegible: "No disponible para turnos actualmente",
        enAtencionActiva: false,
        totalAtencionesHoy: 0,
        prioridadScore: -1,
      };
    }

    // 2. Evaluar carga actual en el Borrador
    const atencionesDelAgente = borradorHoy.filter((b) => b.id_agente === agente.id);
    const enAtencionActiva = atencionesDelAgente.some(
      (b) => b.etapa === "asesoria" || b.etapa === "atencion"
    );

    // Calcular última hora de fin
    const terminadas = atencionesDelAgente.filter(
      (b) => b.etapa === "fin_atencion" || b.etapa === "cobranza" || b.etapa === "completada"
    );
    const ultimaHoraFin = terminadas.length > 0 ? terminadas[terminadas.length - 1].hora_fin : undefined;

    // 3. Puntuación de prioridad
    // Si está ocupado: penalización fuerte (-500)
    // Menos atenciones hoy = mayor puntaje (+100 por cada atención menos)
    let score = 1000 - atencionesDelAgente.length * 100;
    if (enAtencionActiva) {
      score -= 500;
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
  borradorHoy: BorradorEntry[]
): ScoreAgente | null {
  const evaluaciones = evaluarAgentesParaTurno(servicio, agentes, borradorHoy);
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
