"use client";

import React, { useState, useEffect } from "react";
import {
  BorradorEntry,
  OATCRecord,
  Agente,
  SalonConfig,
  UserSession,
  CierreResumen,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  Users,
  DollarSign,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  Clock,
  CalendarCheck,
  CheckCircle2,
  RefreshCw,
  X,
  FileSpreadsheet,
  Archive,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { CobranzaModal } from "@/components/oatc/CobranzaModal";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [config, setConfig] = useState<SalonConfig | null>(null);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [borrador, setBorrador] = useState<BorradorEntry[]>([]);
  const [oatc, setOatc] = useState<OATCRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab de visualización de tablas: Borrador vs Histórico OATC
  const [tablaActiva, setTablaActiva] = useState<"borrador" | "oatc">("borrador");

  // Estado Modal de Cobranza (Caja)
  const [cobranzaOatc, setCobranzaOatc] = useState<BorradorEntry | null>(null);

  // Estados Cierre de Día
  const [confirmCierreOpen, setConfirmCierreOpen] = useState(false);
  const [ejecutandoCierre, setEjecutandoCierre] = useState(false);
  const [cierreResultado, setCierreResultado] = useState<CierreResumen | null>(null);
  const [cierreError, setCierreError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resUser, resConf, resAg, resBorr, resOatc] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/configuracion"),
        fetch("/api/agentes"),
        fetch("/api/borrador"),
        fetch("/api/oatc"),
      ]);

      const dataUser = await resUser.json();
      const dataConf = await resConf.json();
      const dataAg = await resAg.json();
      const dataBorr = await resBorr.json();
      const dataOatc = await resOatc.json();

      if (dataUser.user) setUser(dataUser.user);
      if (dataConf.config) setConfig(dataConf.config);
      if (dataAg.agentes) setAgentes(dataAg.agentes);
      if (dataBorr.borrador) setBorrador(dataBorr.borrador);
      if (dataOatc.oatc) setOatc(dataOatc.oatc);
    } catch (err) {
      console.error("Error cargando dashboard admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEjecutarCierre = async () => {
    setEjecutandoCierre(true);
    setCierreError(null);
    try {
      const res = await fetch("/api/cierre", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCierreResultado(data.resumen);
        setConfirmCierreOpen(false);
        await cargarDatos();
      } else {
        setCierreError(data.error || "Error al ejecutar cierre");
      }
    } catch {
      setCierreError("Error de red al ejecutar cierre");
    } finally {
      setEjecutandoCierre(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmCierreOpen && !ejecutandoCierre) {
        setConfirmCierreOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmCierreOpen, ejecutandoCierre]);

  const totalVentasBorrador = borrador.reduce(
    (acc, curr) => acc + (Number(curr.precio_final) || 0),
    0
  );
  const totalAtencionesBorrador = borrador.length;
  const atencionesCompletadasBorrador = borrador.filter(
    (b) => b.etapa === "completada"
  ).length;

  const totalVentasOatc = oatc.reduce(
    (acc, curr) => acc + (Number(curr.precio_final) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-earth-500" />
            <span>Panel de Administración Global</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
            {config?.nombre_salon || "Salón Élite & Spa"}
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Sincronización en tiempo real con pestañas <strong>Borrador</strong> y <strong>OATC</strong> de Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-600 transition-colors"
            title="Recargar datos de Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Botón Cierre de Día */}
          <button
            onClick={() => setConfirmCierreOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-earth-800 hover:bg-earth-900 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>Ejecutar Cierre de Día</span>
          </button>
        </div>
      </div>

      {/* Resultado de Cierre Banner */}
      {cierreResultado && (
        <div className="p-5 rounded-2xl bg-sage-50 dark:bg-sage-950/70 border border-sage-300 dark:border-sage-800 text-sage-900 dark:text-sage-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-sage-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">
                ¡Cierre de día completado con éxito ({cierreResultado.fecha})!
              </h4>
              <p className="text-[11px] text-sage-700 dark:text-sage-400 mt-0.5">
                Se migraron <strong>{cierreResultado.totalOatcsMigradas} órdenes</strong> a la pestaña{" "}
                <strong>OATC</strong> por un total de{" "}
                <strong>{formatCurrency(cierreResultado.totalVentasMigradas)}</strong> y se limpió el
                Borrador.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCierreResultado(null)}
            className="text-xs font-bold text-sage-700 hover:text-sage-900"
          >
            Cerrar
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-earth-300 border-t-earth-800 rounded-full animate-spin" />
          <p className="text-sm text-earth-600 dark:text-earth-400 font-medium animate-pulse">
            Consultando Google Sheets en tiempo real...
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Ingresos Borrador */}
            <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-earth-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Ingresos en Borrador
                </span>
                <DollarSign className="w-5 h-5 text-earth-500" />
              </div>
              <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
                {formatCurrency(totalVentasBorrador)}
              </div>
              <p className="text-[11px] text-earth-500 mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                Hoja Google Sheets: <strong>Borrador</strong>
              </p>
            </div>

            {/* Card 2: Órdenes de Hoy */}
            <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-earth-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Órdenes en Borrador
                </span>
                <ClipboardList className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
                {totalAtencionesBorrador}
              </div>
              <p className="text-[11px] text-earth-500 mt-1">
                {atencionesCompletadasBorrador} completadas hoy
              </p>
            </div>

            {/* Card 3: Histórico OATC */}
            <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-earth-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Histórico OATC
                </span>
                <Archive className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
                {oatc.length}
              </div>
              <p className="text-[11px] text-earth-500 mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Hoja Google Sheets: <strong>OATC</strong> ({formatCurrency(totalVentasOatc)})
              </p>
            </div>

            {/* Card 4: Colaboradores */}
            <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-earth-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Colaboradores
                </span>
                <Users className="w-5 h-5 text-sage-600" />
              </div>
              <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
                {agentes.filter((a) => a.activo).length}
              </div>
              <Link
                href="/admin/agentes"
                className="text-[11px] text-earth-600 hover:underline flex items-center gap-1 mt-1 font-semibold"
              >
                Administrar equipo <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Selector de Pestañas Google Sheets: Borrador vs OATC */}
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-100 dark:border-earth-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
                    {tablaActiva === "borrador"
                      ? "Órdenes Activas de Hoy"
                      : "Histórico Consolidado de Atenciones"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sage-50 text-sage-700 border border-sage-200 dark:bg-sage-950 dark:text-sage-300 dark:border-sage-800">
                    Pestaña Sheets: {tablaActiva === "borrador" ? "Borrador" : "OATC"}
                  </span>
                </div>
                <p className="text-xs text-earth-500 dark:text-earth-400 mt-0.5">
                  {tablaActiva === "borrador"
                    ? "Atenciones en curso del día. Al ejecutar Cierre de Día, migran a la pestaña OATC."
                    : "Registro permanente acumulado de atenciones completadas y cerradas."}
                </p>
              </div>

              {/* Toggle de Pestañas */}
              <div className="flex items-center gap-1.5 p-1 bg-earth-100 dark:bg-earth-800 rounded-xl">
                <button
                  onClick={() => setTablaActiva("borrador")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tablaActiva === "borrador"
                      ? "bg-white dark:bg-earth-900 text-earth-900 dark:text-cream-100 shadow-xs"
                      : "text-earth-600 dark:text-earth-400 hover:text-earth-900"
                  }`}
                >
                  Borrador ({borrador.length})
                </button>
                <button
                  onClick={() => setTablaActiva("oatc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tablaActiva === "oatc"
                      ? "bg-white dark:bg-earth-900 text-earth-900 dark:text-cream-100 shadow-xs"
                      : "text-earth-600 dark:text-earth-400 hover:text-earth-900"
                  }`}
                >
                  Histórico OATC ({oatc.length})
                </button>
              </div>
            </div>

            {/* TABLA BORRADOR */}
            {tablaActiva === "borrador" && (
              <>
                {borrador.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-earth-200 dark:border-earth-800 rounded-2xl">
                    <p className="text-xs font-medium text-earth-500 dark:text-earth-400">
                      La pestaña <strong>Borrador</strong> en Google Sheets está vacía.
                    </p>
                    <p className="text-[11px] text-earth-400 mt-1">
                      No hay atenciones en curso en este momento (día cerrado o sin turnos registrados hoy).
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-earth-50 dark:bg-earth-950 text-earth-700 dark:text-earth-300 font-semibold border-b border-earth-200 dark:border-earth-800">
                        <tr>
                          <th className="p-3">ID OATC</th>
                          <th className="p-3">Hora</th>
                          <th className="p-3">Consumidor</th>
                          <th className="p-3">Colaborador</th>
                          <th className="p-3">Servicio</th>
                          <th className="p-3">Etapa</th>
                          <th className="p-3">Comprobante</th>
                          <th className="p-3 text-right">Precio Final</th>
                          <th className="p-3 text-center">Acción / Cobro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-earth-100 dark:divide-earth-800/60">
                        {borrador.map((row) => (
                          <tr
                            key={row.id_oatc}
                            className="hover:bg-earth-50/50 dark:hover:bg-earth-900/50"
                          >
                            <td className="p-3 font-mono font-semibold text-earth-600 dark:text-earth-400">
                              {row.id_oatc}
                            </td>
                            <td className="p-3">{row.hora_inicio}</td>
                            <td className="p-3 font-medium text-earth-900 dark:text-cream-100">
                              {row.nombre_consumidor}
                            </td>
                            <td className="p-3">{row.nombre_agente}</td>
                            <td className="p-3 font-medium">{row.nombre_servicio}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-earth-100 dark:bg-earth-800 text-earth-800 dark:text-cream-200">
                                {row.etapa}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-earth-600">
                              {row.comprobante_externo || "--"}
                            </td>
                            <td className="p-3 text-right font-bold text-earth-900 dark:text-cream-100">
                              {formatCurrency(row.precio_final)}
                            </td>
                            <td className="p-3 text-center">
                              {row.etapa === "fin_atencion" ? (
                                <button
                                  onClick={() => setCobranzaOatc(row)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 transition-all active:scale-95 animate-pulse"
                                  title="El estilista finalizó la atención. Proceder al cobro en caja con número de comprobante."
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Cobrar en Caja</span>
                                </button>
                              ) : row.etapa === "completada" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Cobrada ({row.comprobante_externo || "OK"})</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => setCobranzaOatc(row)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-earth-100 dark:bg-earth-800 hover:bg-earth-200 dark:hover:bg-earth-700 text-earth-700 dark:text-cream-200 text-xs font-semibold transition-colors"
                                  title="Cobro directo o anticipado en caja"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Cobro Caja</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* TABLA HISTÓRICO OATC */}
            {tablaActiva === "oatc" && (
              <>
                {oatc.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-earth-200 dark:border-earth-800 rounded-2xl">
                    <p className="text-xs font-medium text-earth-500 dark:text-earth-400">
                      La pestaña <strong>OATC</strong> en Google Sheets está vacía.
                    </p>
                    <p className="text-[11px] text-earth-400 mt-1">
                      Los registros se transfieren aquí automáticamente cuando ejecutas el &ldquo;Cierre de Día&rdquo;.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-earth-50 dark:bg-earth-950 text-earth-700 dark:text-earth-300 font-semibold border-b border-earth-200 dark:border-earth-800">
                        <tr>
                          <th className="p-3">ID OATC</th>
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Hora</th>
                          <th className="p-3">Consumidor</th>
                          <th className="p-3">Colaborador</th>
                          <th className="p-3">Servicio</th>
                          <th className="p-3">Comprobante</th>
                          <th className="p-3 text-right">Precio Final</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-earth-100 dark:divide-earth-800/60">
                        {oatc.map((row) => (
                          <tr
                            key={row.id_oatc}
                            className="hover:bg-earth-50/50 dark:hover:bg-earth-900/50"
                          >
                            <td className="p-3 font-mono font-semibold text-earth-600 dark:text-earth-400">
                              {row.id_oatc}
                            </td>
                            <td className="p-3 font-mono">{row.fecha}</td>
                            <td className="p-3">{row.hora_inicio}</td>
                            <td className="p-3 font-medium text-earth-900 dark:text-cream-100">
                              {row.nombre_consumidor}
                            </td>
                            <td className="p-3">{row.nombre_agente}</td>
                            <td className="p-3 font-medium">{row.nombre_servicio}</td>
                            <td className="p-3 font-mono text-earth-600">
                              {row.comprobante_externo || "--"}
                            </td>
                            <td className="p-3 text-right font-bold text-earth-900 dark:text-cream-100">
                              {formatCurrency(row.precio_final)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Modal Confirmación Cierre */}
      {confirmCierreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-cierre-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !ejecutandoCierre) {
              setConfirmCierreOpen(false);
            }
          }}
        >
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-earth-900 dark:text-cream-100 font-bold">
                <CalendarCheck className="w-5 h-5 text-amber-500" />
                <h3 id="modal-cierre-title">Confirmar Cierre de Día</h3>
              </div>
              <button
                disabled={ejecutandoCierre}
                onClick={() => setConfirmCierreOpen(false)}
                className="p-1 rounded-lg text-earth-400 hover:text-earth-600 hover:bg-earth-100 dark:hover:bg-earth-800 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-earth-600 dark:text-earth-400">
              Esta acción migrará las órdenes completadas de la pestaña <strong>Borrador</strong> a{" "}
              <strong>OATC</strong> en Google Sheets y reiniciará el Borrador para el siguiente día.
            </p>

            <div className="bg-earth-50 dark:bg-earth-950 p-4 rounded-2xl border border-earth-200 dark:border-earth-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-earth-500">Órdenes a migrar:</span>
                <span className="font-bold text-earth-900 dark:text-cream-100">
                  {atencionesCompletadasBorrador} de {borrador.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-500">Venta a consolidar:</span>
                <span className="font-bold text-earth-900 dark:text-cream-100">
                  {formatCurrency(totalVentasBorrador)}
                </span>
              </div>
            </div>

            {cierreError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {cierreError}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button
                disabled={ejecutandoCierre}
                onClick={() => setConfirmCierreOpen(false)}
                className="px-4 py-2 rounded-xl border border-earth-200 text-xs font-semibold text-earth-600 hover:bg-earth-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                disabled={ejecutandoCierre}
                onClick={handleEjecutarCierre}
                className="px-5 py-2 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {ejecutandoCierre ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Migrando a OATC...</span>
                  </>
                ) : (
                  <span>Ejecutar Cierre Ahora</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cobranza en Caja */}
      <CobranzaModal
        isOpen={!!cobranzaOatc}
        onClose={() => setCobranzaOatc(null)}
        oatc={cobranzaOatc}
        onSuccess={async () => {
          setCobranzaOatc(null);
          await cargarDatos();
        }}
      />
    </div>
  );
}
