import React from "react";
import { formatCurrency } from "@/lib/utils";

export interface ColaboradorStat {
  id: string;
  nombre: string;
  atenciones: number;
  totalVentas: number;
  comisionEstimada: number;
}

interface ColaboradoresTableProps {
  colaboradores: ColaboradorStat[];
}

export function ColaboradoresTable({ colaboradores }: ColaboradoresTableProps) {
  return (
    <div className="bg-white dark:bg-earth-900 p-6 rounded-3xl shadow-sm border border-earth-200 dark:border-earth-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-earth-900 dark:text-cream-100">
            Rendimiento del Equipo
          </h2>
          <p className="text-xs text-earth-500">
            Producción individual y comisiones estimadas (40%).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-earth-700 dark:text-cream-200">
          <thead>
            <tr className="border-b border-earth-100 dark:border-earth-800 text-[11px] uppercase tracking-wider text-earth-400">
              <th className="pb-3 font-semibold">Colaborador</th>
              <th className="pb-3 font-semibold text-center">Atenciones</th>
              <th className="pb-3 font-semibold text-right">Ventas</th>
              <th className="pb-3 font-semibold text-right">Comisión (40%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-50 dark:divide-earth-800/60">
            {colaboradores.map((col) => (
              <tr
                key={col.id}
                className="hover:bg-earth-50/60 dark:hover:bg-earth-800/40 transition-colors"
              >
                <td className="py-3.5 pr-2 font-medium text-earth-900 dark:text-cream-100">
                  {col.nombre}
                </td>
                <td className="py-3.5 px-2 text-center text-earth-600 dark:text-cream-300">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-earth-100 dark:bg-earth-800 text-earth-700 dark:text-cream-200">
                    {col.atenciones}
                  </span>
                </td>
                <td className="py-3.5 px-2 text-right font-semibold text-earth-900 dark:text-cream-100">
                  {formatCurrency(col.totalVentas)}
                </td>
                <td className="py-3.5 pl-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(col.comisionEstimada)}
                </td>
              </tr>
            ))}
            {colaboradores.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-xs text-earth-400 italic"
                >
                  No se registraron atenciones en el periodo seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
