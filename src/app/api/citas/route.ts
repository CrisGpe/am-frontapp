import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getCitas,
  addCita,
  updateCita,
  getServicios,
  getAgentes,
  getClientes,
} from "@/lib/google-sheets";
import { CitaRecord } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [todasCitas, servicios, agentes, clientes] = await Promise.all([
    getCitas(user.tipo === "cliente" ? user.userId : undefined),
    getServicios(),
    getAgentes(),
    getClientes(),
  ]);

  const citasEnriquecidas = todasCitas.map((cita) => {
    const servicio = servicios.find((s) => s.id === cita.id_servicio);
    const agente = agentes.find((a) => a.id === cita.id_agente);
    const cliente = clientes.find((c) => c.id === cita.id_cliente);

    return {
      ...cita,
      nombre_servicio: servicio?.nombre || "Servicio",
      precio_base: servicio?.precio_base || 0,
      duracion_min: servicio?.duracion_min || 30,
      nombre_agente: agente?.nombre || "Colaborador",
      nombre_cliente: cliente?.nombre || "Cliente",
    };
  });

  return NextResponse.json({ citas: citasEnriquecidas });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id_agente, id_servicio, fecha, hora, notas } = body;

    if (!id_agente || !id_servicio || !fecha || !hora) {
      return NextResponse.json(
        { error: "id_agente, id_servicio, fecha y hora son requeridos" },
        { status: 400 }
      );
    }

    const nuevaCita: CitaRecord = {
      id: `CT-${Math.floor(100 + Math.random() * 900)}`,
      id_cliente: user.tipo === "cliente" ? user.userId : body.id_cliente || "CL-001",
      id_agente,
      id_servicio,
      fecha,
      hora,
      estado: "confirmada",
      creada_en: new Date().toISOString(),
      notas: notas ? notas.trim() : undefined,
    };

    const guardada = await addCita(nuevaCita);
    return NextResponse.json({ success: true, cita: guardada });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al registrar cita" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id_cita, estado } = await req.json();
    if (!id_cita || !estado) {
      return NextResponse.json(
        { error: "id_cita y estado son requeridos" },
        { status: 400 }
      );
    }

    const actualizada = await updateCita(id_cita, { estado });
    if (!actualizada) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, cita: actualizada });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar estado de la cita" },
      { status: 500 }
    );
  }
}
