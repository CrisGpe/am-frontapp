"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { UserSession } from "@/lib/types";

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
          fetch('/api/auth/me'),
          fetch(`/api/reportes?periodo=${periodo}`)
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

  if (user?.rol !== "admin") {
    return (
      <div className="p-4 text-center text-red-500">
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

  const maxTotalVentaPorDia = data
    ? Math.max(...data.ventasPorDia.map((d) => d.total), 1)
    : 1;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes Financieros</h1>
          <p className="text-slate-500">
            Resumen general del rendimiento del salón.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow-sm text-sm"
        >
          Exportar CSV
        </button>
      </div>

      {/* Filtro Periodo */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { id: "todo", label: "Todo" },
          { id: "este_mes", label: "Este Mes" },
          { id: "ultimos_7", label: "Últimos 7 días" },
          { id: "hoy", label: "Hoy" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPeriodo(tab.id)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              periodo === tab.id
                ? "bg-indigo-600 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <div className="text-center py-10 text-slate-500">Cargando reporte...</div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Ingresos (Periodo)</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(data.kpis.totalIngresosPeriodo)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Ticket Promedio</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(data.kpis.ticketPromedio)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Atenciones Completadas</p>
              <p className="text-2xl font-bold text-slate-800">
                {data.kpis.totalAtenciones}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">Comisiones (Est. 40%)</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(
                  data.desglosePorColaborador.reduce(
                    (acc, curr) => acc + curr.comisionEstimada,
                    0
                  )
                )}
              </p>
            </div>
          </div>

          {/* Grafico CSS */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Tendencia de Ventas (Últimos 14 días)
            </h2>
            <div className="h-64 w-full flex items-end justify-between gap-1 mt-4">
              {data.ventasPorDia.map((d, idx) => {
                const heightPorcentaje = Math.max(
                  (d.total / maxTotalVentaPorDia) * 100,
                  2
                ); // Min 2% para que se vea
                const dateParts = d.fecha.split("-");
                const label = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : d.fecha;
                return (
                  <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-800 text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap z-10">
                      {d.fecha}: {formatCurrency(d.total)} ({d.atenciones} aten.)
                    </div>
                    {/* Barra */}
                    <div
                      className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors"
                      style={{ height: `${heightPorcentaje}%` }}
                    ></div>
                    {/* Etiqueta Eje X */}
                    <div className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rendimiento Colaboradores */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">
                Rendimiento de Colaboradores
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-3 font-medium">Nombre</th>
                      <th className="p-3 font-medium text-center">Atenciones</th>
                      <th className="p-3 font-medium text-right">Ventas</th>
                      <th className="p-3 font-medium text-right">Comisión (40%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.desglosePorColaborador.map((col) => (
                      <tr key={col.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-3">{col.nombre}</td>
                        <td className="p-3 text-center">{col.atenciones}</td>
                        <td className="p-3 text-right font-semibold text-slate-700">
                          {formatCurrency(col.totalVentas)}
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-medium">
                          {formatCurrency(col.comisionEstimada)}
                        </td>
                      </tr>
                    ))}
                    {data.desglosePorColaborador.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-500">
                          No hay datos en el periodo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Servicios Más Vendidos */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">
                Servicios Más Vendidos
              </h2>
              <div className="space-y-4">
                {data.serviciosMasVendidos.slice(0, 5).map((serv) => {
                  const maxVenta = data.serviciosMasVendidos[0]?.total || 1;
                  const porcentaje = Math.min(100, Math.round((serv.total / maxVenta) * 100));
                  return (
                    <div key={serv.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">
                          {serv.nombre} <span className="text-slate-500 font-normal">({serv.cantidad} atenciones)</span>
                        </span>
                        <span className="text-slate-700 font-semibold">
                          {formatCurrency(serv.total)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {data.serviciosMasVendidos.length === 0 && (
                  <div className="text-center text-slate-500 py-4">
                    No hay datos en el periodo.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
