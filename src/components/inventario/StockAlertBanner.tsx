import React from "react";
import { Package, Droplet, AlertTriangle } from "lucide-react";

interface StockAlertBannerProps {
  totalProductos: number;
  totalInsumos: number;
  totalAlertas: number;
}

export function StockAlertBanner({
  totalProductos,
  totalInsumos,
  totalAlertas,
}: StockAlertBannerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-600 dark:text-earth-300">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-earth-500 font-medium block">
            Productos en Catálogo
          </span>
          <span className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            {totalProductos}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-600 dark:text-earth-300">
          <Droplet className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-earth-500 font-medium block">
            Insumos de Trabajo
          </span>
          <span className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            {totalInsumos}
          </span>
        </div>
      </div>

      <div
        className={`border rounded-2xl p-5 shadow-sm flex items-center gap-4 ${
          totalAlertas > 0
            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
            : "bg-white dark:bg-earth-900 border-earth-200 dark:border-earth-800"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            totalAlertas > 0
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
              : "bg-earth-100 text-earth-600"
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-earth-500 font-medium block">
            Stock Bajo (≤ 3 unidades)
          </span>
          <span
            className={`text-2xl font-bold ${
              totalAlertas > 0
                ? "text-amber-700 dark:text-amber-300"
                : "text-earth-900 dark:text-cream-100"
            }`}
          >
            {totalAlertas}
          </span>
        </div>
      </div>
    </div>
  );
}
