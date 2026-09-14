import { TurnoEspera } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getTurnos(): Promise<TurnoEspera[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.turnos;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Turnos!A2:K",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.turnos;

    return rows.map((r) => ({
      id: r[0] || "",
      nombre_consumidor: r[1] || "",
      id_servicio: r[2] || "",
      nombre_servicio: r[3] || "",
      especialidad_requerida: r[4] || "",
      fecha: r[5] || "",
      hora_llegada: r[6] || "",
      estado: (r[7] as TurnoEspera["estado"]) || "en_espera",
      notas: r[8] || undefined,
      agente_asignado_id: r[9] || undefined,
      id_oatc_creada: r[10] || undefined,
    }));
  } catch (err) {
    console.warn("Fallback a memoria para Turnos:", err);
    return memoryStore.turnos;
  }
}

export async function addTurno(turno: TurnoEspera): Promise<TurnoEspera> {
  memoryStore.turnos.push(turno);
  const client = getSheetsClient();
  if (client) {
    try {
      const row = [
        turno.id,
        turno.nombre_consumidor,
        turno.id_servicio,
        turno.nombre_servicio,
        turno.especialidad_requerida,
        turno.fecha,
        turno.hora_llegada,
        turno.estado,
        turno.notas || "",
        turno.agente_asignado_id || "",
        turno.id_oatc_creada || "",
      ];
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: "Turnos!A2:K",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      });
    } catch (err) {
      console.error("Error guardando Turno en Google Sheets:", err);
    }
  }
  return turno;
}

export async function updateTurno(
  id: string,
  updates: Partial<TurnoEspera>
): Promise<TurnoEspera | null> {
  const idx = memoryStore.turnos.findIndex((t) => t.id === id);
  if (idx !== -1) {
    memoryStore.turnos[idx] = { ...memoryStore.turnos[idx], ...updates };
  }

  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Turnos!A2:K",
      });
      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === id);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        const current = rows[rowIndex];
        const updatedRow = [
          current[0],
          updates.nombre_consumidor !== undefined ? updates.nombre_consumidor : current[1],
          updates.id_servicio !== undefined ? updates.id_servicio : current[2],
          updates.nombre_servicio !== undefined ? updates.nombre_servicio : current[3],
          updates.especialidad_requerida !== undefined ? updates.especialidad_requerida : current[4],
          updates.fecha !== undefined ? updates.fecha : current[5],
          updates.hora_llegada !== undefined ? updates.hora_llegada : current[6],
          updates.estado !== undefined ? updates.estado : current[7],
          updates.notas !== undefined ? (updates.notas || "") : (current[8] || ""),
          updates.agente_asignado_id !== undefined ? (updates.agente_asignado_id || "") : (current[9] || ""),
          updates.id_oatc_creada !== undefined ? (updates.id_oatc_creada || "") : (current[10] || ""),
        ];
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Turnos!A${rowNum}:K${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [updatedRow] },
        });
      }
    } catch (err) {
      console.error("Error actualizando Turno en Google Sheets:", err);
    }
  }

  return idx !== -1 ? memoryStore.turnos[idx] : null;
}
