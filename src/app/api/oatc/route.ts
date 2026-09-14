import { NextResponse } from "next/server";
import { getTodosOATC } from "@/lib/google-sheets";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.tipo !== "agente" && user.rol !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const data = await getTodosOATC();
  return NextResponse.json({ oatc: data });
}
