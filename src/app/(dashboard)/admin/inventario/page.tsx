"use client";

import React, { useState, useEffect } from "react";
import { Producto, Insumo } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Droplet,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  RefreshCw,
  CheckCircle2,
  Boxes,
  Sparkles,
} from "lucide-react";

interface ProductoConAlerta extends Producto {
  alertaStockBajo: boolean;
}

interface InsumoConAlerta extends Insumo {
  alertaStockBajo: boolean;
}

export default function AdminInventarioPage() {
  const [tab, setTab] = useState<"productos" | "insumos">("productos");
  const [productos, setProductos] = useState<ProductoConAlerta[]>([]);
  const [insumos, setInsumos] = useState<InsumoConAlerta[]>([]);
  const [totalAlertas, setTotalAlertas] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventario");
      const data = await res.json();
      if (res.ok) {
        setProductos(data.productos || []);
        setInsumos(data.insumos || []);
        setTotalAlertas(data.totalAlertas || 0);
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModificarStock = async (tipo: "producto" | "insumo", id: string, nuevoStock: number) => {
    if (nuevoStock < 0) return;
    setActualizandoId(id);
    setMensaje(null);

    try {
      const res = await fetch("/api/inventario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, id, nuevoStock }),
      });
      const data = await res.json();
      if (res.ok) {
        if (tipo === "producto") {
          setProductos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, stock: nuevoStock, alertaStockBajo: nuevoStock <= 3 } : p))
          );
        } else {
          setInsumos((prev) =>
            prev.map((i) => (i.id === id ? { ...i, stock: nuevoStock, alertaStockBajo: nuevoStock <= 3 } : i))
          );
        }
        setMensaje({ tipo: "success", texto: "Stock actualizado correctamente" });
        setTimeout(() => setMensaje(null), 3000);
      } else {
        setMensaje({ tipo: "error", texto: data.error || "Error al actualizar stock" });
      }
    } catch (err) {
      setMensaje({ tipo: "error", texto: "Error de red al actualizar stock" });
    } finally {
      setActualizandoId(null);
    }
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const insumosFiltrados = insumos.filter(
    (i) =>
      i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4 text-earth-500" />
            <span>Control de Stock en Tiempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
            Inventario Inteligente
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Administra productos de venta e insumos de trabajo con alerta de reposición.
          </p>
        </div>

        <button
          onClick={cargarInventario}
          className="p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-600 transition-colors self-start sm:self-auto"
          title="Recargar inventario"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-600 dark:text-earth-300">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-earth-500 font-medium block">Productos en Catálogo</span>
            <span className="text-2xl font-bold text-earth-900 dark:text-cream-100">{productos.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-600 dark:text-earth-300">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-earth-500 font-medium block">Insumos de Trabajo</span>
            <span className="text-2xl font-bold text-earth-900 dark:text-cream-100">{insumos.length}</span>
          </div>
        </div>

        <div className={`border rounded-2xl p-5 shadow-sm flex items-center gap-4 ${
          totalAlertas > 0
            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
            : "bg-white dark:bg-earth-900 border-earth-200 dark:border-earth-800"
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            totalAlertas > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300" : "bg-earth-100 text-earth-600"
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-earth-500 font-medium block">Stock Bajo (≤ 3 unidades)</span>
            <span className={`text-2xl font-bold ${totalAlertas > 0 ? "text-amber-700 dark:text-amber-300" : "text-earth-900 dark:text-cream-100"}`}>
              {totalAlertas}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {mensaje && (
        <div
          role="alert"
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 font-semibold ${
            mensaje.tipo === "success"
              ? "bg-sage-50 text-sage-800 border border-sage-200 dark:bg-sage-950 dark:text-sage-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {mensaje.tipo === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Controles de Vista: Pestañas y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex p-1 bg-earth-100 dark:bg-earth-800 rounded-2xl border border-earth-200 dark:border-earth-700 w-full sm:w-auto">
          <button
            onClick={() => setTab("productos")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === "productos"
                ? "bg-white dark:bg-earth-900 text-earth-900 dark:text-cream-100 shadow-sm"
                : "text-earth-600 dark:text-earth-400 hover:text-earth-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Productos de Venta ({productos.length})</span>
          </button>
          <button
            onClick={() => setTab("insumos")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === "insumos"
                ? "bg-white dark:bg-earth-900 text-earth-900 dark:text-cream-100 shadow-sm"
                : "text-earth-600 dark:text-earth-400 hover:text-earth-900"
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Insumos Internos ({insumos.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tab === "productos" ? "Buscar por nombre, marca..." : "Buscar por insumo..."}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-900 text-earth-900 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-earth-500"
          />
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-earth-500">Cargando inventario...</div>
        ) : tab === "productos" ? (
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
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-earth-500">
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-earth-50/50 dark:hover:bg-earth-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-earth-500">{p.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-earth-900 dark:text-cream-100">{p.nombre}</div>
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
                          {p.alertaStockBajo && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={p.stock <= 0 || actualizandoId === p.id}
                            onClick={() => handleModificarStock("producto", p.id, p.stock - 1)}
                            className="p-1.5 rounded-lg border border-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-700 disabled:opacity-40 transition-colors"
                            title="Disminuir 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={actualizandoId === p.id}
                            onClick={() => handleModificarStock("producto", p.id, p.stock + 1)}
                            className="p-1.5 rounded-lg border border-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-700 disabled:opacity-40 transition-colors"
                            title="Aumentar 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
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
                {insumosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-earth-500">
                      No se encontraron insumos.
                    </td>
                  </tr>
                ) : (
                  insumosFiltrados.map((i) => (
                    <tr key={i.id} className="hover:bg-earth-50/50 dark:hover:bg-earth-800/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-earth-500">{i.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-earth-900 dark:text-cream-100">{i.nombre}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-earth-100 dark:bg-earth-800 text-earth-600 text-[10px]">
                          {i.categoria}
                        </span>
                      </td>
                      <td className="p-4 text-earth-600">{i.unidad_medida}</td>
                      <td className="p-4 font-medium text-earth-600">{formatCurrency(i.costo_unitario)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs ${
                            i.alertaStockBajo
                              ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                              : "bg-sage-100 text-sage-800 border border-sage-200 dark:bg-sage-950 dark:text-sage-200"
                          }`}
                        >
                          {i.stock} {i.unidad_medida}
                          {i.alertaStockBajo && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={i.stock <= 0 || actualizandoId === i.id}
                            onClick={() => handleModificarStock("insumo", i.id, i.stock - 1)}
                            className="p-1.5 rounded-lg border border-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-700 disabled:opacity-40 transition-colors"
                            title="Disminuir 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={actualizandoId === i.id}
                            onClick={() => handleModificarStock("insumo", i.id, i.stock + 1)}
                            className="p-1.5 rounded-lg border border-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-700 disabled:opacity-40 transition-colors"
                            title="Aumentar 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
