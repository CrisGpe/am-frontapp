"use client";

import React, { useState, useEffect } from "react";
import { SalonConfig } from "@/lib/types";
import { Settings, Sparkles, Clock, Globe, Save, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState<SalonConfig>({
    nombre_salon: "Salón Élite & Spa",
    hora_cierre_auto: "22:00",
    zona_horaria: "America/Mexico_City",
    correlativo_actual: 100,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/configuracion");
      const data = await res.json();
      if (data.config) setConfig(data.config);
    } catch (err) {
      console.error("Error cargando config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/configuracion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar configuración");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setSaving(false);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError("Error de red al guardar configuración");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-earth-600 hover:text-earth-900 font-semibold mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al panel admin
        </Link>
        <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4 text-earth-500" />
          <span>Preferencias Globales</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
          Configuración del Salón
        </h1>
        <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
          Ajusta los parámetros operativos y la hora de cierre nocturno automatizado.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950 border border-sage-200 text-sage-800 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-sage-600" />
          <span>Configuración actualizada correctamente</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleGuardar}
        className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div>
          <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-2">
            Nombre Comercial del Salón
          </label>
          <input
            type="text"
            value={config.nombre_salon}
            onChange={(e) => setConfig({ ...config, nombre_salon: e.target.value })}
            className="w-full p-3 text-sm rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100 font-semibold"
          />
          <p className="text-[11px] text-earth-500 mt-1">
            Aparece en el encabezado de la app y en los comprobantes de atención.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-2">
            Hora de Cierre Automático (Vercel Cron)
          </label>
          <div className="relative max-w-xs">
            <Clock className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="time"
              value={config.hora_cierre_auto}
              onChange={(e) => setConfig({ ...config, hora_cierre_auto: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 font-mono text-earth-900 dark:text-cream-100 font-bold"
            />
          </div>
          <p className="text-[11px] text-earth-500 mt-1">
            Hora a la que el sistema migra automáticamente el Borrador a OATC y Asistencia.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-2">
            Zona Horaria
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={config.zona_horaria}
              onChange={(e) => setConfig({ ...config, zona_horaria: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
            >
              <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
              <option value="America/Bogota">America/Bogota (GMT-5)</option>
              <option value="America/Lima">America/Lima (GMT-5)</option>
              <option value="America/Santiago">America/Santiago (GMT-4)</option>
              <option value="America/Buenos_Aires">America/Buenos_Aires (GMT-3)</option>
              <option value="America/Madrid">Europe/Madrid (GMT+1)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-sm shadow-md shadow-earth-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
