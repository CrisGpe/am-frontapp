"use client";

import React, { useState, useEffect } from "react";
import { Servicio, Cliente, Agente, TipoConsumidor } from "@/lib/types";
import { formatCurrency, getTodayDateString, getCurrentTimeString } from "@/lib/utils";
import { X, Scissors, User, Sparkles, Clock, AlertCircle } from "lucide-react";

interface NuevaOATCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentAgent: { id: string; nombre: string };
}

export function NuevaOATCModal({
  isOpen,
  onClose,
  onSuccess,
  currentAgent,
}: NuevaOATCModalProps) {
  const [tipoConsumidor, setTipoConsumidor] = useState<TipoConsumidor>("cliente");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);

  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>("");
  const [nombreTurno, setNombreTurno] = useState<string>("");
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState<string>("");
  const [agenteAsignadoId, setAgenteAsignadoId] = useState<string>(currentAgent.id);
  const [notas, setNotas] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
      setAgenteAsignadoId(currentAgent.id);
      setError(null);
    }
  }, [isOpen, currentAgent.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  const cargarDatos = async () => {
    try {
      const [resCli, resServ, resAg] = await Promise.all([
        fetch("/api/clientes"),
        fetch("/api/servicios"),
        fetch("/api/agentes"),
      ]);
      const dataCli = await resCli.json();
      const dataServ = await resServ.json();
      const dataAg = await resAg.json();

      if (dataCli.clientes) setClientes(dataCli.clientes);
      if (dataServ.servicios) setServicios(dataServ.servicios);
      if (dataAg.agentes) setAgentes(dataAg.agentes);
    } catch (err) {
      console.error("Error cargando opciones para OATC:", err);
    }
  };

  if (!isOpen) return null;

  const servicioSeleccionado = servicios.find((s) => s.id === servicioSeleccionadoId);
  const agenteAsignado = agentes.find((a) => a.id === agenteAsignadoId) || {
    id: currentAgent.id,
    nombre: currentAgent.nombre,
  };
  const clienteSeleccionado = clientes.find((c) => c.id === clienteSeleccionadoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!servicioSeleccionado) {
      setError("Por favor selecciona un servicio válido.");
      return;
    }

    let nombreConsumidor = "";
    let idCliente: string | undefined = undefined;

    if (tipoConsumidor === "cliente") {
      if (!clienteSeleccionadoId) {
        setError("Por favor selecciona un cliente registrado.");
        return;
      }
      nombreConsumidor = clienteSeleccionado?.nombre || "Cliente";
      idCliente = clienteSeleccionadoId;
    } else {
      if (!nombreTurno.trim()) {
        setError("Por favor ingresa el nombre de la persona para el turno.");
        return;
      }
      nombreConsumidor = `${nombreTurno.trim()} (Turno)`;
    }

    setLoading(true);
    setError(null);

    const hoy = getTodayDateString("America/Lima");
    const hora = getCurrentTimeString("America/Lima");
    const randomCorr = Math.floor(100 + Math.random() * 900);
    const idOatc = `OATC-${hoy.replace(/-/g, "")}-${randomCorr}`;

    try {
      const res = await fetch("/api/borrador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_oatc: idOatc,
          fecha: hoy,
          hora_inicio: hora,
          tipo_consumidor: tipoConsumidor,
          id_cliente: idCliente,
          nombre_consumidor: nombreConsumidor,
          id_agente: agenteAsignado.id,
          nombre_agente: agenteAsignado.nombre,
          id_servicio: servicioSeleccionado.id,
          nombre_servicio: servicioSeleccionado.nombre,
          etapa: "asesoria",
          precio_final: servicioSeleccionado.precio_base,
          correlativo_sistema: `OATC-${randomCorr}`,
          notas: notas.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear la orden de atención");
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Error de red al guardar OATC");
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-nueva-oatc-title"
        className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-earth-100 dark:border-earth-800 flex items-center justify-between bg-earth-50/50 dark:bg-earth-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-earth-500 text-white flex items-center justify-center shadow-md shadow-earth-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-nueva-oatc-title" className="text-lg font-bold text-earth-900 dark:text-cream-100">
                Nueva Orden de Atención
              </h2>
              <span className="text-xs text-earth-500">
                Registro en tiempo real al Borrador
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={loading}
            className="p-2 rounded-xl text-earth-400 hover:text-earth-700 dark:hover:text-earth-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Selector de Tipo de Consumidor */}
          <div>
            <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-2">
              Tipo de Consumidor
            </label>
            <div className="grid grid-cols-2 p-1 bg-earth-100 dark:bg-earth-950 rounded-xl border border-earth-200/60 dark:border-earth-800/60">
              <button
                type="button"
                onClick={() => setTipoConsumidor("cliente")}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  tipoConsumidor === "cliente"
                    ? "bg-white dark:bg-earth-800 text-earth-900 dark:text-cream-100 shadow-sm"
                    : "text-earth-600 dark:text-earth-400"
                }`}
              >
                Cliente Fidelizado
              </button>
              <button
                type="button"
                onClick={() => setTipoConsumidor("turno")}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  tipoConsumidor === "turno"
                    ? "bg-white dark:bg-earth-800 text-earth-900 dark:text-cream-100 shadow-sm"
                    : "text-earth-600 dark:text-earth-400"
                }`}
              >
                Turno Casual
              </button>
            </div>
          </div>

          {/* Consumidor Info */}
          {tipoConsumidor === "cliente" ? (
            <div>
              <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
                Seleccionar Cliente
              </label>
              <select
                value={clienteSeleccionadoId}
                onChange={(e) => setClienteSeleccionadoId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
              >
                <option value="">-- Elige un cliente registrado --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.id})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
                Nombre del Turno
              </label>
              <input
                type="text"
                placeholder="Nombre del cliente casual..."
                value={nombreTurno}
                onChange={(e) => setNombreTurno(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
              />
            </div>
          )}

          {/* Servicio */}
          <div>
            <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
              Servicio Solicitado
            </label>
            <select
              value={servicioSeleccionadoId}
              onChange={(e) => setServicioSeleccionadoId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
            >
              <option value="">-- Selecciona el servicio --</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.duracion_min}m) — {formatCurrency(s.precio_base)}
                </option>
              ))}
            </select>
            {servicioSeleccionado && (
              <div className="mt-2 p-2 rounded-xl bg-earth-50 dark:bg-earth-950 text-[11px] text-earth-600 flex items-center justify-between">
                <span>Especialidad: {servicioSeleccionado.especialidad_requerida}</span>
                <span className="font-bold">{formatCurrency(servicioSeleccionado.precio_base)}</span>
              </div>
            )}
          </div>

          {/* Colaborador asignado */}
          <div>
            <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
              Colaborador Asignado
            </label>
            <select
              value={agenteAsignadoId}
              onChange={(e) => setAgenteAsignadoId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
            >
              {agentes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} ({a.especialidades.join(", ")})
                </option>
              ))}
            </select>
          </div>

          {/* Notas iniciales */}
          <div>
            <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
              Observaciones / Solicitud Específica
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles sobre lo que pide el cliente..."
              className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-sm shadow-md shadow-earth-500/20 active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? "Creando OATC..." : "Iniciar Orden de Atención"}
          </button>
        </form>
      </div>
    </div>
  );
}
