"use client";

import React, { useState, useEffect } from "react";
import { BorradorEntry, Agente, SalonConfig, UserSession } from "@/lib/types";
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
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [config, setConfig] = useState<SalonConfig | null>(null);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [borrador, setBorrador] = useState<BorradorEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados Cierre de Día
  const [confirmCierreOpen, setConfirmCierreOpen] = useState(false);
  const [ejecutandoCierre, setEjecutandoCierre] = useState(false);
  const [cierreResultado, setCierreResultado] = useState<any | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resUser, resConf, resAg, resBorr] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/configuracion"),
        fetch("/api/agentes"),
        fetch("/api/borrador"),
      ]);

      const dataUser = await resUser.json();
      const dataConf = await resConf.json();
      const dataAg = await resAg.json();
      const dataBorr = await resBorr.json();

      if (dataUser.user) setUser(dataUser.user);
      if (dataConf.config) setConfig(dataConf.config);
      if (dataAg.agentes) setAgentes(dataAg.agentes);
      if (dataBorr.borrador) setBorrador(dataBorr.borrador);
    } catch (err) {
      console.error("Error cargando dashboard admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEjecutarCierre = async () => {
    setEjecutandoCierre(true);
    try {
      const res = await fetch("/api/cierre", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCierreResultado(data.resumen);
        setConfirmCierreOpen(false);
        await cargarDatos();
      } else {
        alert(data.error || "Error al ejecutar cierre");
      }
    } catch (err) {
      alert("Error de red al ejecutar cierre");
    } finally {
      setEjecutandoCierre(false);
    }
  };

  const totalVentas = borrador.reduce(
    (acc, curr) => acc + (Number(curr.precio_final) || 0),
    0
  );
  const totalAtenciones = borrador.length;
  const atencionesCompletadas = borrador.filter((b) => b.etapa === "completada").length;

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
            Gestión en tiempo real de operaciones, colaboradores y cierre diario.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarDatos}
            className="p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-600 transition-colors"
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-earth-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos en Borrador</span>
            <DollarSign className="w-5 h-5 text-earth-500" />
          </div>
          <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            {formatCurrency(totalVentas)}
          </div>
          <p className="text-[11px] text-earth-500 mt-1">Acumulado del día actual</p>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-earth-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total OATCs Hoy</span>
            <ClipboardList className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            {totalAtenciones}
          </div>
          <p className="text-[11px] text-earth-500 mt-1">{atencionesCompletadas} completadas y cobradas</p>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-earth-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Colaboradores</span>
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

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-earth-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cierre Automático</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-earth-900 dark:text-cream-100">
            {config?.hora_cierre_auto || "22:00"} hrs
          </div>
          <p className="text-[11px] text-earth-500 mt-1">Configurado en Vercel Cron</p>
        </div>
      </div>

      {/* Daily Operations (Borrador Table) */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
              Operaciones en Borrador del Día ({borrador.length})
            </h2>
            <p className="text-xs text-earth-500 dark:text-earth-400">
              Datos activos que migrarán a la hoja histórica OATC en el cierre de día
            </p>
          </div>
          <Link
            href="/admin/borrador"
            className="text-xs font-bold text-earth-600 hover:text-earth-900 flex items-center gap-1"
          >
            Ver tabla completa & filtros <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {borrador.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-earth-200 rounded-2xl text-xs text-earth-500">
            El Borrador se encuentra vacío (día cerrado o sin atenciones aún).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-earth-50 dark:bg-earth-950 text-earth-700 dark:text-earth-300 font-semibold border-b border-earth-200 dark:border-earth-800">
                <tr>
                  <th className="p-3">OATC</th>
                  <th className="p-3">Hora</th>
                  <th className="p-3">Consumidor</th>
                  <th className="p-3">Colaborador</th>
                  <th className="p-3">Servicio</th>
                  <th className="p-3">Etapa</th>
                  <th className="p-3">Comprobante</th>
                  <th className="p-3 text-right">Precio Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 dark:divide-earth-800/60">
                {borrador.map((row) => (
                  <tr key={row.id_oatc} className="hover:bg-earth-50/50 dark:hover:bg-earth-900/50">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Confirmación Cierre */}
      {confirmCierreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-earth-900 dark:text-cream-100">
                ¿Ejecutar Cierre de Día Manual?
              </h3>
            </div>
            <p className="text-xs text-earth-600 dark:text-earth-400 leading-relaxed mb-4">
              Esta acción migrará las <strong>{borrador.length} órdenes</strong> activas del{" "}
              <strong>Borrador</strong> hacia la pestaña <strong>OATC</strong> y archivará la{" "}
              <strong>Asistencia</strong> del día. La pestaña Borrador quedará vacía para la
              operación del día de mañana.
            </p>

            <div className="p-3 rounded-xl bg-earth-50 dark:bg-earth-950 text-xs text-earth-700 dark:text-cream-200 mb-6 space-y-1">
              <p>
                Total a migrar: <strong>{formatCurrency(totalVentas)}</strong>
              </p>
              <p>
                Órdenes completadas: <strong>{atencionesCompletadas}</strong> / {borrador.length}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmCierreOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-earth-200 text-xs font-semibold text-earth-700 hover:bg-earth-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={ejecutandoCierre}
                onClick={handleEjecutarCierre}
                className="px-5 py-2.5 rounded-xl bg-earth-800 hover:bg-earth-900 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
              >
                {ejecutandoCierre ? "Migrando datos..." : "Confirmar y Ejecutar Cierre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
