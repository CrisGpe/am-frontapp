import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getHistorialCliente } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.tipo !== "cliente") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const historial = await getHistorialCliente(user.userId);
  return NextResponse.json({ historial });
}
