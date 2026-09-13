import { NextResponse } from "next/server";
import { getAgentes } from "@/lib/google-sheets";

export async function GET() {
  const agentes = await getAgentes();
  // Sanitizar PIN antes de exponer
  const sanitized = agentes.map(({ pin, ...rest }) => rest);
  return NextResponse.json({ agentes: sanitized });
}
