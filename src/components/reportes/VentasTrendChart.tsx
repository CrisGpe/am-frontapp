import React from "react";
import { formatCurrency } from "@/lib/utils";

interface VentaDia {
  fecha: string;
  total: number;
  atenciones: number;
}

interface VentasTrendChartProps {
  ventasPorDia: VentaDia[];
}

export function VentasTrendChart({ ventasPorDia }: VentasTrendChartProps) {
  const maxTotalVenta = Math.max(...ventasPorDia.map((d) => d.total), 1);

  return (
    <div className="bg-white dark:bg-earth-900 p-6 rounded-3xl shadow-sm border border-earth-200 dark:border-earth-800">
      <h2 className="text-base font-bold text-earth-900 dark:text-cream-100 mb-1">
        Tendencia Diaria de Ventas
      </h2>
      <p className="text-xs text-earth-500 mb-6">
        Evolución de ingresos y volumen de atenciones en los últimos 14 días.
      </p>

      <div className="h-64 w-full flex items-end justify-between gap-1.5 sm:gap-2">
        {ventasPorDia.map((d, idx) => {
          const heightPorcentaje = Math.max((d.total / maxTotalVenta) * 100, 3);
          const dateParts = d.fecha.split("-");
          const label =
            dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : d.fecha;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col justify-end items-center group relative h-full"
            >
              {/* Tooltip flotante */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-earth-900 text-cream-100 text-[10px] p-2 rounded-xl pointer-events-none whitespace-nowrap z-20 shadow-lg border border-earth-700">
                <span className="font-bold block">{d.fecha}</span>
                <span>{formatCurrency(d.total)} ({d.atenciones} aten.)</span>
              </div>

              {/* Barra interactiva */}
              <div
                className="w-full bg-earth-500 hover:bg-earth-600 dark:bg-earth-600 dark:hover:bg-earth-500 rounded-t-lg transition-all duration-200 group-hover:shadow-md"
                style={{ height: `${heightPorcentaje}%` }}
              />

              {/* Etiqueta Eje X */}
              <div className="text-[10px] text-earth-400 mt-2 truncate w-full text-center font-medium">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
