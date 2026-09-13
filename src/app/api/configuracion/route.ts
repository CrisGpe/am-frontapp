import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSalonConfig, updateSalonConfig } from "@/lib/google-sheets";

export async function GET() {
  const config = await getSalonConfig();
  return NextResponse.json({ config });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const updates = await req.json();
    const configActualizada = await updateSalonConfig(updates);
    return NextResponse.json({ success: true, config: configActualizada });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
