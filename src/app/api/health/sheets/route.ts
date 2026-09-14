import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (user.rol !== "admin") {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  
  const redactedEmail = email ? (email.length > 10 ? email.substring(0, 10) + "..." : email) : null;

  const configCheck = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: email ? `✓ Configurado (${redactedEmail})` : "✗ NO CONFIGURADO",
    GOOGLE_PRIVATE_KEY: privateKey ? `✓ Configurado (${privateKey.length} caracteres)` : "✗ NO CONFIGURADO",
    GOOGLE_SHEET_ID: sheetId ? `✓ Configurado (${sheetId})` : "✗ NO CONFIGURADO",
  };

  if (!email || !privateKey || !sheetId) {
    return NextResponse.json({
      status: "error",
      message: "Faltan variables de entorno para Google Sheets en esta instancia (revisa Vercel Settings -> Environment Variables).",
      configCheck,
    }, { status: 500 });
  }

  try {
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: email.trim(),
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId.trim() });

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
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: `Error al autenticar o consultar Google Sheets: ${err.message}`,
      configCheck,
    }, { status: 500 });
  }
}
