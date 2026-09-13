"use client";

import React, { useState, useEffect } from "react";
import { BorradorEntry, Producto, Insumo } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  CreditCard,
  Receipt,
  Package,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface CobranzaModalProps {
  isOpen: boolean;
  onClose: () => void;
  oatc: BorradorEntry | null;
  onSuccess: () => void;
}

export function CobranzaModal({ isOpen, onClose, oatc, onSuccess }: CobranzaModalProps) {
  const [precioServicio, setPrecioServicio] = useState<number>(0);
  const [comprobanteExterno, setComprobanteExterno] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([]);

  // Productos vendidos al cliente
  const [productosVendidos, setProductosVendidos] = useState<{ id: string; cantidad: number }[]>([]);
  // Insumos utilizados durante el servicio
  const [insumosUsados, setInsumosUsados] = useState<{ id: string; cantidad: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && oatc) {
      setPrecioServicio(Number(oatc.precio_final) || 0);
      setComprobanteExterno(oatc.comprobante_externo || "");
      setNotas(oatc.notas || "");
      setError(null);
      cargarCatalogos();
    }
  }, [isOpen, oatc]);

  const cargarCatalogos = async () => {
    try {
      const [resProd, resIns] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/insumos"),
      ]);
      const dataProd = await resProd.json();
      const dataIns = await resIns.json();
      if (dataProd.productos) setProductosDisponibles(dataProd.productos);
      if (dataIns.insumos) setInsumosDisponibles(dataIns.insumos);
    } catch (err) {
      console.error("Error cargando inventario:", err);
    }
  };

  if (!isOpen || !oatc) return null;

  // Cálculo de totales
  const totalProductosVendidos = productosVendidos.reduce((acc, curr) => {
    const prod = productosDisponibles.find((p) => p.id === curr.id);
    return acc + (prod ? prod.precio_venta * curr.cantidad : 0);
  }, 0);

  const totalGeneral = precioServicio + totalProductosVendidos;

  const handleAddProductoVendido = (prodId: string) => {
    const existing = productosVendidos.find((p) => p.id === prodId);
    if (existing) {
      setProductosVendidos(
        productosVendidos.map((p) =>
          p.id === prodId ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setProductosVendidos([...productosVendidos, { id: prodId, cantidad: 1 }]);
    }
  };

  const handleRemoveProductoVendido = (prodId: string) => {
    setProductosVendidos(productosVendidos.filter((p) => p.id !== prodId));
  };

  const handleAddInsumo = (insumoId: string) => {
    const existing = insumosUsados.find((i) => i.id === insumoId);
    if (!existing) {
      setInsumosUsados([...insumosUsados, { id: insumoId, cantidad: "1 unidad" }]);
    }
  };

  const handleConfirmarCobro = async () => {
    if (!comprobanteExterno.trim()) {
      setError("Es obligatorio ingresar el número de comprobante de pago externo (ej: Ticket, Boleta o Factura).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Serializar productos e insumos
      const prodVendidosStr = productosVendidos
        .map((p) => `${p.id}:${p.cantidad}`)
        .join(",");
      const insumosStr = insumosUsados
        .map((i) => `${i.id}:${i.cantidad}`)
        .join(",");

      const res = await fetch("/api/borrador", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_oatc: oatc.id_oatc,
          updates: {
            etapa: "completada",
            precio_final: totalGeneral,
            comprobante_externo: comprobanteExterno.trim(),
            productos_vendidos: prodVendidosStr,
            insumos_usados: insumosStr,
            notas: notas.trim(),
            hora_fin: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al completar el cobro");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Error de red al registrar el cobro");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-earth-100 dark:border-earth-800 flex items-center justify-between bg-earth-50/50 dark:bg-earth-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-earth-500">
                {oatc.id_oatc}
              </span>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">
                Etapa: Cobranza
              </span>
            </div>
            <h2 className="text-xl font-bold text-earth-900 dark:text-cream-100 mt-1">
              Finalizar Atención & Cobro
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-earth-400 hover:text-earth-700 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Info general */}
          <div className="bg-earth-50 dark:bg-earth-950/70 p-4 rounded-2xl border border-earth-200/60 dark:border-earth-800/60 text-xs space-y-1">
            <p>
              <strong>Consumidor:</strong> {oatc.nombre_consumidor} (
              {oatc.tipo_consumidor === "cliente" ? "Fidelizado" : "Turno"})
            </p>
            <p>
              <strong>Servicio:</strong> {oatc.nombre_servicio}
            </p>
            <p>
              <strong>Colaborador:</strong> {oatc.nombre_agente}
            </p>
            <p className="text-earth-500">
              <strong>Correlativo Automático Sistema:</strong> {oatc.correlativo_sistema}
            </p>
          </div>

          {/* Precio ajustable del servicio */}
          <div>
            <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-2">
              Precio del Servicio (Ajustable)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-400 font-bold">$</span>
              <input
                type="number"
                min="0"
                step="10"
                value={precioServicio}
                onChange={(e) => setPrecioServicio(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 font-bold text-earth-900 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-earth-500"
              />
            </div>
            <p className="text-[11px] text-earth-500 mt-1">
              Puedes ajustar el precio final según el largo de cabello, técnica o variaciones.
            </p>
          </div>

          {/* Comprobante externo OBLIGATORIO */}
          <div>
            <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-2">
              Correlativo / Comprobante Externo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Receipt className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ej: TICKET-4829 / FACTURA B001-382"
                value={comprobanteExterno}
                onChange={(e) => {
                  setComprobanteExterno(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-earth-500 font-medium"
              />
            </div>
            <p className="text-[11px] text-earth-500 mt-1">
              Ingresa el número de ticket impreso, voucher de terminal bancaria o folio físico.
            </p>
          </div>

          {/* Venta de productos adicionales */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider">
                Venta de Productos (Opcional)
              </label>
            </div>
            <div className="flex gap-2 mb-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddProductoVendido(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-800 dark:text-cream-200"
              >
                <option value="">+ Agregar producto vendido al cliente...</option>
                {productosDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {formatCurrency(p.precio_venta)}
                  </option>
                ))}
              </select>
            </div>

            {productosVendidos.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {productosVendidos.map((item) => {
                  const prod = productosDisponibles.find((p) => p.id === item.id);
                  if (!prod) return null;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-earth-50 dark:bg-earth-950 text-xs"
                    >
                      <span>
                        {prod.nombre} (x{item.cantidad})
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {formatCurrency(prod.precio_venta * item.cantidad)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProductoVendido(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notas u observaciones */}
          <div>
            <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-2">
              Notas de la Atención
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Fórmula de color aplicada, corte sugerido para la próxima cita..."
              className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-earth-500"
            />
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer con Total y Botón */}
        <div className="p-6 border-t border-earth-100 dark:border-earth-800 bg-earth-50/50 dark:bg-earth-950/50 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-earth-500 block">Total a Cobrar</span>
            <span className="text-2xl font-bold text-earth-900 dark:text-cream-100">
              {formatCurrency(totalGeneral)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirmarCobro}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-sm shadow-md shadow-sage-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? "Procesando..." : "Confirmar y Cerrar OATC"}
          </button>
        </div>
      </div>
    </div>
  );
}
