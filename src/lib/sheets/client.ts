import { google } from "googleapis";

export interface SheetsClientContext {
  sheets: ReturnType<typeof google.sheets>;
  sheetId: string;
}

export function getSheetsClient(): SheetsClientContext | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    return null;
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

    return {
      sheets: google.sheets({ version: "v4", auth }),
      sheetId: sheetId.trim(),
    };
  } catch (err) {
    console.error("Error al inicializar cliente de Google Sheets:", err);
    return null;
  }
}
