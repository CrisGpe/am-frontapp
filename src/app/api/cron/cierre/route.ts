import { NextResponse } from "next/server";
import { ejecutarCierreDeDia } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
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
