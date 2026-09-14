"use client";

import React, { useState, useEffect } from "react";
import { Boxes, Package, Droplet, Search, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { StockAlertBanner } from "@/components/inventario/StockAlertBanner";
import { ProductosTable, ProductoConAlerta } from "@/components/inventario/ProductosTable";
import { InsumosTable, InsumoConAlerta } from "@/components/inventario/InsumosTable";

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
    } catch {
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
      <StockAlertBanner
        totalProductos={productos.length}
        totalInsumos={insumos.length}
        totalAlertas={totalAlertas}
      />

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
          {mensaje.tipo === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
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
          <ProductosTable
            productos={productosFiltrados}
            actualizandoId={actualizandoId}
            onModificarStock={(id, nuevoStock) => handleModificarStock("producto", id, nuevoStock)}
          />
        ) : (
          <InsumosTable
            insumos={insumosFiltrados}
            actualizandoId={actualizandoId}
            onModificarStock={(id, nuevoStock) => handleModificarStock("insumo", id, nuevoStock)}
          />
        )}
      </div>
    </div>
  );
}
