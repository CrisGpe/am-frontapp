import { Agente, CitaRecord, Servicio } from "./types";

export interface TimeSlot {
  hora: string; // "10:00"
  disponible: boolean;
  motivoOcupado?: string;
}

export function obtenerHorarioDia(agente: Agente, fechaStr: string): string | null {
  // fechaStr: YYYY-MM-DD
  const [year, month, day] = fechaStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const diaSemana = date.getDay(); // 0 = Domingo, 1 = Lunes, ...

  switch (diaSemana) {
    case 1:
      return agente.horario_lun || null;
    case 2:
      return agente.horario_mar || null;
    case 3:
      return agente.horario_mie || null;
    case 4:
      return agente.horario_jue || null;
    case 5:
      return agente.horario_vie || null;
    case 6:
      return agente.horario_sab || null;
    case 0:
      return agente.horario_dom || null;
    default:
      return null;
  }
}

export function calcularSlotsDisponibles(
  agente: Agente,
  servicio: Servicio,
  fechaStr: string,
  citasExistentes: CitaRecord[]
): TimeSlot[] {
  const rango = obtenerHorarioDia(agente, fechaStr);
  if (!rango || !rango.includes("-")) {
    return [];
  }

  const [inicioStr, finStr] = rango.split("-").map((s) => s.trim());
  const [inicioH, inicioM] = inicioStr.split(":").map(Number);
  const [finH, finM] = finStr.split(":").map(Number);

  const inicioMinutos = inicioH * 60 + inicioM;
  const finMinutos = finH * 60 + finM;

  const duracion = Math.max(30, servicio.duracion_min || 30);
  const intervalo = 30; // Granularidad de inicio de citas cada 30 minutos

  const slots: TimeSlot[] = [];

  // Filtrar citas del agente en esa fecha
  const citasDelDia = citasExistentes.filter(
    (c) =>
      c.id_agente === agente.id &&
      c.fecha === fechaStr &&
      (c.estado === "confirmada" || c.estado === "pendiente")
  );

  for (let min = inicioMinutos; min + duracion <= finMinutos; min += intervalo) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const horaStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    // Verificar colisión con citas
    const ocupadoPorCita = citasDelDia.some((c) => {
      const [cH, cM] = c.hora.split(":").map(Number);
      const citaMin = cH * 60 + cM;
      // Asumimos un bloqueo mínimo de 45 min por cita existente si no se sabe la duración exacta
      return Math.abs(citaMin - min) < duracion;
    });

    slots.push({
      hora: horaStr,
      disponible: !ocupadoPorCita,
      motivoOcupado: ocupadoPorCita ? "Horario reservado" : undefined,
    });
  }

  return slots;
}
