import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");

const env = {};
envContent.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[k] = v;
  }
});

async function testConnection() {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const spreadsheetId = env.GOOGLE_SHEET_ID;

  console.log("Conectando con Service Account:", email);
  console.log("Sheet ID:", spreadsheetId);

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    console.log("✓ Conexión EXITOSA!");
    console.log("Título del Documento:", meta.data.properties.title);
    console.log("Pestañas encontradas:");
    meta.data.sheets.forEach((s) => {
      console.log(`- ${s.properties.title} (ID: ${s.properties.sheetId})`);
    });
  } catch (err) {
    console.error("✗ Error conectando:", err.message);
    if (err.response && err.response.data) {
      console.error("Detalle:", JSON.stringify(err.response.data, null, 2));
    }
  }
}

testConnection();
