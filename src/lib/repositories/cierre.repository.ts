import { OATCRecord } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";
import { getTodayDateString } from "../utils";
import { getBorrador } from "./borrador.repository";
import { getAsistenciaHoy } from "./asistencia.repository";

export interface ResumenCierre {
  fecha: string;
  totalOatcsMigradas: number;
  totalVentasMigradas: number;
  totalAsistencias: number;
  migradoEn: string;
}

export async function ejecutarCierreDeDia(): Promise<ResumenCierre> {
  const client = getSheetsClient();
  const fechaHoy = getTodayDateString("America/Lima");
  const timestamp = new Date().toISOString();

  const oatcsAMigrar = await getBorrador();
  const totalVentas = oatcsAMigrar.reduce(
    (acc, curr) => acc + (Number(curr.precio_final) || 0),
    0
  );

  // 1. Migrar en memoria
  for (const item of oatcsAMigrar) {
    const registroOATC: OATCRecord = {
      ...item,
      migrado_en: timestamp,
    };
    memoryStore.oatc.push(registroOATC);
  }

  // 2. Batch append a histórico OATC en Google Sheets
  let migradoExitoso = true;
  if (client && oatcsAMigrar.length > 0) {
    try {
      const rows = oatcsAMigrar.map((item) => [
        item.id_oatc,
        item.fecha,
        item.hora_inicio,
        item.tipo_consumidor,
        item.id_cliente || "",
        item.nombre_consumidor,
        item.id_agente,
        item.nombre_agente,
        item.id_servicio,
        item.nombre_servicio,
        item.etapa,
        item.precio_final,
        item.productos_usados || "",
        item.insumos_usados || "",
        item.productos_vendidos || "",
        item.correlativo_sistema,
        item.comprobante_externo || "",
        item.notas || "",
        item.hora_fin || "",
        timestamp,
      ]);

      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: "OATC!A2:T",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: rows },
      });
    } catch (err) {
      migradoExitoso = false;
      console.error("Error migrando OATC por lote en Google Sheets:", err);
      throw new Error(
        "Error al migrar el borrador a OATC en Google Sheets. El borrador no fue alterado para evitar pérdida de datos."
      );
    }
  }

  // 3. Limpiar la hoja Borrador SOLO si la migración a OATC fue exitosa
  if (migradoExitoso) {
    memoryStore.borrador = [];

    if (client) {
      try {
        await client.sheets.spreadsheets.values.clear({
          spreadsheetId: client.sheetId,
          range: "Borrador!A2:S",
        });
      } catch (err) {
        console.error("Error limpiando Borrador en Google Sheets:", err);
      }
    }
  }

  const asistenciasHoy = await getAsistenciaHoy(fechaHoy);

  return {
    fecha: fechaHoy,
    totalOatcsMigradas: oatcsAMigrar.length,
    totalVentasMigradas: totalVentas,
    totalAsistencias: asistenciasHoy.length || memoryStore.asistencia.length,
    migradoEn: timestamp,
  };
}
