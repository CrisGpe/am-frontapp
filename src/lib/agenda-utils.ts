import { Agente, CitaRecord, Servicio } from "./types";
import { getTodayDateString, getCurrentTimeString } from "./utils";

export interface TimeSlot {
  hora: string; // "10:00"
  disponible: boolean;
  motivoOcupado?: string;
}

export function obtenerHorarioDia(agente: Agente, fechaStr: string): string | null {
  if (!agente || !agente.activo) return null;

  // fechaStr: YYYY-MM-DD - usar mediodía para evitar drift de zona horaria
  const [year, month, day] = fechaStr.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
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
  citasExistentes: CitaRecord[],
  serviciosDisponibles?: Servicio[]
): TimeSlot[] {
  if (!agente || !agente.activo) {
    return [];
  }

  const rango = obtenerHorarioDia(agente, fechaStr);
  if (!rango || !rango.includes("-")) {
    return [];
  }

  const [inicioStr, finStr] = rango.split("-").map((s) => s.trim());
  const [inicioH, inicioM] = inicioStr.split(":").map(Number);
  const [finH, finM] = finStr.split(":").map(Number);

  const inicioMinutos = inicioH * 60 + inicioM;
  const finMinutos = finH * 60 + finM;

  const duracion = Math.max(30, servicio?.duracion_min || 30);
  const intervalo = 30; // Granularidad de inicio de citas cada 30 minutos

  const slots: TimeSlot[] = [];

  // Filtrar citas del agente en esa fecha
  const citasDelDia = citasExistentes.filter(
    (c) =>
      c.id_agente === agente.id &&
      c.fecha === fechaStr &&
      (c.estado === "confirmada" || c.estado === "pendiente")
  );

  // Mapa de duraciones de servicios existentes para chequear solapamiento exacto
  const duracionMap = new Map<string, number>();
  if (serviciosDisponibles) {
    serviciosDisponibles.forEach((s) => duracionMap.set(s.id, s.duracion_min || 45));
  }

  // Verificación de fecha/hora pasada en Lima
  const hoyLima = getTodayDateString("America/Lima");
  const horaActualLima = getCurrentTimeString("America/Lima");
  const [hActual, mActual] = horaActualLima.split(":").map(Number);
  const minActualesLima = hActual * 60 + mActual;
  const esHoy = fechaStr === hoyLima;
  const esPasado = fechaStr < hoyLima;

  for (let min = inicioMinutos; min + duracion <= finMinutos; min += intervalo) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const horaStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    // 1. Chequeo de tiempo pasado
    if (esPasado) {
      slots.push({
        hora: horaStr,
        disponible: false,
        motivoOcupado: "Fecha pasada",
      });
      continue;
    }

    if (esHoy && min <= minActualesLima) {
      slots.push({
        hora: horaStr,
        disponible: false,
        motivoOcupado: "Horario pasado",
      });
      continue;
    }

    // 2. Verificar colisión con citas mediante solapamiento de intervalos reales
    // Intervalo A: [min, min + duracion]
    // Intervalo B: [citaInicio, citaInicio + duracionCita]
    const slotInicio = min;
    const slotFin = min + duracion;

    const ocupadoPorCita = citasDelDia.some((c) => {
      const [cH, cM] = (c.hora || "00:00").split(":").map(Number);
      const citaInicio = cH * 60 + cM;
      const duracionCita = duracionMap.get(c.id_servicio) || 45;
      const citaFin = citaInicio + duracionCita;

      // Solapamiento: slotInicio < citaFin && slotFin > citaInicio
      return slotInicio < citaFin && slotFin > citaInicio;
    });

    slots.push({
      hora: horaStr,
      disponible: !ocupadoPorCita,
      motivoOcupado: ocupadoPorCita ? "Horario reservado" : undefined,
    });
  }

  return slots;
}
