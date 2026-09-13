import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ejecutarCierreDeDia } from "@/lib/google-sheets";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.rol !== "admin") {
    return NextResponse.json(
      { error: "Acceso denegado: solo administradores pueden ejecutar el cierre de día" },
      { status: 403 }
    );
  }

  try {
    const resumen = await ejecutarCierreDeDia();
    return NextResponse.json({
      success: true,
      mensaje: "Cierre de día ejecutado exitosamente. Los datos de Borrador migraron a OATC y Asistencia.",
      resumen,
    });
  } catch (error: any) {
    console.error("Error ejecutando cierre de día:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el cierre de día" },
      { status: 500 }
    );
  }
}
