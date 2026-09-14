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
  TurnoEspera,
  RolAgente,
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
import { getTodayDateString } from "./utils";

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
  citas: CitaRecord[] = [
    {
      id: "CT-001",
      id_cliente: "CL-001",
      id_agente: "AG-001",
      id_servicio: "SV-001",
      fecha: "2026-09-15",
      hora: "10:00",
      estado: "confirmada",
      creada_en: "2026-09-13T10:00:00Z",
      notas: "Corte regular de mantenimiento.",
    },
    {
      id: "CT-002",
      id_cliente: "CL-002",
      id_agente: "AG-003",
      id_servicio: "SV-003",
      fecha: "2026-09-16",
      hora: "15:00",
      estado: "confirmada",
      creada_en: "2026-09-13T11:30:00Z",
      notas: "Retoque de raíz balayage.",
    },
  ];
  turnos: TurnoEspera[] = [
    {
      id: "TRN-001",
      nombre_consumidor: "Gabriela Luna",
      id_servicio: "SV-001",
      nombre_servicio: "Corte y Peinado Dama",
      especialidad_requerida: "estilista",
      fecha: "2026-09-13",
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
      fecha: "2026-09-13",
      hora_llegada: "11:35",
      estado: "en_espera",
    },
  ];
  config: SalonConfig = { ...INITIAL_CONFIG };
}

const memoryStore = new InMemoryStore();

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    console.warn(
      "⚠️ Credenciales de Google Sheets no encontradas (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID). Usando fallback en memoria."
    );
    return null;
  }

  try {
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: email.trim(),
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return {
      sheets: google.sheets({ version: "v4", auth }),
      sheetId: sheetId.trim(),
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
      rol: (r[3] === "admin" ? "admin" : "agente") as RolAgente,
      especialidades: (r[4] || "").split(",").map((s: string) => s.trim().toLowerCase()).filter((s: string) => s.length > 0),
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
        ];
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Borrador!A${rowNum}:S${rowNum}`,
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

// ----------------------------------------------------
// TURNOS
// ----------------------------------------------------
export async function getTurnos(): Promise<TurnoEspera[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.turnos;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Turnos!A2:K",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.turnos;

    return rows.map((r) => ({
      id: r[0] || "",
      nombre_consumidor: r[1] || "",
      id_servicio: r[2] || "",
      nombre_servicio: r[3] || "",
      especialidad_requerida: r[4] || "",
      fecha: r[5] || "",
      hora_llegada: r[6] || "",
      estado: (r[7] as any) || "en_espera",
      notas: r[8] || undefined,
      agente_asignado_id: r[9] || undefined,
      id_oatc_creada: r[10] || undefined,
    }));
  } catch (err) {
    console.warn("Fallback a memoria para Turnos:", err);
    return memoryStore.turnos;
  }
}

export async function addTurno(turno: TurnoEspera): Promise<TurnoEspera> {
  memoryStore.turnos.push(turno);
  const client = getSheetsClient();
  if (client) {
    try {
      const row = [
        turno.id,
        turno.nombre_consumidor,
        turno.id_servicio,
        turno.nombre_servicio,
        turno.especialidad_requerida,
        turno.fecha,
        turno.hora_llegada,
        turno.estado,
        turno.notas || "",
        turno.agente_asignado_id || "",
        turno.id_oatc_creada || "",
      ];
      await client.sheets.spreadsheets.values.append({
        spreadsheetId: client.sheetId,
        range: "Turnos!A2:K",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [row] },
      });
    } catch (err) {
      console.error("Error guardando Turno en Google Sheets:", err);
    }
  }
  return turno;
}

export async function updateTurno(
  id: string,
  updates: Partial<TurnoEspera>
): Promise<TurnoEspera | null> {
  const idx = memoryStore.turnos.findIndex((t) => t.id === id);
  if (idx !== -1) {
    memoryStore.turnos[idx] = { ...memoryStore.turnos[idx], ...updates };
  }

  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Turnos!A2:K",
      });
      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === id);
      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        const current = rows[rowIndex];
        const updatedRow = [
          current[0],
          updates.nombre_consumidor !== undefined ? updates.nombre_consumidor : current[1],
          updates.id_servicio !== undefined ? updates.id_servicio : current[2],
          updates.nombre_servicio !== undefined ? updates.nombre_servicio : current[3],
          updates.especialidad_requerida !== undefined ? updates.especialidad_requerida : current[4],
          updates.fecha !== undefined ? updates.fecha : current[5],
          updates.hora_llegada !== undefined ? updates.hora_llegada : current[6],
          updates.estado !== undefined ? updates.estado : current[7],
          updates.notas !== undefined ? (updates.notas || "") : (current[8] || ""),
          updates.agente_asignado_id !== undefined ? (updates.agente_asignado_id || "") : (current[9] || ""),
          updates.id_oatc_creada !== undefined ? (updates.id_oatc_creada || "") : (current[10] || ""),
        ];
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Turnos!A${rowNum}:K${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [updatedRow] },
        });
      }
    } catch (err) {
      console.error("Error actualizando Turno en Google Sheets:", err);
    }
  }

  return idx !== -1 ? memoryStore.turnos[idx] : null;
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

// ----------------------------------------------------
// ASISTENCIA
// ----------------------------------------------------
export async function getAsistenciaHoy(fecha: string): Promise<AsistenciaRecord[]> {
  const client = getSheetsClient();
  if (!client) return memoryStore.asistencia.filter((a) => a.fecha === fecha);

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Asistencia!A2:F",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.asistencia.filter((a) => a.fecha === fecha);

    return rows
      .filter((r) => r[0] === fecha)
      .map((r) => ({
        fecha: r[0] || "",
        id_agente: r[1] || "",
        nombre_agente: r[2] || "",
        hora_checkin: r[3] || undefined,
        hora_checkout: r[4] || undefined,
        estado: (r[5] as any) || "presente",
      }));
  } catch (err) {
    console.warn("Fallback a memoria para Asistencia:", err);
    return memoryStore.asistencia.filter((a) => a.fecha === fecha);
  }
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

  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.sheets.spreadsheets.values.get({
        spreadsheetId: client.sheetId,
        range: "Asistencia!A2:B",
      });
      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === record.fecha && r[1] === record.id_agente);

      const rowValues = [
        record.fecha,
        record.id_agente,
        record.nombre_agente,
        record.hora_checkin || "",
        record.hora_checkout || "",
        record.estado,
      ];

      if (rowIndex !== -1) {
        const rowNum = rowIndex + 2;
        await client.sheets.spreadsheets.values.update({
          spreadsheetId: client.sheetId,
          range: `Asistencia!A${rowNum}:F${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [rowValues] },
        });
      } else {
        await client.sheets.spreadsheets.values.append({
          spreadsheetId: client.sheetId,
          range: "Asistencia!A2:F",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [rowValues] },
        });
      }
    } catch (err) {
      console.error("Error al registrar Asistencia en Google Sheets:", err);
    }
  }

  return record;
}

