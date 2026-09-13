import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { getBorrador, getAgentes, getSalonConfig } from "@/lib/google-sheets";
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
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const config = await getSalonConfig();
  const agentes = await getAgentes();
  const borrador = await getBorrador();

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
            {config.nombre_salon}
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Gestión en tiempo real de operaciones, colaboradores y cierre diario.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-earth-50 dark:bg-earth-950 border border-earth-200 dark:border-earth-800 px-4 py-2.5 rounded-2xl text-xs">
          <Clock className="w-4 h-4 text-earth-500" />
          <span className="text-earth-700 dark:text-earth-300 font-medium">
            Cierre auto programado: <strong>{config.hora_cierre_auto} hrs</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-earth-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos Hoy</span>
            <DollarSign className="w-5 h-5 text-earth-500" />
          </div>
          <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            {formatCurrency(totalVentas)}
          </div>
          <p className="text-[11px] text-earth-500 mt-1">Basado en atenciones del Borrador</p>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-earth-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total OATCs</span>
            <ClipboardList className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            {totalAtenciones}
          </div>
          <p className="text-[11px] text-earth-500 mt-1">{atencionesCompletadas} completadas</p>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-earth-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Colaboradores</span>
            <Users className="w-5 h-5 text-sage-600" />
          </div>
          <div className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            {agentes.filter((a) => a.activo).length}
          </div>
          <p className="text-[11px] text-earth-500 mt-1">Activos en el sistema</p>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-earth-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cierre de Día</span>
            <CalendarCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-sage-600 dark:text-sage-400">
            Borrador Operativo
          </div>
          <p className="text-[11px] text-earth-500 mt-1">Listo para migración OATC</p>
        </div>
      </div>

      {/* Daily Operations (Borrador Table) */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
              Operaciones en Borrador del Día
            </h2>
            <p className="text-xs text-earth-500 dark:text-earth-400">
              Datos que migrarán a la hoja histórica OATC en el cierre
            </p>
          </div>
        </div>

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
                <th className="p-3 text-right">Precio</th>
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
                  <td className="p-3 text-right font-bold text-earth-900 dark:text-cream-100">
                    {formatCurrency(row.precio_final)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
