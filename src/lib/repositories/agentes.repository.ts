import { Agente, RolAgente } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getAgentes(): Promise<Agente[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.agentes;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Agentes!A2:P",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.agentes;

    return rows.map((r) => ({
      id: r[0] || "",
      nombre: r[1] || "",
      pin: r[2] || "",
      rol: (r[3] === "admin" ? "admin" : "agente") as RolAgente,
      especialidades: (r[4] || "")
        .split(",")
        .map((s: string) => s.trim().toLowerCase())
        .filter((s: string) => s.length > 0),
      telefono: r[5] || "",
      email: r[6] || "",
      horario_lun: r[7] || "",
      horario_mar: r[8] || "",
      horario_mie: r[9] || "",
      horario_jue: r[10] || "",
      horario_vie: r[11] || "",
      horario_sab: r[12] || "",
      horario_dom: r[13] || "",
      disponible_turnos: r[14] === "TRUE" || r[14] === "true",
      activo: r[15] !== "FALSE" && r[15] !== "false",
    }));
  } catch (err) {
    console.warn("Fallback a memoria para Agentes:", err);
    return memoryStore.agentes;
  }
}

export async function addAgente(agente: Agente): Promise<Agente> {
  memoryStore.agentes.push(agente);
  const client = getSheetsClient();
  if (client) {
    try {
      const row = [
        agente.id,
        agente.nombre,
        agente.pin,
        agente.rol,
        (agente.especialidades || []).join(", "),
        agente.telefono || "",
        agente.email || "",
        agente.horario_lun || "",
        agente.horario_mar || "",
        agente.horario_mie || "",
        agente.horario_jue || "",
        agente.horario_vie || "",
        agente.horario_sab || "",
        agente.horario_dom || "",
        String(agente.disponible_turnos ?? true),
        String(agente.activo ?? true),
      ];
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: "Agentes!A2:P",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      });
    } catch (err) {
      console.error("Error al agregar agente en Google Sheets:", err);
    }
  }
  return agente;
}

export async function updateAgenteDisponibilidad(
  agenteId: string,
  disponible: boolean
): Promise<Agente | null> {
  const idx = memoryStore.agentes.findIndex((a) => a.id === agenteId);
  if (idx !== -1) {
    memoryStore.agentes[idx].disponible_turnos = disponible;
  }

  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Agentes!A2:A",
      });
      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === agenteId);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Agentes!O${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[String(disponible)]] },
        });
      }
    } catch (err) {
      console.error("Error al actualizar disponibilidad en Google Sheets:", err);
    }
  }

  return idx !== -1 ? memoryStore.agentes[idx] : null;
}

