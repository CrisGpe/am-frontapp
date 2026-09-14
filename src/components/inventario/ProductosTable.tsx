import React from "react";
import { Producto } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Plus, Minus } from "lucide-react";

export interface ProductoConAlerta extends Producto {
  alertaStockBajo: boolean;
}

interface ProductosTableProps {
  productos: ProductoConAlerta[];
  actualizandoId: string | null;
  onModificarStock: (id: string, nuevoStock: number) => void;
}

export function ProductosTable({
  productos,
  actualizandoId,
  onModificarStock,
}: ProductosTableProps) {
  if (productos.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-earth-500">
        No se encontraron productos.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-earth-50 dark:bg-earth-950/60 border-b border-earth-200 dark:border-earth-800 text-earth-600 dark:text-earth-400 font-bold uppercase tracking-wider">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Producto</th>
            <th className="p-4">Marca / Categoría</th>
            <th className="p-4">Precio Venta</th>
            <th className="p-4">Stock Actual</th>
            <th className="p-4 text-right">Ajuste de Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-earth-100 dark:divide-earth-800 text-earth-800 dark:text-cream-200">
          {productos.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-earth-50/50 dark:hover:bg-earth-800/40 transition-colors"
            >
              <td className="p-4 font-mono font-bold text-earth-500">{p.id}</td>
              <td className="p-4">
                <div className="font-bold text-earth-900 dark:text-cream-100">
                  {p.nombre}
                </div>
              </td>
              <td className="p-4">
                <span className="text-earth-600 dark:text-earth-400">{p.marca}</span>
                <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-earth-100 dark:bg-earth-800 text-earth-600">
                  {p.categoria}
                </span>
              </td>
              <td className="p-4 font-semibold text-earth-900 dark:text-cream-100">
                {formatCurrency(p.precio_venta)}
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs ${
                    p.alertaStockBajo
                      ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                      : "bg-sage-100 text-sage-800 border border-sage-200 dark:bg-sage-950 dark:text-sage-200"
                  }`}
                >
                  {p.stock} unid.
                  {p.alertaStockBajo && (
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                  )}
                </span>
              </td>
              <td className="p-4 text-right">
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={p.stock <= 0 || actualizandoId === p.id}
                    onClick={() => onModificarStock(p.id, p.stock - 1)}
                    className="p-1.5 rounded-lg border border-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-700 disabled:opacity-40 transition-colors"
                    title="Disminuir 1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={actualizandoId === p.id}
                    onClick={() => onModificarStock(p.id, p.stock + 1)}
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
