import { Cliente } from "../types";
import { memoryStore } from "../sheets/memory-store";
import { getSheetsClient } from "../sheets/client";

export async function getClientes(): Promise<Cliente[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.clientes;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Clientes!A2:I",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.clientes;

    return rows.map((r) => ({
      id: r[0] || "",
      nombre: r[1] || "",
      pin: r[2] || "",
      telefono: r[3] || "",
      email: r[4] || "",
      agente_preferido: r[5] || "",
      notas: r[6] || "",
      fecha_registro: r[7] || "",
      activo: r[8] !== "FALSE" && r[8] !== "false",
    }));
  } catch (err) {
    console.warn("Fallback a memoria para Clientes:", err);
    return memoryStore.clientes;
  }
}

export async function addCliente(cliente: Cliente): Promise<Cliente> {
  memoryStore.clientes.push(cliente);
  const client = getSheetsClient();
  if (client) {
    try {
      const row = [
        cliente.id,
        cliente.nombre,
        cliente.pin,
        cliente.telefono || "",
        cliente.email || "",
        cliente.agente_preferido || "",
        cliente.notas || "",
        cliente.fecha_registro || new Date().toISOString().split("T")[0],
        String(cliente.activo ?? true),
      ];
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: "Clientes!A2:I",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      });
    } catch (err) {
      console.error("Error al agregar cliente en Google Sheets:", err);
    }
  }
  return cliente;
}
