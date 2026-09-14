import { Producto } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getProductos(): Promise<Producto[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.productos;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Productos!A2:G",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.productos;

    return rows.map((r) => ({
      id: r[0] || "",
      nombre: r[1] || "",
      categoria: r[2] || "",
      marca: r[3] || "",
      precio_venta: Number(r[4]) || 0,
      stock: Number(r[5]) || 0,
      activo: r[6] !== "FALSE" && r[6] !== "false",
    }));
  } catch (err) {
    console.warn("Fallback a memoria para Productos:", err);
    return memoryStore.productos;
  }
}

export async function updateProductoStock(id: string, nuevoStock: number): Promise<Producto | null> {
  const stockVal = Math.max(0, nuevoStock);
  const idx = memoryStore.productos.findIndex((p) => p.id === id);
  if (idx !== -1) {
    memoryStore.productos[idx].stock = stockVal;
  }

  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Productos!A2:A",
      });
      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === id);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Productos!F${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[String(stockVal)]] },
        });
      }
    } catch (err) {
      console.error("Error actualizando stock de producto en Google Sheets:", err);
    }
  }

  return idx !== -1 ? memoryStore.productos[idx] : null;
}
