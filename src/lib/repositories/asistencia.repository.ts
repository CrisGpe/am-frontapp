import { AsistenciaRecord } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getAsistenciaHoy(fecha: string): Promise<AsistenciaRecord[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.asistencia.filter((a) => a.fecha === fecha);

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Asistencia!A2:F",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return [];

    return rows
      .filter((r) => r[0] === fecha)
      .map((r) => ({
        fecha: r[0] || "",
        id_agente: r[1] || "",
        nombre_agente: r[2] || "",
        hora_checkin: r[3] || undefined,
        hora_checkout: r[4] || undefined,
        estado: (r[5] as AsistenciaRecord["estado"]) || "presente",
      }));
  } catch (err) {
    console.warn("Fallback a memoria para Asistencia:", err);
    return memoryStore.asistencia.filter((a) => a.fecha === fecha);
  }
}

export async function registrarAsistencia(record: AsistenciaRecord): Promise<AsistenciaRecord> {
  const existingIdx = memoryStore.asistencia.findIndex(
    (a) => a.fecha === record.fecha && a.id_agente === record.id_agente
  );

  if (existingIdx >= 0) {
    memoryStore.asistencia[existingIdx] = {
      ...memoryStore.asistencia[existingIdx],
      ...record,
    };
  } else {
    memoryStore.asistencia.push(record);
  }

  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Asistencia!A2:B",
      });
      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === record.fecha && r[1] === record.id_agente);

      const rowValues = [
        record.fecha,
        record.id_agente,
        record.nombre_agente,
        record.hora_checkin || "",
        record.hora_checkout || "",
        record.estado,
      ];

      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Asistencia!A${rowNum}:F${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [rowValues] },
        });
      } else {
        await client.sheets.spreadsheets.values.append({
          spreadsheetId: client.sheetId,
          range: "Asistencia!A2:F",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [rowValues] },
        });
      }
    } catch (err) {
      console.error("Error al registrar Asistencia en Google Sheets:", err);
    }
  }

  return record;
}
