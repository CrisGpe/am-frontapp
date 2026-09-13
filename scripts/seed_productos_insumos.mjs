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

async function seedProductosEInsumos() {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const spreadsheetId = env.GOOGLE_SHEET_ID;

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  console.log("Poblando Productos e Insumos en Google Sheets...");

  // 1. PRODUCTOS
  // Headers: id, nombre, categoria, marca, precio_venta, stock, activo
  const productosData = [
    ["PR-001", "Shampoo Nutritivo Argán 250ml", "cuidado_capilar", "Moroccanoil", "580", "18", "TRUE"],
    ["PR-002", "Mascarilla Reparación Intensa 200ml", "tratamiento", "Kérastase", "890", "12", "TRUE"],
    ["PR-003", "Aceite Serum Sellador de Puntas 100ml", "styling", "Olaplex No. 7", "640", "24", "TRUE"],
    ["PR-004", "Aceite de Cutículas Vitamina E 15ml", "uñas", "OPI ProSpa", "260", "30", "TRUE"],
    ["PR-005", "Serum Facial Ácido Hialurónico 30ml", "facial", "Dermalogica", "950", "8", "TRUE"],
    ["PR-006", "Acondicionador Reconstructor 250ml", "cuidado_capilar", "Moroccanoil", "560", "15", "TRUE"],
    ["PR-007", "Spray Protector Térmico 150ml", "styling", "GHD", "480", "20", "TRUE"],
    ["PR-008", "Esmalte Gel Larga Duración Nude", "uñas", "OPI GelColor", "310", "40", "TRUE"],
    ["PR-009", "Crema Exfoliante Facial Botánica 100ml", "facial", "Aveda", "620", "10", "TRUE"],
    ["PR-010", "Cera Moldeadora Efecto Mate 85ml", "styling", "American Crew", "380", "25", "TRUE"]
  ];

  // Limpiar y escribir Productos
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "Productos!A2:G",
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Productos!A2:G",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: productosData },
  });
  console.log(`✓ ${productosData.length} Productos insertados exitosamente.`);

  // 2. INSUMOS
  // Headers: id, nombre, categoria, unidad_medida, stock, costo_unitario, activo
  const insumosData = [
    ["IN-001", "Crema Oxidante 20 Vol", "quimico", "ml", "5000", "0.15", "TRUE"],
    ["IN-002", "Crema Oxidante 30 Vol", "quimico", "ml", "4500", "0.16", "TRUE"],
    ["IN-003", "Polvo Decolorante Blonde Plus", "quimico", "gr", "3000", "0.45", "TRUE"],
    ["IN-004", "Guantes de Nitrilo Negro Talla M", "desechable", "par", "200", "4.50", "TRUE"],
    ["IN-005", "Papel de Mechas Térmico", "herramienta", "hoja", "800", "1.20", "TRUE"],
    ["IN-006", "Toallas Desechables Biodegradables", "desechable", "unidad", "500", "2.80", "TRUE"],
    ["IN-007", "Cera Depilatoria Miel de Abeja", "quimico", "gr", "2500", "0.35", "TRUE"],
    ["IN-008", "Algodón Hidrófilo en Discos", "desechable", "paquete", "60", "35.00", "TRUE"],
    ["IN-009", "Removedor de Cutícula Suave", "quimico", "ml", "1200", "0.22", "TRUE"],
    ["IN-010", "Alcohol Isopropílico Sanitizante", "desinfectante", "ml", "8000", "0.08", "TRUE"]
  ];

  // Limpiar y escribir Insumos
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "Insumos!A2:G",
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Insumos!A2:G",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: insumosData },
  });
  console.log(`✓ ${insumosData.length} Insumos insertados exitosamente.`);

  console.log("¡Productos e Insumos sincronizados al 100% en Google Sheets!");
}

seedProductosEInsumos();
