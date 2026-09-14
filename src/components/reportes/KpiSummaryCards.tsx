import React from "react";
import { formatCurrency } from "@/lib/utils";

interface KpiSummaryCardsProps {
  totalIngresosPeriodo: number;
  ticketPromedio: number;
  totalAtenciones: number;
  totalComisiones: number;
}

export function KpiSummaryCards({
  totalIngresosPeriodo,
  ticketPromedio,
  totalAtenciones,
  totalComisiones,
}: KpiSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-earth-900 p-5 rounded-2xl shadow-sm border border-earth-200 dark:border-earth-800">
        <p className="text-xs text-earth-500 font-medium uppercase tracking-wider">
          Ingresos en Periodo
        </p>
        <p className="text-2xl font-bold text-earth-900 dark:text-cream-100 mt-1">
          {formatCurrency(totalIngresosPeriodo)}
        </p>
      </div>

      <div className="bg-white dark:bg-earth-900 p-5 rounded-2xl shadow-sm border border-earth-200 dark:border-earth-800">
        <p className="text-xs text-earth-500 font-medium uppercase tracking-wider">
          Ticket Promedio
        </p>
        <p className="text-2xl font-bold text-earth-900 dark:text-cream-100 mt-1">
          {formatCurrency(ticketPromedio)}
        </p>
      </div>

      <div className="bg-white dark:bg-earth-900 p-5 rounded-2xl shadow-sm border border-earth-200 dark:border-earth-800">
        <p className="text-xs text-earth-500 font-medium uppercase tracking-wider">
          Atenciones Realizadas
        </p>
        <p className="text-2xl font-bold text-earth-900 dark:text-cream-100 mt-1">
          {totalAtenciones}
        </p>
      </div>

      <div className="bg-white dark:bg-earth-900 p-5 rounded-2xl shadow-sm border border-earth-200 dark:border-earth-800">
        <p className="text-xs text-earth-500 font-medium uppercase tracking-wider">
          Comisiones (Est. 40%)
        </p>
        <p className="text-2xl font-bold text-earth-900 dark:text-cream-100 mt-1">
          {formatCurrency(totalComisiones)}
        </p>
      </div>
    </div>
  );
}
