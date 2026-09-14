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
  MapPin,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

export default function AsistenciaPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [asistencia, setAsistencia] = useState<AsistenciaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      const hoyLocal = getTodayDateString();
      const [resUser, resAsis] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/asistencia?fecha=${hoyLocal}`),
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

  const obtenerUbicacionGPS = (): Promise<{
    latitud: number;
    longitud: number;
    precision: number;
  } | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitud: pos.coords.latitude,
            longitud: pos.coords.longitude,
            precision: pos.coords.accuracy,
          });
        },
        () => {
          // Permiso denegado o timeout
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    });
  };

  const handleMarcar = async (tipoAccion: "checkin" | "checkout") => {
    setActionLoading(true);
    setError(null);
    setGpsStatus("Comprobando presencia física en el salón (GPS)...");

    try {
      const ubicacion = await obtenerUbicacionGPS();
      setGpsStatus("Enviando registro al sistema...");

      const hoyLocal = getTodayDateString();
      const horaLocal = getCurrentTimeString();
      const res = await fetch("/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoAccion,
          fecha: hoyLocal,
          hora: horaLocal,
          ubicacion,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrar asistencia");
        setActionLoading(false);
        setGpsStatus(null);
        return;
      }

      await cargarDatos();
      setActionLoading(false);
      setGpsStatus(null);
    } catch {
      setError("Error de red al marcar asistencia");
      setActionLoading(false);
      setGpsStatus(null);
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
            <span>Control de Asistencia y Geolocalización</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
            Registro de Jornada
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-earth-500" />
            Salón Élite & Spa: Av. Horacio Urteaga, Jesús María
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-earth-500 block">Hora Local de Lima</span>
          <span
            suppressHydrationWarning
            className="text-3xl font-mono font-bold text-earth-900 dark:text-cream-100 tracking-wider"
          >
            {mounted && currentTime ? currentTime : "--:--"}
          </span>
        </div>
      </div>

      {/* Tarjeta de Marcaje Personal */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100 mb-1">
          Estado de {user?.nombre || "Colaborador"}
        </h2>
        <p className="text-xs text-earth-500 mb-4">
          La geolocalización de tu móvil valida tu presencia dentro del salón para activar tus turnos.
        </p>

        {loading ? (
          <p className="text-sm text-earth-500 py-6 animate-pulse">
            Consultando registro de asistencia...
          </p>
        ) : (
          <div className="py-4 max-w-sm mx-auto space-y-4">
            {!miRegistro ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-earth-50 dark:bg-earth-950 border border-earth-200/60 text-xs text-earth-600">
                  Aún no has registrado tu entrada el día de hoy.
                </div>
                <button
                  type="button"
                  onClick={() => handleMarcar("checkin")}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-2xl bg-earth-800 hover:bg-earth-900 text-white font-bold text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  {actionLoading ? "Validando ubicación..." : "Marcar Entrada (Check-In)"}
                </button>
              </div>
            ) : !miRegistro.hora_checkout ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sage-200/60 dark:bg-sage-900 px-2 py-0.5 rounded-full text-sage-800 dark:text-sage-300">
                    Jornada Activa
                  </span>
                  <span className="text-lg font-bold">
                    Entrada: {miRegistro.hora_checkin} hrs
                  </span>

                  {/* Verificación de Ubicación GPS */}
                  {miRegistro.alerta_ubicacion ? (
                    <div className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-100/70 dark:bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Registrado fuera de rango (
                        {miRegistro.distancia_metros != null
                          ? `${miRegistro.distancia_metros}m`
                          : "Sin GPS"}
                        )
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-100/60 dark:bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Ubicación verificada en Salón (
                        {miRegistro.distancia_metros != null
                          ? `${miRegistro.distancia_metros}m`
                          : "GPS"}
                        )
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleMarcar("checkout")}
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-2xl bg-earth-800 hover:bg-earth-900 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {actionLoading ? "Registrando salida..." : "Registrar Salida (Check-Out)"}
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-cream-100 dark:bg-earth-950 border border-earth-200 dark:border-earth-800 text-earth-800 dark:text-cream-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-sage-500 mx-auto" />
                <h3 className="font-bold text-sm">Jornada Completada</h3>
                <p className="text-xs text-earth-600 dark:text-earth-400">
                  Entrada: <strong>{miRegistro.hora_checkin} hrs</strong> | Salida:{" "}
                  <strong>{miRegistro.hora_checkout} hrs</strong>
                </p>
                <p className="text-[11px] text-earth-500">
                  Tu jornada ha sido registrada y guardada en tiempo real en la hoja Asistencia.
                </p>
              </div>
            )}

            {gpsStatus && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>{gpsStatus}</span>
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-earth-500">ID: {asis.id_agente}</span>
                    {asis.alerta_ubicacion ? (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                        ⚠️ Fuera de local ({asis.distancia_metros != null ? `${asis.distancia_metros}m` : "Sin GPS"})
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                        ✅ En Salón ({asis.distancia_metros != null ? `${asis.distancia_metros}m` : "OK"})
                      </span>
                    )}
                  </div>
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
