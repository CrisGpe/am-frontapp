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
  borrador: BorradorEntry[] = [];
  asistencia: AsistenciaRecord[] = [];
  oatc: OATCRecord[] = [];
  citas: CitaRecord[] = [];
  turnos: TurnoEspera[] = [];
  config: SalonConfig = { ...INITIAL_CONFIG };
}

// Singleton global para compartir estado en memoria entre repositorios
const globalForMemory = globalThis as unknown as { memoryStore?: InMemoryStore };

export const memoryStore = globalForMemory.memoryStore ?? new InMemoryStore();

if (process.env.NODE_ENV !== "production") {
  globalForMemory.memoryStore = memoryStore;
}
