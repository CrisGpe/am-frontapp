import { NextResponse } from "next/server";
import { getClientes } from "@/lib/google-sheets";

export async function GET() {
  const clientes = await getClientes();
  // Sanitizar PIN para proteger datos sensibles
  const sanitized = clientes.map(({ pin, ...rest }) => rest);
  return NextResponse.json({ clientes: sanitized });
}
