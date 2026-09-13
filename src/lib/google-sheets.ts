import { google } from "googleapis";
import {
  Agente,
  Cliente,
  Servicio,
  Producto,
  Insumo,
  BorradorEntry,
  AsistenciaRecord,
  OATCRecord,
  CitaRecord,
  SalonConfig,
} from "./types";
import {
  MOCK_AGENTES,
  MOCK_CLIENTES,
  MOCK_SERVICIOS,
  MOCK_PRODUCTOS,
  MOCK_INSUMOS,
  MOCK_BORRADOR,
  INITIAL_CONFIG,
} from "./mock-data";

// Fallback en memoria si no hay credenciales de Google configuradas aún
class InMemoryStore {
  agentes: Agente[] = [...MOCK_AGENTES];
  clientes: Cliente[] = [...MOCK_CLIENTES];
  servicios: Servicio[] = [...MOCK_SERVICIOS];
  productos: Producto[] = [...MOCK_PRODUCTOS];
  insumos: Insumo[] = [...MOCK_INSUMOS];
  borrador: BorradorEntry[] = [...MOCK_BORRADOR];
  asistencia: AsistenciaRecord[] = [];
  oatc: OATCRecord[] = [];
  citas: CitaRecord[] = [];
  turnos: TurnoEspera[] = [
    {
      id: "TRN-001",
      nombre_consumidor: "Gabriela Luna",
      id_servicio: "SV-001",
      nombre_servicio: "Corte y Peinado Dama",
      especialidad_requerida: "estilista",
      hora_llegada: "11:20",
      estado: "en_espera",
      notas: "Cliente casual que entró al salón.",
    },
    {
      id: "TRN-002",
      nombre_consumidor: "Roberto Ramos",
      id_servicio: "SV-002",
      nombre_servicio: "Corte Caballero & Perfilado",
      especialidad_requerida: "estilista",
      hora_llegada: "11:35",
      estado: "en_espera",
    },
  ];
  config: SalonConfig = { ...INITIAL_CONFIG };
}

const memoryStore = new InMemoryStore();

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return {
      sheets: google.sheets({ version: "v4", auth }),
      sheetId,
    };
  } catch (err) {
    console.error("Error al inicializar cliente de Google Sheets:", err);
    return null;
  }
}

// ----------------------------------------------------
// AGENTES
// ----------------------------------------------------
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
      rol: (r[3] as any) || "agente",
      especialidades: (r[4] || "").split(",").map((s: string) => s.trim().toLowerCase()),
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

// ----------------------------------------------------
// CLIENTES
// ----------------------------------------------------
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

// ----------------------------------------------------
// SERVICIOS
// ----------------------------------------------------
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
      categoria: (r[2] as any) || "otro",
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

// ----------------------------------------------------
// PRODUCTOS
// ----------------------------------------------------
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

// ----------------------------------------------------
// INSUMOS
// ----------------------------------------------------
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

// ----------------------------------------------------
// BORRADOR (Operación del día)
// ----------------------------------------------------
export async function getBorrador(): Promise<BorradorEntry[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.borrador;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Borrador!A2:S",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.borrador;

    return rows.map((r) => ({
      id_oatc: r[0] || "",
      fecha: r[1] || "",
      hora_inicio: r[2] || "",
      tipo_consumidor: (r[3] as any) || "turno",
      id_cliente: r[4] || undefined,
      nombre_consumidor: r[5] || "",
      id_agente: r[6] || "",
      nombre_agente: r[7] || "",
      id_servicio: r[8] || "",
      nombre_servicio: r[9] || "",
      etapa: (r[10] as any) || "asesoria",
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
    ];

    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.sheetId,
      range: "Borrador!A2:S",
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
  const index = memoryStore.borrador.findIndex((e) => e.id_oatc === id_oatc);
  if (index === -1) return null;

  memoryStore.borrador[index] = {
    ...memoryStore.borrador[index],
    ...updates,
  };

  return memoryStore.borrador[index];
}

// ----------------------------------------------------
// TURNOS
// ----------------------------------------------------
export async function getTurnos(): Promise<TurnoEspera[]> {
  return memoryStore.turnos;
}

export async function addTurno(turno: TurnoEspera): Promise<TurnoEspera> {
  memoryStore.turnos.push(turno);
  return turno;
}

export async function updateTurno(
  id: string,
  updates: Partial<TurnoEspera>
): Promise<TurnoEspera | null> {
  const idx = memoryStore.turnos.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  memoryStore.turnos[idx] = { ...memoryStore.turnos[idx], ...updates };
  return memoryStore.turnos[idx];
}

export async function updateAgenteDisponibilidad(
  agenteId: string,
  disponible: boolean
): Promise<Agente | null> {
  const idx = memoryStore.agentes.findIndex((a) => a.id === agenteId);
  if (idx === -1) return null;
  memoryStore.agentes[idx].disponible_turnos = disponible;
  return memoryStore.agentes[idx];
}

// ----------------------------------------------------
// ASISTENCIA
// ----------------------------------------------------
export async function getAsistenciaHoy(fecha: string): Promise<AsistenciaRecord[]> {
  return memoryStore.asistencia.filter((a) => a.fecha === fecha);
}

export async function registrarAsistencia(record: AsistenciaRecord): Promise<AsistenciaRecord> {
  const existingIdx = memoryStore.asistencia.findIndex(
    (a) => a.fecha === record.fecha && a.id_agente === record.id_agente
  );

  if (existingIdx >= 0) {
    memoryStore.asistencia[existingIdx] = {
      ...memoryStore.asistencia[existingIdx],
      ...record,
    };
  } else {
    memoryStore.asistencia.push(record);
  }

  return record;
}

// ----------------------------------------------------
// CONFIGURACIÓN
// ----------------------------------------------------
export async function getSalonConfig(): Promise<SalonConfig> {
  return memoryStore.config;
}

export async function updateSalonConfig(updates: Partial<SalonConfig>): Promise<SalonConfig> {
  memoryStore.config = {
    ...memoryStore.config,
    ...updates,
  };
  return memoryStore.config;
}
