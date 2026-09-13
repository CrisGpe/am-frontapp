"use client";

import React, { useState, useEffect } from "react";
import { BorradorEntry, Agente } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Receipt,
  User,
  Clock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function AdminBorradorPage() {
  const [borrador, setBorrador] = useState<BorradorEntry[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [agenteFiltro, setAgenteFiltro] = useState("todos");
  const [etapaFiltro, setEtapaFiltro] = useState("todas");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resBorr, resAg] = await Promise.all([
        fetch("/api/borrador"),
        fetch("/api/agentes"),
      ]);
      const dataBorr = await resBorr.json();
      const dataAg = await resAg.json();

      if (dataBorr.borrador) setBorrador(dataBorr.borrador);
      if (dataAg.agentes) setAgentes(dataAg.agentes);
    } catch (err) {
      console.error("Error cargando borrador:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtrados = borrador.filter((item) => {
    const matchBusqueda =
      item.nombre_consumidor.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.nombre_servicio.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.id_oatc.toLowerCase().includes(busqueda.toLowerCase());

    const matchAgente =
      agenteFiltro === "todos" || item.id_agente === agenteFiltro;

    const matchEtapa =
      etapaFiltro === "todas" || item.etapa === etapaFiltro;

    return matchBusqueda && matchAgente && matchEtapa;
  });

  const totalFiltrado = filtrados.reduce(
    (acc, curr) => acc + (Number(curr.precio_final) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-earth-600 hover:text-earth-900 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al panel admin
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
            Centro Operativo: Hoja Borrador
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Registro diario en tiempo real. Al ejecutar el cierre nocturno, estas órdenes migran a OATC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarDatos}
            className="p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-600 transition-colors"
            title="Recargar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controles de Filtros */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, servicio u OATC..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
          />
        </div>

        {/* Filtro por Colaborador */}
        <select
          value={agenteFiltro}
          onChange={(e) => setAgenteFiltro(e.target.value)}
          className="w-full p-2 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
        >
          <option value="todos">Todos los colaboradores</option>
          {agentes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>

        {/* Filtro por Etapa */}
        <select
          value={etapaFiltro}
          onChange={(e) => setEtapaFiltro(e.target.value)}
          className="w-full p-2 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
        >
          <option value="todas">Todas las etapas</option>
          <option value="asesoria">1. Asesoría</option>
          <option value="atencion">2. En Atención</option>
          <option value="fin_atencion">3. Fin Atención</option>
          <option value="cobranza">4. En Cobranza</option>
          <option value="completada">5. Completada</option>
        </select>
      </div>

      {/* Tabla del Borrador */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-earth-700 dark:text-earth-300">
            Mostrando {filtrados.length} de {borrador.length} órdenes en Borrador
          </span>
          <span className="text-xs font-bold text-earth-900 dark:text-cream-100">
            Total en vista: {formatCurrency(totalFiltrado)}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-earth-500">Cargando borrador...</div>
        ) : filtrados.length === 0 ? (
          <div className="py-10 text-center text-xs text-earth-500 border border-dashed border-earth-200 rounded-2xl">
            No se encontraron atenciones con los filtros seleccionados.
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
                {filtrados.map((row) => (
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-earth-100 dark:bg-earth-800 text-earth-800 dark:text-cream-200">
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
    </div>
  );
}
