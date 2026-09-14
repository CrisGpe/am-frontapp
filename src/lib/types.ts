export type RolAgente = "admin" | "agente";

export type TipoConsumidor = "cliente" | "turno";

export type EtapaOATC = "asesoria" | "atencion" | "fin_atencion" | "cobranza" | "completada";

export type EstadoAsistencia = "presente" | "ausente" | "tardia";

export type EstadoCita = "pendiente" | "confirmada" | "cancelada" | "completada";

export interface HorariosSemana {
  horario_lun?: string;
  horario_mar?: string;
  horario_mie?: string;
  horario_jue?: string;
  horario_vie?: string;
  horario_sab?: string;
  horario_dom?: string;
}

export interface Agente extends HorariosSemana {
  id: string; // ej: AG-001
  nombre: string;
  pin: string; // 4 dígitos
  rol: RolAgente;
  especialidades: string[]; // ['estilista', 'colorista']
  telefono?: string;
  email?: string;
  disponible_turnos: boolean;
  activo: boolean;
}

export interface Cliente {
  id: string; // ej: CL-001
  nombre: string;
  pin: string; // 4 dígitos
  telefono?: string;
  email?: string;
  agente_preferido?: string; // ID de agente
  notas?: string;
  fecha_registro: string;
  activo: boolean;
}

export interface Servicio {
  id: string; // ej: SV-001
  nombre: string;
  categoria: "cabello" | "uñas" | "facial" | "corporal" | "otro";
  especialidad_requerida: string; // ej: 'estilista', 'colorista', 'manicurista'
  duracion_min: number;
  precio_base: number;
  descripcion?: string;
  activo: boolean;
}

export interface Producto {
  id: string; // ej: PR-001
  nombre: string;
  categoria: string;
  marca: string;
  precio_venta: number;
  stock: number;
  activo: boolean;
}

export interface Insumo {
  id: string; // ej: IN-001
  nombre: string;
  categoria: string;
  unidad_medida: string;
  stock: number;
  costo_unitario: number;
  activo: boolean;
}

export interface BorradorEntry {
  id_oatc: string; // OATC-YYYYMMDD-001
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:mm
  tipo_consumidor: TipoConsumidor;
  id_cliente?: string;
  nombre_consumidor: string;
  id_agente: string;
  nombre_agente: string;
  id_servicio: string;
  nombre_servicio: string;
  etapa: EtapaOATC;
  precio_final: number;
  productos_usados?: string; // ej: "PR-001:1,PR-002:2"
  insumos_usados?: string; // ej: "IN-001:50ml"
  productos_vendidos?: string; // ej: "PR-003:1"
  correlativo_sistema: string;
  comprobante_externo?: string;
  notas?: string;
  hora_fin?: string;
}

export interface OATCRecord extends BorradorEntry {
  migrado_en: string;
}

export interface AsistenciaRecord {
  fecha: string;
  id_agente: string;
  nombre_agente: string;
  hora_checkin: string;
  hora_checkout?: string;
  estado: EstadoAsistencia;
  latitud?: number;
  longitud?: number;
  distancia_metros?: number;
  alerta_ubicacion?: boolean;
}

export interface CitaRecord {
  id: string; // CT-001
  id_cliente: string;
  id_agente: string;
  id_servicio: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  creada_en: string;
  notas?: string;
}

export interface TurnoEspera {
  id: string; // TRN-001
  nombre_consumidor: string;
  id_servicio: string;
  nombre_servicio: string;
  especialidad_requerida: string;
  fecha: string;
  hora_llegada: string;
  estado: "en_espera" | "atendido" | "cancelado";
  notas?: string;
  agente_asignado_id?: string;
  id_oatc_creada?: string;
}

export interface SalonConfig {
  nombre_salon: string;
  hora_cierre_auto: string;
  zona_horaria: string;
  correlativo_actual: number;
}

export interface UserSession {
  userId: string;
  nombre: string;
  tipo: "agente" | "cliente";
  rol?: RolAgente;
  especialidades?: string[];
}

export interface CierreResumen {
  fecha: string;
  totalOatcsMigradas: number;
  totalVentasMigradas: number;
  totalAsistencias: number;
  mensaje: string;
}

export interface TurnoConSugerencia extends TurnoEspera {
  servicio?: Servicio;
  agenteSugerido?: {
    id: string;
    nombre: string;
    prioridadScore: number;
    enAtencionActiva: boolean;
    especialidadesMatch: boolean;
  };
}
