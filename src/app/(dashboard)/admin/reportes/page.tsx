"use client";

import React, { useState, useEffect } from "react";
import { UserSession } from "@/lib/types";
import { KpiSummaryCards } from "@/components/reportes/KpiSummaryCards";
import { VentasTrendChart } from "@/components/reportes/VentasTrendChart";
import { ColaboradoresTable } from "@/components/reportes/ColaboradoresTable";
import { TopServiciosList } from "@/components/reportes/TopServiciosList";

type ReporteData = {
  kpis: {
    totalIngresosHistorico: number;
    totalIngresosHoy: number;
    totalIngresosMes: number;
    totalAtenciones: number;
    ticketPromedio: number;
    totalIngresosPeriodo: number;
  };
  ventasPorDia: Array<{ fecha: string; total: number; atenciones: number }>;
  desglosePorColaborador: Array<{
    id: string;
    nombre: string;
    atenciones: number;
    totalVentas: number;
    comisionEstimada: number;
  }>;
  serviciosMasVendidos: Array<{
    id: string;
    nombre: string;
    categoria: string;
    cantidad: number;
    total: number;
  }>;
  desglosePorCategoria: Array<{
    categoria: string;
    total: number;
    atenciones: number;
  }>;
};

export default function AdminReportesPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [periodo, setPeriodo] = useState("todo");
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [resUser, resRep] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/reportes?periodo=${periodo}`),
        ]);
        if (resUser.ok) {
          const uData = await resUser.json();
          setUser(uData.user);
        }
        if (resRep.ok) {
          const json = await resRep.json();
          setData(json);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [periodo]);

  if (user && user.rol !== "admin") {
    return (
      <div className="p-8 text-center text-rose-500 font-medium">
        No autorizado. Solo administradores pueden ver esta página.
      </div>
    );
  }

  const exportCSV = () => {
    if (!data) return;

    const rows = [
      ["Reporte", "Salón Élite"],
      ["Periodo", periodo],
      [],
      ["KPIs", "Valor"],
      ["Ingresos Totales (Periodo)", data.kpis.totalIngresosPeriodo],
      ["Ingresos Hoy", data.kpis.totalIngresosHoy],
      ["Ingresos Mes", data.kpis.totalIngresosMes],
      ["Ticket Promedio", data.kpis.ticketPromedio],
      ["Atenciones", data.kpis.totalAtenciones],
      [],
      ["Colaborador", "Atenciones", "Ventas", "Comision Estimada"],
      ...data.desglosePorColaborador.map((c) => [
        c.nombre,
        c.atenciones,
        c.totalVentas,
        c.comisionEstimada,
      ]),
      [],
      ["Servicio Mas Vendido", "Categoria", "Cantidad", "Total"],
      ...data.serviciosMasVendidos.map((s) => [
        s.nombre,
        s.categoria,
        s.cantidad,
        s.total,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fechaStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `reporte-salon-elite-${fechaStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalComisiones = data
    ? data.desglosePorColaborador.reduce(
        (acc, curr) => acc + curr.comisionEstimada,
        0
      )
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            Reportes Financieros y Métricas
          </h1>
          <p className="text-sm text-earth-500">
            Resumen general del rendimiento comercial y operativo del salón.
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!data || loading}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl shadow-sm text-xs font-semibold tracking-wide transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Selector de Periodo */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "todo", label: "Todo el Historial" },
          { id: "este_mes", label: "Este Mes" },
          { id: "ultimos_7", label: "Últimos 7 Días" },
          { id: "hoy", label: "Hoy" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPeriodo(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              periodo === tab.id
                ? "bg-earth-800 text-cream-100 shadow-sm"
                : "bg-white dark:bg-earth-900 text-earth-600 dark:text-cream-300 hover:bg-earth-100 dark:hover:bg-earth-800 border border-earth-200 dark:border-earth-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <div className="py-20 text-center text-sm text-earth-400 animate-pulse">
          Calculando métricas del periodo...
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <KpiSummaryCards
            totalIngresosPeriodo={data.kpis.totalIngresosPeriodo}
            ticketPromedio={data.kpis.ticketPromedio}
            totalAtenciones={data.kpis.totalAtenciones}
            totalComisiones={totalComisiones}
          />

          {/* Tendencia Diaria Chart */}
          <VentasTrendChart ventasPorDia={data.ventasPorDia} />

          {/* Grid: Colaboradores & Top Servicios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ColaboradoresTable colaboradores={data.desglosePorColaborador} />
            <TopServiciosList servicios={data.serviciosMasVendidos} />
          </div>
        </div>
      )}
    </div>
  );
}
