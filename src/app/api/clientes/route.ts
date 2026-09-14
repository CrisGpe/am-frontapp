import { NextRequest, NextResponse } from "next/server";
import { getClientes, addCliente } from "@/lib/google-sheets";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const clientes = await getClientes();
  // Sanitizar PIN para proteger datos sensibles
  const sanitized = clientes.map(({ pin, ...rest }) => rest);
  return NextResponse.json({ clientes: sanitized });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, pin, telefono, email, notas } = body;

    if (!nombre || !pin) {
      return NextResponse.json({ error: "Nombre y PIN requeridos" }, { status: 400 });
    }

    if (!/^\d{4}$/.test(pin.trim())) {
      return NextResponse.json({ error: "PIN inválido" }, { status: 400 });
    }

    const nuevoCliente = await addCliente({
      id: `CL-${Date.now().toString(36)}`,
      nombre: nombre.trim(),
      pin: pin.trim(),
      telefono: telefono?.trim(),
      email: email?.trim(),
      notas: notas?.trim(),
      activo: true,
      fecha_registro: new Date().toISOString()
    });

    return NextResponse.json({ success: true, cliente: { ...nuevoCliente, pin: undefined } });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
