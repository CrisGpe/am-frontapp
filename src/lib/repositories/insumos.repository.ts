import { Insumo } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getInsumos(): Promise<Insumo[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.insumos;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Insumos!A2:G",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.insumos;

    return rows.map((r) => ({
      id: r[0] || "",
      nombre: r[1] || "",
      categoria: r[2] || "",
      unidad_medida: r[3] || "",
      stock: Number(r[4]) || 0,
      costo_unitario: Number(r[5]) || 0,
      activo: r[6] !== "FALSE" && r[6] !== "false",
    }));
  } catch (err) {
    console.warn("Fallback a memoria para Insumos:", err);
    return memoryStore.insumos;
  }
}

export async function updateInsumoStock(id: string, nuevoStock: number): Promise<Insumo | null> {
  const stockVal = Math.max(0, nuevoStock);
  const idx = memoryStore.insumos.findIndex((i) => i.id === id);
  if (idx !== -1) {
    memoryStore.insumos[idx].stock = stockVal;
  }

  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Insumos!A2:A",
      });
      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === id);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Insumos!E${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[String(stockVal)]] },
        });
      }
    } catch (err) {
      console.error("Error actualizando stock de insumo en Google Sheets:", err);
    }
  }

  return idx !== -1 ? memoryStore.insumos[idx] : null;
}
