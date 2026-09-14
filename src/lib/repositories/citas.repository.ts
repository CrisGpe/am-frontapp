import { CitaRecord } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getCitas(clienteId?: string): Promise<CitaRecord[]> {
  const client = getSheetsClient();
  if (!client) {
    return clienteId
      ? memoryStore.citas.filter((c) => c.id_cliente === clienteId)
      : memoryStore.citas;
  }

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Citas!A2:I",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) {
      return clienteId
        ? memoryStore.citas.filter((c) => c.id_cliente === clienteId)
        : memoryStore.citas;
    }

    const citas: CitaRecord[] = rows.map((r) => ({
      id: r[0] || "",
      id_cliente: r[1] || "",
      id_agente: r[2] || "",
      id_servicio: r[3] || "",
      fecha: r[4] || "",
      hora: r[5] || "",
      estado: (r[6] as CitaRecord["estado"]) || "confirmada",
      creada_en: r[7] || "",
      notas: r[8] || undefined,
    }));

    return clienteId ? citas.filter((c) => c.id_cliente === clienteId) : citas;
  } catch (err) {
    console.warn("Fallback a memoria para Citas:", err);
    return clienteId
      ? memoryStore.citas.filter((c) => c.id_cliente === clienteId)
      : memoryStore.citas;
  }
}

export async function addCita(cita: CitaRecord): Promise<CitaRecord> {
  memoryStore.citas.push(cita);
  const client = getSheetsClient();
  if (client) {
    try {
      const row = [
        cita.id,
        cita.id_cliente,
        cita.id_agente,
        cita.id_servicio,
        cita.fecha,
        cita.hora,
        cita.estado,
        cita.creada_en,
        cita.notas || "",
      ];
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: "Citas!A2:I",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      });
    } catch (err) {
      console.error("Error al registrar Cita en Google Sheets:", err);
    }
  }
  return cita;
}

export async function updateCita(
  id: string,
  updates: Partial<CitaRecord>
): Promise<CitaRecord | null> {
  const idx = memoryStore.citas.findIndex((c) => c.id === id);
  if (idx !== -1) {
    memoryStore.citas[idx] = { ...memoryStore.citas[idx], ...updates };
  }

  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Citas!A2:I",
      });
      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === id);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        const current = rows[rowIndex];
        const updatedRow = [
          current[0],
          current[1],
          current[2],
          current[3],
          updates.fecha !== undefined ? updates.fecha : current[4],
          updates.hora !== undefined ? updates.hora : current[5],
          updates.estado !== undefined ? updates.estado : current[6],
          current[7],
          updates.notas !== undefined ? (updates.notas || "") : (current[8] || ""),
        ];
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Citas!A${rowNum}:I${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [updatedRow] },
        });
      }
    } catch (err) {
      console.error("Error al actualizar Cita en Google Sheets:", err);
    }
  }

  return idx !== -1 ? memoryStore.citas[idx] : null;
}
