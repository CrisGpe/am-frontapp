import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "S/ 0.00";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getTodayDateString(timeZone: string = "America/Lima"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

export function getCurrentTimeString(timeZone: string = "America/Lima"): string {
  try {
    const formatter = new Intl.DateTimeFormat("es-PE", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
}

/**
 * Coordenadas oficiales de Salón Élite & Spa:
 * Av. Horacio Urteaga, Jesús María, Lima, Perú.
 */
export const SALON_COORDS = {
  lat: -12.0725,
  lng: -77.0485,
  direccion: "Av. Horacio Urteaga, Jesús María, Lima",
};

/**
 * Radio de tolerancia en metros para validar presencia física dentro del local
 */
export const SALON_RADIO_METROS = 70;

/**
 * Calcula la distancia ortodrómica en metros entre dos puntos geográficos (Fórmula de Haversine)
 */
export function calcularDistanciaMetros(
  lat1: number,
  lon1: number,
  lat2: number = SALON_COORDS.lat,
  lon2: number = SALON_COORDS.lng
): number {
  const R = 6371e3; // Radio terrestre en metros
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calcula la diferencia en minutos entre dos cadenas de hora en formato HH:mm
 */
export function calcularDiferenciaMinutos(horaInicio: string, horaFin: string): number {
  try {
    const [h1, m1] = (horaInicio || "00:00").split(":").map(Number);
    const [h2, m2] = (horaFin || "00:00").split(":").map(Number);
    const minInicio = h1 * 60 + m1;
    const minFin = h2 * 60 + m2;
    // Manejo de cruce de medianoche si aplica
    return (minFin - minInicio + 1440) % 1440;
  } catch {
    return 0;
  }
}

/**
 * Evalúa si una atención finalizó de forma anómala o prematura.
 * Regla de negocio: < 50% de la duración nominal del servicio (con piso mínimo de 15 min,
 * salvo servicios ultra rápidos de 15 min o menos donde el piso es el 50%).
 */
export function evaluarFinalizacionTemprana(
  horaInicio: string,
  horaFin: string,
  duracionEstimadaMin: number = 45
): { esTemprana: boolean; duracionReal: number; umbralMin: number } {
  const duracionReal = calcularDiferenciaMinutos(horaInicio, horaFin);
  const umbralMin =
    duracionEstimadaMin <= 15
      ? Math.max(5, Math.round(duracionEstimadaMin * 0.5))
      : Math.max(15, Math.round(duracionEstimadaMin * 0.5));

  return {
    esTemprana: duracionReal < umbralMin,
    duracionReal,
    umbralMin,
  };
}

