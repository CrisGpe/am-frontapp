import { SalonConfig } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getSalonConfig(): Promise<SalonConfig> {
  const client = getSheetsClient();
  if (!client) return memoryStore.config;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Configuracion!A2:B10",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.config;

    const map: Record<string, string> = {};
    rows.forEach((r) => {
      if (r[0]) map[r[0]] = r[1] || "";
    });

    const cfg: SalonConfig = {
      nombre_salon: map["nombre_salon"] || memoryStore.config.nombre_salon,
      hora_cierre_auto: map["hora_cierre_auto"] || memoryStore.config.hora_cierre_auto,
      zona_horaria: map["zona_horaria"] || memoryStore.config.zona_horaria,
      correlativo_actual: Number(map["correlativo_actual"]) || memoryStore.config.correlativo_actual,
    };
    memoryStore.config = cfg;
    return cfg;
  } catch (err) {
    console.warn("Fallback a memoria para Configuracion:", err);
    return memoryStore.config;
  }
}

export async function updateSalonConfig(updates: Partial<SalonConfig>): Promise<SalonConfig> {
  const current = await getSalonConfig();
  const next: SalonConfig = { ...current, ...updates };
  memoryStore.config = next;

  const client = getSheetsClient();
  if (client) {
    try {
      const rows = [
        ["nombre_salon", next.nombre_salon],
        ["hora_cierre_auto", next.hora_cierre_auto],
        ["zona_horaria", next.zona_horaria],
        ["correlativo_actual", String(next.correlativo_actual)],
      ];
      await client.sheets.spreadsheets.values.update({
        spreadsheetId: client.sheetId,
        range: "Configuracion!A2:B5",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: rows },
      });
    } catch (err) {
      console.error("Error al actualizar Configuracion en Google Sheets:", err);
    }
  }

  return next;
}
