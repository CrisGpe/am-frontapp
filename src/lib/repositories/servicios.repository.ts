import { Servicio } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getServicios(): Promise<Servicio[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.servicios;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Servicios!A2:H",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.servicios;

    return rows.map((r) => ({
      id: r[0] || "",
      nombre: r[1] || "",
      categoria: (r[2] as Servicio["categoria"]) || "otro",
      especialidad_requerida: (r[3] || "").trim().toLowerCase(),
      duracion_min: Number(r[4]) || 30,
      precio_base: Number(r[5]) || 0,
      descripcion: r[6] || "",
      activo: r[7] !== "FALSE" && r[7] !== "false",
    }));
  } catch (err) {
    console.warn("Fallback a memoria para Servicios:", err);
    return memoryStore.servicios;
  }
}
