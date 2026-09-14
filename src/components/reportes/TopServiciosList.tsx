import React from "react";
import { formatCurrency } from "@/lib/utils";

export interface ServicioVendido {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  total: number;
}

interface TopServiciosListProps {
  servicios: ServicioVendido[];
}

export function TopServiciosList({ servicios }: TopServiciosListProps) {
  const maxVenta = servicios[0]?.total || 1;

  return (
    <div className="bg-white dark:bg-earth-900 p-6 rounded-3xl shadow-sm border border-earth-200 dark:border-earth-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-earth-900 dark:text-cream-100">
            Servicios Más Solicitados
          </h2>
          <p className="text-xs text-earth-500">
            Ranking de servicios por facturación y volumen.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {servicios.slice(0, 6).map((serv) => {
          const porcentaje = Math.min(
            100,
            Math.round((serv.total / maxVenta) * 100)
          );

          return (
            <div key={serv.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-earth-900 dark:text-cream-100">
                    {serv.nombre}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-cream-300">
                    {serv.categoria}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-earth-900 dark:text-cream-100">
                    {formatCurrency(serv.total)}
                  </span>
                  <span className="text-[10px] text-earth-400 block">
                    {serv.cantidad} atenciones
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-earth-100 dark:bg-earth-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-earth-500 dark:bg-earth-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(porcentaje, 4)}%` }}
                />
              </div>
            </div>
          );
        })}

        {servicios.length === 0 && (
          <div className="py-8 text-center text-xs text-earth-400 italic">
            No se registraron ventas en el periodo seleccionado.
          </div>
        )}
      </div>
    </div>
  );
}