// ----------------------------------------------------
// CONFIGURACIÓN
// ----------------------------------------------------
export async function getSalonConfig(): Promise<SalonConfig> {
  const client = getSheetsClient();
  if (!client) return memoryStore.config;

  try {
    const res = await client.sheets.spreadsheets.values.get({
      spreadsheetId: client.sheetId,
      range: "Configuracion!A2:B10",
    });
    const rows = res.data.values || [];
    if (rows.length === 0) return memoryStore.config;

    const map: Record<string, string> = {};
    rows.forEach((r) => {
      if (r[0]) map[r[0]] = r[1] || "";
    });

    const cfg: SalonConfig = {
      nombre_salon: map["nombre_salon"] || memoryStore.config.nombre_salon,
      hora_cierre_auto: map["hora_cierre_auto"] || memoryStore.config.hora_cierre_auto,
      zona_horaria: map["zona_horaria"] || memoryStore.config.zona_horaria,
      correlativo_actual: Number(map["correlativo_actual"]) || memoryStore.config.correlativo_actual,
    };
    memoryStore.config = cfg;
    return cfg;
  } catch (err) {
    console.warn("Fallback a memoria para Configuracion:", err);
    return memoryStore.config;
  }
}

export async function updateSalonConfig(updates: Partial<SalonConfig>): Promise<SalonConfig> {
  const current = await getSalonConfig();
  const next: SalonConfig = { ...current, ...updates };
  memoryStore.config = next;

  const client = getSheetsClient();
  if (client) {
    try {
      const rows = [
        ["nombre_salon", next.nombre_salon],
        ["hora_cierre_auto", next.hora_cierre_auto],
        ["zona_horaria", next.zona_horaria],
        ["correlativo_actual", String(next.correlativo_actual)],
      ];
      await client.sheets.spreadsheets.values.update({
        spreadsheetId: client.sheetId,
        range: "Configuracion!A2:B5",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: rows },
      });
    } catch (err) {
      console.error("Error al actualizar Configuracion en Google Sheets:", err);
    }
  }

  return next;
}

// ----------------------------------------------------
// CITAS (Agenda de Clientes)
// ----------------------------------------------------
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
      estado: (r[6] as any) || "confirmada",
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

// ----------------------------------------------------
// HISTORIAL DE CLIENTE (Borrador + OATC histórico)
// ----------------------------------------------------
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
          tipo_consumidor: (r[3] as any) || "turno",
          id_cliente: r[4] || undefined,
          nombre_consumidor: r[5] || "",
          id_agente: r[6] || "",
          nombre_agente: r[7] || "",
          id_servicio: r[8] || "",
          nombre_servicio: r[9] || "",
          etapa: (r[10] as any) || "completada",
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

// ----------------------------------------------------
// CIERRE DE DÍA (Migración Borrador -> OATC y Asistencia)
// ----------------------------------------------------
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
      throw new Error("Error al migrar el borrador a OATC en Google Sheets. El borrador no fue alterado para evitar pérdida de datos.");
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
