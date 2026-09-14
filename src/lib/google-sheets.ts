/**
 * Google Sheets Data Layer Facade
 *
 * Este archivo actúa como Fachada (Facade Pattern), centralizando y re-exportando
 * de manera transparente todos los repositorios especializados y clientes de infraestructura.
 * Mantiene compatibilidad total sin regresiones para las rutas API y componentes existentes.
 */

// Infraestructura y almacenamiento
export { getSheetsClient } from "./sheets/client";
export type { SheetsClientContext } from "./sheets/client";
export { memoryStore, InMemoryStore } from "./sheets/memory-store";

// Repositorios de Dominio
export { getServicios } from "./repositories/servicios.repository";
export { getProductos, updateProductoStock } from "./repositories/productos.repository";
export { getInsumos, updateInsumoStock } from "./repositories/insumos.repository";
export {
  getAgentes,
  addAgente,
  updateAgenteDisponibilidad,
} from "./repositories/agentes.repository";
export { getClientes, addCliente } from "./repositories/clientes.repository";
export {
  getBorrador,
  addBorradorEntry,
  updateBorradorEntry,
} from "./repositories/borrador.repository";
export {
  getTurnos,
  addTurno,
  updateTurno,
} from "./repositories/turnos.repository";
export {
  getAsistenciaHoy,
  registrarAsistencia,
} from "./repositories/asistencia.repository";
export {
  getSalonConfig,
  updateSalonConfig,
} from "./repositories/configuracion.repository";
export {
  getCitas,
  addCita,
  updateCita,
} from "./repositories/citas.repository";
export {
  getTodosOATC,
  getHistorialCliente,
} from "./repositories/oatc.repository";
export {
  ejecutarCierreDeDia,
} from "./repositories/cierre.repository";
export type { ResumenCierre } from "./repositories/cierre.repository";
export {
  descontarInventarioPorAtencion,
} from "./repositories/inventario.repository";
