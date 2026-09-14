import { BorradorEntry } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getBorrador(): Promise<BorradorEntry[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.borrador;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Borrador!A2:W",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return [];

    return rows.map((r) => ({
      id_oatc: r[0] || "",
      fecha: r[1] || "",
      hora_inicio: r[2] || "",
      tipo_consumidor: (r[3] as BorradorEntry["tipo_consumidor"]) || "turno",
      id_cliente: r[4] || undefined,
      nombre_consumidor: r[5] || "",
      id_agente: r[6] || "",
      nombre_agente: r[7] || "",
      id_servicio: r[8] || "",
      nombre_servicio: r[9] || "",
      etapa: (r[10] as BorradorEntry["etapa"]) || "asesoria",
      precio_final: Number(r[11]) || 0,
      productos_usados: r[12] || "",
      insumos_usados: r[13] || "",
      productos_vendidos: r[14] || "",
      correlativo_sistema: r[15] || "",
      comprobante_externo: r[16] || "",
      notas: r[17] || "",
      hora_fin: r[18] || "",
      alerta_tiempo_anomalo: r[19] === "TRUE" || r[19] === "true",
      duracion_real_minutos: r[20] ? Number(r[20]) : undefined,
      duracion_estimada_minutos: r[21] ? Number(r[21]) : undefined,
      motivo_finalizacion_temprana: r[22] || undefined,
    }));
  } catch (err) {
    console.warn("Fallback a memoria para Borrador:", err);
    return memoryStore.borrador;
  }
}

export async function addBorradorEntry(entry: BorradorEntry): Promise<BorradorEntry> {
  const client = getSheetsClient();
  memoryStore.borrador.push(entry);

  if (!client) return entry;

  try {
    const row = [
      entry.id_oatc,
      entry.fecha,
      entry.hora_inicio,
      entry.tipo_consumidor,
      entry.id_cliente || "",
      entry.nombre_consumidor,
      entry.id_agente,
      entry.nombre_agente,
      entry.id_servicio,
      entry.nombre_servicio,
      entry.etapa,
      entry.precio_final,
      entry.productos_usados || "",
      entry.insumos_usados || "",
      entry.productos_vendidos || "",
      entry.correlativo_sistema,
      entry.comprobante_externo || "",
      entry.notas || "",
      entry.hora_fin || "",
      entry.alerta_tiempo_anomalo ? "TRUE" : "FALSE",
      entry.duracion_real_minutos != null ? String(entry.duracion_real_minutos) : "",
      entry.duracion_estimada_minutos != null ? String(entry.duracion_estimada_minutos) : "",
      entry.motivo_finalizacion_temprana || "",
    ];

    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.sheetId,
      range: "Borrador!A2:W",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
  } catch (err) {
    console.error("Error escribiendo en Borrador (Google Sheets):", err);
  }

  return entry;
}

export async function updateBorradorEntry(
  id_oatc: string,
  updates: Partial<BorradorEntry>
): Promise<BorradorEntry | null> {
  const client = getSheetsClient();
  let existingEntry: BorradorEntry | null = null;
  const index = memoryStore.borrador.findIndex((e) => e.id_oatc === id_oatc);

  if (index !== -1) {
    existingEntry = memoryStore.borrador[index];
  } else if (client) {
    const borradorActual = await getBorrador();
    const found = borradorActual.find((e) => e.id_oatc === id_oatc);
    if (found) {
      memoryStore.borrador.push(found);
      existingEntry = found;
    }
  }

  if (!existingEntry) return null;

  const updated: BorradorEntry = {
    ...existingEntry,
    ...updates,
  };

  const storeIdx = memoryStore.borrador.findIndex((e) => e.id_oatc === id_oatc);
  if (storeIdx !== -1) {
    memoryStore.borrador[storeIdx] = updated;
  } else {
    memoryStore.borrador.push(updated);
  }

  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Borrador!A2:A",
      });
      const rows = res.data.values || [];
      const sheetRowIdx = rows.findIndex((r) => r[0] === id_oatc);
      if (sheetRowIdx !== -1) {
        const rowNum = sheetRowIdx + 2;
        const rowValues = [
          updated.id_oatc,
          updated.fecha,
          updated.hora_inicio,
          updated.tipo_consumidor,
          updated.id_cliente || "",
          updated.nombre_consumidor,
          updated.id_agente,
          updated.nombre_agente,
          updated.id_servicio,
          updated.nombre_servicio,
          updated.etapa,
          updated.precio_final,
          updated.productos_usados || "",
          updated.insumos_usados || "",
          updated.productos_vendidos || "",
          updated.correlativo_sistema,
          updated.comprobante_externo || "",
          updated.notas || "",
          updated.hora_fin || "",
          updated.alerta_tiempo_anomalo ? "TRUE" : "FALSE",
          updated.duracion_real_minutos != null ? String(updated.duracion_real_minutos) : "",
          updated.duracion_estimada_minutos != null ? String(updated.duracion_estimada_minutos) : "",
          updated.motivo_finalizacion_temprana || "",
        ];
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Borrador!A${rowNum}:W${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [rowValues] },
        });
      }
    } catch (err) {
      console.error("Error actualizando Borrador en Google Sheets:", err);
    }
  }

  return updated;
}
