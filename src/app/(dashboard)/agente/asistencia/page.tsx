"use client";

import React, { useState, useEffect } from "react";
import { AsistenciaRecord, UserSession } from "@/lib/types";
import { getCurrentTimeString, getTodayDateString } from "@/lib/utils";
import {
  Calendar,
  Clock,
  CheckCircle2,
  LogOut,
  AlertCircle,
  Users,
  Sparkles,
} from "lucide-react";

export default function AsistenciaPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [asistencia, setAsistencia] = useState<AsistenciaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(getCurrentTimeString());
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resUser, resAsis] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/asistencia"),
      ]);
      const dataUser = await resUser.json();
      const dataAsis = await resAsis.json();

      if (dataUser.user) setUser(dataUser.user);
      if (dataAsis.asistencia) setAsistencia(dataAsis.asistencia);
    } catch (err) {
      console.error("Error cargando asistencia:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcar = async (tipoAccion: "checkin" | "checkout") => {
    setActionLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoAccion }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrar asistencia");
        setActionLoading(false);
        return;
      }

      await cargarDatos();
      setActionLoading(false);
    } catch (err) {
      setError("Error de red al marcar asistencia");
      setActionLoading(false);
    }
  };

  const miRegistro = asistencia.find((a) => a.id_agente === user?.userId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4 text-earth-500" />
            <span>Control de Asistencia Diaria</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
            Registro de Jornada
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Fecha de hoy: <strong>{getTodayDateString()}</strong>
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-earth-500 block">Hora Local</span>
          <span className="text-3xl font-mono font-bold text-earth-900 dark:text-cream-100 tracking-wider">
            {currentTime || "--:--"}
          </span>
        </div>
      </div>

      {/* Tarjeta de Marcaje Personal */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100 mb-2">
          Estado de {user?.nombre || "Colaborador"}
        </h2>

        {loading ? (
          <p className="text-sm text-earth-500 py-6">Consultando registro de asistencia...</p>
        ) : (
          <div className="py-6 max-w-sm mx-auto space-y-4">
            {!miRegistro ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-950 border border-earth-200/60 text-xs text-earth-600">
                  Aún no has registrado tu entrada el día de hoy.
                </div>
                <button
                  type="button"
                  onClick={() => handleMarcar("checkin")}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-2xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-base shadow-lg shadow-earth-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {actionLoading ? "Registrando..." : "Marcar Entrada (Check-In)"}
                </button>
              </div>
            ) : !miRegistro.hora_checkout ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold uppercase">Jornada Activa</span>
                  <span className="text-lg font-bold">
                    Entrada registrada a las {miRegistro.hora_checkin} hrs
                  </span>
                  <span className="text-xs text-sage-600 dark:text-sage-400">
                    Estado: {miRegistro.estado}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleMarcar("checkout")}
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-2xl bg-earth-800 hover:bg-earth-900 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {actionLoading ? "Registrando..." : "Registrar Salida (Check-Out)"}
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-cream-100 dark:bg-earth-950 border border-earth-200 text-earth-800 dark:text-cream-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-sage-500 mx-auto" />
                <h3 className="font-bold text-sm">Jornada Completada</h3>
                <p className="text-xs text-earth-600 dark:text-earth-400">
                  Entrada: <strong>{miRegistro.hora_checkin} hrs</strong> | Salida:{" "}
                  <strong>{miRegistro.hora_checkout} hrs</strong>
                </p>
                <p className="text-[11px] text-earth-500">
                  Tus horas registradas migrarán a la hoja Asistencia en el cierre automático de día.
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabla del Salón */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-earth-900 dark:text-cream-100 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-earth-500" />
          Colaboradores con Registro Hoy ({asistencia.length})
        </h2>

        {asistencia.length === 0 ? (
          <p className="text-xs text-earth-500 py-4 text-center">
            Ningún colaborador ha registrado asistencia todavía hoy.
          </p>
        ) : (
          <div className="divide-y divide-earth-100 dark:divide-earth-800/60">
            {asistencia.map((asis, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-earth-900 dark:text-cream-100 block">
                    {asis.nombre_agente}
                  </span>
                  <span className="text-[11px] text-earth-500">ID: {asis.id_agente}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-mono text-earth-700 dark:text-cream-200 block">
                    Entrada: <strong>{asis.hora_checkin}</strong>
                    {asis.hora_checkout ? ` | Salida: ${asis.hora_checkout}` : " (En turno)"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sage-950 text-sage-800 dark:text-sage-300 font-semibold">
                    {asis.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
