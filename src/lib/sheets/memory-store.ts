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
} from "../types";
import {
  MOCK_AGENTES,
  MOCK_CLIENTES,
  MOCK_SERVICIOS,
  MOCK_PRODUCTOS,
  MOCK_INSUMOS,
  MOCK_BORRADOR,
  INITIAL_CONFIG,
} from "../mock-data";

export class InMemoryStore {
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

// Singleton global para compartir estado en memoria entre repositorios
const globalForMemory = globalThis as unknown as { memoryStore?: InMemoryStore };

export const memoryStore = globalForMemory.memoryStore ?? new InMemoryStore();

if (process.env.NODE_ENV !== "production") {
  globalForMemory.memoryStore = memoryStore;
}
