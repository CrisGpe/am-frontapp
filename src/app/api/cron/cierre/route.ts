import { NextRequest, NextResponse } from "next/server";
import { ejecutarCierreDeDia } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const resumen = await ejecutarCierreDeDia();
    console.log("[CRON] Cierre de día automático ejecutado:", resumen);
    return NextResponse.json({
      success: true,
      tipo: "cron_automatico",
      resumen,
    });
  } catch (error: any) {
    console.error("[CRON Error] Falló el cierre de día:", error);
    return NextResponse.json(
      { error: "Error en ejecución del CRON de cierre" },
      { status: 500 }
    );
  }
}
