import { NextRequest, NextResponse } from "next/server";
import {
  getBorrador,
  addBorradorEntry,
  updateBorradorEntry,
  descontarInventarioPorAtencion,
  getServicios,
  updateAgenteDisponibilidad,
} from "@/lib/google-sheets";
import { getCurrentUser } from "@/lib/auth";
import { BorradorEntry } from "@/lib/types";
import { getCurrentTimeString, evaluarFinalizacionTemprana } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const data = await getBorrador();
  return NextResponse.json({ borrador: data });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body: BorradorEntry = await req.json();
    const saved = await addBorradorEntry(body);
    return NextResponse.json({ success: true, entry: saved });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar en el Borrador" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { id_oatc, updates } = await req.json();
    if (!id_oatc) {
      return NextResponse.json({ error: "id_oatc es requerido" }, { status: 400 });
    }

    // Regla de Seguridad: Solo Admin/Caja puede marcar como completada/cobrada
    if (
      user.rol !== "admin" &&
      (updates.etapa === "completada" || updates.etapa === "cobranza")
    ) {
      return NextResponse.json(
        {
          error:
            "Acceso denegado: El cobro y cierre de órdenes solo puede ser registrado por Caja o Administración",
        },
        { status: 403 }
      );
    }

    // Regla de Negocio: Para completar una orden se requiere el correlativo del comprobante
    if (updates.etapa === "completada" && !updates.comprobante_externo?.trim()) {
      return NextResponse.json(
        {
          error:
            "Debe ingresar el correlativo del comprobante de pago (boleta/factura) para completar y cobrar la orden",
        },
        { status: 400 }
      );
    }

    // Regla Antifraude: Control de Finalización Temprana y Protección de Cola de Turnos
    if (updates.etapa === "fin_atencion") {
      const borradorActual = await getBorrador();
      const existingEntry = borradorActual.find((e) => e.id_oatc === id_oatc);

      if (existingEntry) {
        const horaFin = updates.hora_fin || getCurrentTimeString("America/Lima");
        updates.hora_fin = horaFin;

        // Obtener la duración estimada del servicio para contrastar
        const servicios = await getServicios();
        const servicio = servicios.find((s) => s.id === existingEntry.id_servicio);
        const duracionEstimadaMin = servicio?.duracion_min || 45;

        const evaluacion = evaluarFinalizacionTemprana(
          existingEntry.hora_inicio,
          horaFin,
          duracionEstimadaMin
        );

        if (evaluacion.esTemprana) {
          const motivo = (updates.motivo_finalizacion_temprana || "").trim();
          if (!motivo) {
            return NextResponse.json(
              {
                error: `Finalización antes del tiempo mínimo (${evaluacion.duracionReal} min transcurridos vs umbral de ${evaluacion.umbralMin} min). Debe ingresar una justificación válida para continuar.`,
                requiereJustificacion: true,
                duracionReal: evaluacion.duracionReal,
                umbralMin: evaluacion.umbralMin,
                duracionEstimada: duracionEstimadaMin,
              },
              { status: 400 }
            );
          }

          // Registrar banderas de auditoría en la orden
          updates.alerta_tiempo_anomalo = true;
          updates.duracion_real_minutos = evaluacion.duracionReal;
          updates.duracion_estimada_minutos = duracionEstimadaMin;
          updates.motivo_finalizacion_temprana = motivo;

          // ACCIÓN ANTIFRAUDE INMEDIATA: Pausar recepción de turnos del colaborador
          try {
            await updateAgenteDisponibilidad(existingEntry.id_agente, false);
          } catch (pauseErr) {
            console.error("Error al pausar agente tras finalización temprana:", pauseErr);
          }
        } else {
          updates.alerta_tiempo_anomalo = false;
          updates.duracion_real_minutos = evaluacion.duracionReal;
          updates.duracion_estimada_minutos = duracionEstimadaMin;
        }
      }
    }

    const updated = await updateBorradorEntry(id_oatc, updates);
    if (!updated) {
      return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });
    }

    // Descontar inventario automáticamente si la atención fue completada
    if (updates.etapa === "completada") {
      try {
        await descontarInventarioPorAtencion(
          updates.productos_vendidos,
          updates.insumos_usados
        );
      } catch (stockErr) {
        console.error("Error al descontar inventario:", stockErr);
      }
    }

    return NextResponse.json({ success: true, entry: updated });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar entrada de Borrador" },
      { status: 500 }
    );
  }
}
