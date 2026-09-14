import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getHistorialCliente } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

interface RecompensaLealtad {
  id: string;
  titulo: string;
  puntosRequeridos: number;
  descripcion: string;
  categoria: string;
}

const RECOMPENSAS_DISPONIBLES: RecompensaLealtad[] = [
  {
    id: "REC-01",
    titulo: "15% de Descuento en Tratamiento Capilar",
    puntosRequeridos: 10,
    descripcion: "Aplica en hidrataciones profundas, botox capilar o cauterización.",
    categoria: "cabello",
  },
  {
    id: "REC-02",
    titulo: "Lavado y Cepillado Premium de Cortesía",
    puntosRequeridos: 20,
    descripcion: "Incluye masaje relajante de cuero cabelludo y ampolla nutritiva.",
    categoria: "cabello",
  },
  {
    id: "REC-03",
    titulo: "Manicure Rusa & Esmaltado Semipermanente Gratis",
    puntosRequeridos: 35,
    descripcion: "Tratamiento completo de uñas con limpieza profunda y color de larga duración.",
    categoria: "uñas",
  },
  {
    id: "REC-04",
    titulo: "Limpieza Facial Profunda & Mascarilla Oro",
    puntosRequeridos: 50,
    descripcion: "Sesión completa de 60 minutos con exfoliación ultrasónica y nutrición dérmica.",
    categoria: "facial",
  },
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.tipo !== "cliente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const historial = await getHistorialCliente(user.userId);
  const completadas = historial.filter((h) => h.etapa === "completada");

  // Regla: 2 puntos por cada visita completada + 1 punto por cada S/ 25 consumidos
  let puntosTotales = 0;
  const historialPuntos = completadas.map((c) => {
    const ptsVisita = 2;
    const ptsMonto = Math.floor((Number(c.precio_final) || 0) / 25);
    const pts = ptsVisita + ptsMonto;
    puntosTotales += pts;

    return {
      fecha: c.fecha,
      servicio: c.nombre_servicio,
      monto: Number(c.precio_final) || 0,
      puntosGanados: pts,
    };
  });

  // Tiers de fidelidad
  let nivel: "Bronce" | "Plata" | "Oro" = "Bronce";
  let metaSiguiente = 30;
  let porcentajeNivel = Math.min(100, Math.floor((puntosTotales / 30) * 100));

  if (puntosTotales >= 80) {
    nivel = "Oro";
    metaSiguiente = 100;
    porcentajeNivel = 100;
  } else if (puntosTotales >= 30) {
    nivel = "Plata";
    metaSiguiente = 80;
    porcentajeNivel = Math.min(100, Math.floor(((puntosTotales - 30) / (80 - 30)) * 100));
  }

  return NextResponse.json({
    cliente: {
      id: user.userId,
      nombre: user.nombre,
    },
    puntosTotales,
    puntosDisponibles: puntosTotales, // En fase siguiente se deducen canjes
    nivel,
    metaSiguiente,
    porcentajeNivel,
    recompensas: RECOMPENSAS_DISPONIBLES,
    historialPuntos,
  });
}
