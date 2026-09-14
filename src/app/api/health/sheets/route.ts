import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSheetsClient } from "@/lib/sheets/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  const redactedEmail = email
    ? email.length > 10
      ? email.substring(0, 10) + "..."
      : email
    : null;

  const configCheck = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: email
      ? `✓ Configurado (${redactedEmail})`
      : "✗ NO CONFIGURADO",
    GOOGLE_PRIVATE_KEY: privateKey
      ? `✓ Configurado (${privateKey.length} caracteres)`
      : "✗ NO CONFIGURADO",
    GOOGLE_SHEET_ID: sheetId ? `✓ Configurado (${sheetId})` : "✗ NO CONFIGURADO",
  };

  if (!email || !privateKey || !sheetId) {
    if (user.rol === "admin") {
      return NextResponse.json(
        {
          status: "error",
          connected: false,
          message:
            "Faltan variables de entorno para Google Sheets en esta instancia.",
          configCheck,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { status: "error", connected: false },
      { status: 500 }
    );
  }

  try {
    const client = getSheetsClient();
    if (!client) {
      return NextResponse.json(
        { status: "error", connected: false },
        { status: 500 }
      );
    }

    const meta = await client.sheets.spreadsheets.get({
      spreadsheetId: client.sheetId,
    });

    // Admins reciben diagnóstico completo con nombres de pestañas y estado de credenciales
    if (user.rol === "admin") {
      const pestanas = (meta.data.sheets || []).map((s) => ({
        nombre: s.properties?.title,
        id: s.properties?.sheetId,
      }));

      return NextResponse.json({
        status: "ok",
        connected: true,
        spreadsheetTitle: meta.data.properties?.title,
        pestanas,
        configCheck,
      });
    }

    // Colaboradores (agentes) reciben confirmación de conexión limpia sin exposición de variables
    return NextResponse.json({
      status: "ok",
      connected: true,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (user.rol === "admin") {
      return NextResponse.json(
        {
          status: "error",
          connected: false,
          message: `Error al consultar Google Sheets: ${errorMsg}`,
          configCheck,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { status: "error", connected: false },
      { status: 500 }
    );
  }
}
