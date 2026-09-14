import { OATCRecord, BorradorEntry } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";
import { getBorrador } from "./borrador.repository";

export async function getTodosOATC(): Promise<OATCRecord[]> {
  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "OATC!A2:T",
      });
      const rows = res.data.values || [];
      return rows.map((r) => ({
        id_oatc: r[0] || "",
        fecha: r[1] || "",
        hora_inicio: r[2] || "",
        tipo_consumidor: (r[3] as OATCRecord["tipo_consumidor"]) || "turno",
        id_cliente: r[4] || undefined,
        nombre_consumidor: r[5] || "",
        id_agente: r[6] || "",
        nombre_agente: r[7] || "",
        id_servicio: r[8] || "",
        nombre_servicio: r[9] || "",
        etapa: (r[10] as OATCRecord["etapa"]) || "completada",
        precio_final: Number(r[11]) || 0,
        productos_usados: r[12] || "",
        insumos_usados: r[13] || "",
        productos_vendidos: r[14] || "",
        correlativo_sistema: r[15] || "",
        comprobante_externo: r[16] || "",
        notas: r[17] || "",
        hora_fin: r[18] || "",
        migrado_en: r[19] || "",
      }));
    } catch (err) {
      console.warn("Fallback a memoria para todos OATC:", err);
      return memoryStore.oatc;
    }
  }
  return memoryStore.oatc;
}

export async function getHistorialCliente(clienteId: string): Promise<BorradorEntry[]> {
  const [enBorrador, client] = await Promise.all([
    getBorrador(),
    Promise.resolve(getSheetsClient()),
  ]);

  const filtradosBorrador = enBorrador.filter((b) => b.id_cliente === clienteId);

  let historicoOATC: BorradorEntry[] = [];
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "OATC!A2:T",
      });
      const rows = res.data.values || [];
      historicoOATC = rows
        .filter((r) => r[4] === clienteId)
        .map((r) => ({
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
          etapa: (r[10] as BorradorEntry["etapa"]) || "completada",
          precio_final: Number(r[11]) || 0,
          productos_usados: r[12] || "",
          insumos_usados: r[13] || "",
          productos_vendidos: r[14] || "",
          correlativo_sistema: r[15] || "",
          comprobante_externo: r[16] || "",
          notas: r[17] || "",
          hora_fin: r[18] || "",
        }));
    } catch (err) {
      console.warn("Fallback a memoria para historial OATC:", err);
      historicoOATC = memoryStore.oatc.filter((o) => o.id_cliente === clienteId);
    }
  } else {
    historicoOATC = memoryStore.oatc.filter((o) => o.id_cliente === clienteId);
  }

  return [...filtradosBorrador, ...historicoOATC];
}
