import React from "react";
import { Insumo } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Plus, Minus } from "lucide-react";

export interface InsumoConAlerta extends Insumo {
  alertaStockBajo: boolean;
}

interface InsumosTableProps {
  insumos: InsumoConAlerta[];
  actualizandoId: string | null;
  onModificarStock: (id: string, nuevoStock: number) => void;
}

export function InsumosTable({
  insumos,
  actualizandoId,
  onModificarStock,
}: InsumosTableProps) {
  if (insumos.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-earth-500">
        No se encontraron insumos.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-earth-50 dark:bg-earth-950/60 border-b border-earth-200 dark:border-earth-800 text-earth-600 dark:text-earth-400 font-bold uppercase tracking-wider">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Insumo</th>
            <th className="p-4">Categoría</th>
            <th className="p-4">Unidad de Medida</th>
            <th className="p-4">Costo Unit.</th>
            <th className="p-4">Stock Actual</th>
            <th className="p-4 text-right">Ajuste de Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-earth-100 dark:divide-earth-800 text-earth-800 dark:text-cream-200">
          {insumos.map((i) => (
            <tr
              key={i.id}
              className="hover:bg-earth-50/50 dark:hover:bg-earth-800/40 transition-colors"
            >
              <td className="p-4 font-mono font-bold text-earth-500">{i.id}</td>
              <td className="p-4">
                <div className="font-bold text-earth-900 dark:text-cream-100">
                  {i.nombre}
                </div>
              </td>
              <td className="p-4">
                <span className="px-2 py-0.5 rounded-full bg-earth-100 dark:bg-earth-800 text-earth-600 text-[10px]">
                  {i.categoria}
                </span>
              </td>
              <td className="p-4 text-earth-600">{i.unidad_medida}</td>
              <td className="p-4 font-medium text-earth-600">
                {formatCurrency(i.costo_unitario)}
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs ${
                    i.alertaStockBajo
                      ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                      : "bg-sage-100 text-sage-800 border border-sage-200 dark:bg-sage-950 dark:text-sage-200"
                  }`}
                >
                  {i.stock} {i.unidad_medida}
                  {i.alertaStockBajo && (
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                  )}
                </span>
              </td>
              <td className="p-4 text-right">
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={i.stock <= 0 || actualizandoId === i.id}
                    onClick={() => onModificarStock(i.id, i.stock - 1)}
                    className="p-1.5 rounded-lg border border-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-700 disabled:opacity-40 transition-colors"
                    title="Disminuir 1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={actualizandoId === i.id}
                    onClick={() => onModificarStock(i.id, i.stock + 1)}
                    className="p-1.5 rounded-lg border border-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-700 disabled:opacity-40 transition-colors"
                    title="Aumentar 1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
