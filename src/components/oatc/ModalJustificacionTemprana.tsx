"use client";

import React, { useState } from "react";
import { BorradorEntry } from "@/lib/types";
import { AlertTriangle, Clock, X, ShieldAlert, Check } from "lucide-react";

interface ModalJustificacionTempranaProps {
  isOpen: boolean;
  onClose: () => void;
  oatc: BorradorEntry | null;
  duracionReal: number;
  umbralMin: number;
  duracionEstimada: number;
  onConfirm: (motivoCompleto: string) => Promise<void>;
  loading?: boolean;
}

const MOTIVOS_PREDEFINIDOS = [
  "Cliente solicitó retirarse antes por motivos personales / urgencia",
  "Cancelación o suspensión del servicio por decisión del cliente",
  "Servicio inviable (prueba capilar/piel negativa o condición no apta)",
  "Atención exprés por solicitud explícita del cliente",
  "Otro motivo específico",
];

export function ModalJustificacionTemprana({
  isOpen,
  onClose,
  oatc,
  duracionReal,
  umbralMin,
  duracionEstimada,
  onConfirm,
  loading = false,
}: ModalJustificacionTempranaProps) {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string>(
    MOTIVOS_PREDEFINIDOS[0]
  );
  const [detalle, setDetalle] = useState<string>("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  if (!isOpen || !oatc) return null;

  const handleConfirmar = async () => {
    if (motivoSeleccionado === "Otro motivo específico" && !detalle.trim()) {
      setErrorLocal("Por favor especifica el motivo en el campo de texto.");
      return;
    }

    const motivoFinal =
      motivoSeleccionado === "Otro motivo específico"
        ? `Otro: ${detalle.trim()}`
        : detalle.trim()
        ? `${motivoSeleccionado} — ${detalle.trim()}`
        : motivoSeleccionado;

    setErrorLocal(null);
    await onConfirm(motivoFinal);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-temprana-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-earth-900 border border-amber-300 dark:border-amber-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-earth-900 dark:text-cream-100">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
            <div className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-temprana-title" className="font-bold text-base">
                Finalización Temprana Detectada
              </h3>
              <p className="text-xs text-earth-500 dark:text-earth-400">
                {oatc.nombre_servicio} — Orden {oatc.id_oatc}
              </p>
            </div>
          </div>
          <button
            disabled={loading}
            onClick={onClose}
            className="p-1 rounded-lg text-earth-400 hover:text-earth-600 hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparativa de Tiempos */}
        <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs">
          <div>
            <span className="text-[10px] text-earth-500 block uppercase font-semibold">
              Transcurrido
            </span>
            <span className="text-base font-bold text-amber-700 dark:text-amber-300">
              {duracionReal} min
            </span>
          </div>
          <div>
            <span className="text-[10px] text-earth-500 block uppercase font-semibold">
              Umbral Mínimo
            </span>
            <span className="text-base font-bold text-earth-800 dark:text-cream-100">
              {umbralMin} min
            </span>
          </div>
          <div>
            <span className="text-[10px] text-earth-500 block uppercase font-semibold">
              Nominal Est.
            </span>
            <span className="text-base font-bold text-earth-600 dark:text-earth-300">
              {duracionEstimada} min
            </span>
          </div>
        </div>

        {/* Advertencia Antifraude */}
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Protección de Cola de Turnos:</strong> Para evitar ventajas indebidas o
            saltos en la asignación automática, al finalizar antes de tiempo tu disponibilidad
            quedará en <strong>Pausa</strong> hasta que Administración revise la justificación.
          </p>
        </div>

        {/* Selector de Motivos */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-earth-800 dark:text-cream-200">
            Motivo de la finalización temprana: <span className="text-rose-500">*</span>
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {MOTIVOS_PREDEFINIDOS.map((motivo) => {
              const isSelected = motivoSeleccionado === motivo;
              return (
                <button
                  key={motivo}
                  type="button"
                  onClick={() => setMotivoSeleccionado(motivo)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-amber-100/80 border-amber-400 text-amber-950 dark:bg-amber-950 dark:border-amber-600 dark:text-amber-200 font-bold shadow-xs"
                      : "bg-earth-50 dark:bg-earth-800/50 border-earth-200 dark:border-earth-700 text-earth-700 dark:text-earth-300 hover:border-earth-300"
                  }`}
                >
                  <span className="pr-2">{motivo}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalle libre */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300">
            Detalles adicionales / Observaciones:
          </label>
          <textarea
            rows={2}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="Añade cualquier observación relevante para la administración..."
            className="w-full text-xs p-2.5 rounded-xl border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100 placeholder:text-earth-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {errorLocal && (
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
            {errorLocal}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2.5 justify-end pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-earth-200 dark:border-earth-700 text-xs font-semibold text-earth-600 hover:bg-earth-50 dark:hover:bg-earth-800 disabled:opacity-50"
          >
            Cancelar (Continuar servicio)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirmar}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <span>Registrando...</span>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Confirmar y Notificar a Administración</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
