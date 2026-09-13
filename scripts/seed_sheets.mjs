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

async function inspectAndSeed() {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const spreadsheetId = env.GOOGLE_SHEET_ID;

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const headers = {
    Agentes: [
      "id", "nombre", "pin", "rol", "especialidades", "telefono", "email",
      "horario_lun", "horario_mar", "horario_mie", "horario_jue", "horario_vie", "horario_sab", "horario_dom",
      "disponible_turnos", "activo"
    ],
    Clientes: [
      "id", "nombre", "pin", "telefono", "email", "agente_preferido", "notas", "fecha_registro", "activo"
    ],
    Servicios: [
      "id", "nombre", "categoria", "especialidad_requerida", "duracion_min", "precio_base", "descripcion", "activo"
    ],
    Productos: [
      "id", "nombre", "categoria", "marca", "precio_venta", "stock", "activo"
    ],
    Insumos: [
      "id", "nombre", "categoria", "unidad_medida", "stock", "costo_unitario", "activo"
    ],
    Borrador: [
      "id_oatc", "fecha", "hora_inicio", "tipo_consumidor", "id_cliente", "nombre_consumidor",
      "id_agente", "nombre_agente", "id_servicio", "nombre_servicio", "etapa", "precio_final",
      "productos_usados", "insumos_usados", "productos_vendidos", "correlativo_sistema", "comprobante_externo",
      "notas", "hora_fin"
    ],
    OATC: [
      "id_oatc", "fecha", "hora_inicio", "tipo_consumidor", "id_cliente", "nombre_consumidor",
      "id_agente", "nombre_agente", "id_servicio", "nombre_servicio", "etapa", "precio_final",
      "productos_usados", "insumos_usados", "productos_vendidos", "correlativo_sistema", "comprobante_externo",
      "notas", "hora_fin", "migrado_en"
    ],
    Asistencia: [
      "fecha", "id_agente", "nombre_agente", "hora_checkin", "hora_checkout", "estado"
    ],
    Citas: [
      "id", "id_cliente", "id_agente", "id_servicio", "fecha", "hora", "estado", "creada_en", "notas"
    ],
    Configuracion: [
      "clave", "valor"
    ],
  };

  console.log("Verificando encabezados en las pestañas...");

  for (const [sheetName, headerCols] of Object.entries(headers)) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });

      const currentHeaders = res.data.values ? res.data.values[0] : null;

      if (!currentHeaders || currentHeaders.length === 0) {
        console.log(`- Insertando encabezados en ${sheetName}...`);
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [headerCols] },
        });
      } else {
        console.log(`✓ ${sheetName} ya cuenta con encabezados: ${currentHeaders.slice(0, 4).join(", ")}...`);
      }
    } catch (e) {
      console.warn(`! Error en pestaña ${sheetName}:`, e.message);
    }
  }

  // Verificar si Agentes tiene datos iniciales; si no, insertar los agentes de prueba
  try {
    const agentesCheck = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Agentes!A2:A",
    });

    if (!agentesCheck.data.values || agentesCheck.data.values.length === 0) {
      console.log("Poblando Agentes iniciales en Google Sheets...");
      const agentesRows = [
        ["AG-001", "Valeria Morales", "1234", "admin", "estilista,colorista", "+52 55 1234 5678", "valeria.admin@salon.com", "09:00-19:00", "09:00-19:00", "09:00-19:00", "09:00-19:00", "09:00-20:00", "09:00-20:00", "", "TRUE", "TRUE"],
        ["AG-002", "Carlos Mendoza", "2345", "agente", "estilista", "+52 55 2345 6789", "carlos.m@salon.com", "10:00-18:00", "10:00-18:00", "10:00-18:00", "10:00-18:00", "10:00-19:00", "10:00-19:00", "", "TRUE", "TRUE"],
        ["AG-003", "Sofía Navarro", "3456", "agente", "colorista,tratamientos", "+52 55 3456 7890", "sofia.color@salon.com", "09:00-17:00", "09:00-17:00", "09:00-17:00", "09:00-17:00", "09:00-18:00", "09:00-18:00", "", "TRUE", "TRUE"],
        ["AG-004", "Mariana Ríos", "4567", "agente", "manicurista,pedicurista", "+52 55 4567 8901", "mariana.nails@salon.com", "10:00-19:00", "10:00-19:00", "10:00-19:00", "10:00-19:00", "10:00-20:00", "10:00-20:00", "", "TRUE", "TRUE"],
        ["AG-005", "Alejandra Vega", "5678", "agente", "esteticista,facial", "+52 55 5678 9012", "alejandra.spa@salon.com", "11:00-19:00", "11:00-19:00", "11:00-19:00", "11:00-19:00", "11:00-20:00", "10:00-18:00", "", "FALSE", "TRUE"]
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Agentes!A2:P",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: agentesRows },
      });
      console.log("✓ 5 Agentes precargados exitosamente en Google Sheets!");
    }

    // Servicios check
    const servCheck = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Servicios!A2:A" });
    if (!servCheck.data.values || servCheck.data.values.length === 0) {
      console.log("Poblando Servicios iniciales en Google Sheets...");
      const servRows = [
        ["SV-001", "Corte y Peinado Dama", "cabello", "estilista", "45", "450", "Lavado con shampoo reconstructor, corte según visagismo y secado profesional.", "TRUE"],
        ["SV-002", "Corte Caballero & Perfilado", "cabello", "estilista", "30", "320", "Degradado a máquina/tijera con acabado navaja y toalla tibia.", "TRUE"],
        ["SV-003", "Balayage & Matización", "cabello", "colorista", "150", "1850", "Decoloración progresiva a mano alzada, matiz tonalizante y tratamiento sellador.", "TRUE"],
        ["SV-004", "Tinte Global Sin Amoníaco", "cabello", "colorista", "90", "890", "Coloración orgánica de alta cobertura y brillo con nutrición botánica.", "TRUE"],
        ["SV-005", "Manicura Rusa con Gel", "uñas", "manicurista", "60", "420", "Limpieza profunda de cutícula con torno y esmaltado en gel de larga duración.", "TRUE"],
        ["SV-006", "Pedicura Spa Hidratante", "uñas", "pedicurista", "60", "480", "Exfoliación con sales minerales, mascarilla térmica y masaje relajante podal.", "TRUE"],
        ["SV-007", "Limpieza Facial Profunda", "facial", "facial", "75", "750", "Vapor de ozono, desincrustación ultrasónica, alta frecuencia y mascarilla calmante.", "TRUE"]
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Servicios!A2:H",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: servRows },
      });
      console.log("✓ Servicios precargados exitosamente en Google Sheets!");
    }

    // Clientes check
    const cliCheck = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Clientes!A2:A" });
    if (!cliCheck.data.values || cliCheck.data.values.length === 0) {
      console.log("Poblando Clientes iniciales en Google Sheets...");
      const cliRows = [
        ["CL-001", "Camila Fernández", "1111", "+52 55 9876 5432", "camila.f@gmail.com", "AG-001", "Prefiere café descafeinado.", "2025-01-15", "TRUE"],
        ["CL-002", "Daniela Ortiz", "2222", "+52 55 8765 4321", "daniela.o@outlook.com", "AG-003", "Tono rubio cenizo balayage recurrente.", "2025-02-10", "TRUE"],
        ["CL-003", "Lucía Castillo", "3333", "+52 55 7654 3210", "lucia.castillo@gmail.com", "AG-004", "Esmalte semipermanente tono nude.", "2025-03-05", "TRUE"]
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Clientes!A2:I",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: cliRows },
      });
      console.log("✓ Clientes precargados exitosamente en Google Sheets!");
    }

    // Configuración check
    const confCheck = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Configuracion!A2:A" });
    if (!confCheck.data.values || confCheck.data.values.length === 0) {
      console.log("Poblando Configuración inicial en Google Sheets...");
      const confRows = [
        ["nombre_salon", "AM CRM Salón & Spa"],
        ["hora_cierre_auto", "22:00"],
        ["zona_horaria", "America/Mexico_City"],
        ["correlativo_actual", "100"]
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Configuracion!A2:B",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: confRows },
      });
      console.log("✓ Configuración precargada exitosamente en Google Sheets!");
    }

  } catch (err) {
    console.error("Error al poblar datos:", err);
  }

  console.log("¡Inicialización completa de Google Sheets finalizada!");
}

inspectAndSeed();
