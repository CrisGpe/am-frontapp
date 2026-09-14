"use client";

import React, { useState, useEffect } from "react";
import { AsistenciaRecord, UserSession } from "@/lib/types";
import {
  getCurrentTimeString,
  getTodayDateString,
  calcularDistanciaMetros,
  SALON_COORDS,
  SALON_RADIO_METROS,
} from "@/lib/utils";
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
  Compass,
  Sliders,
  RotateCcw,
} from "lucide-react";

const COORD_PRESETS = [
  {
    id: "real",
    nombre: "📍 GPS Real del Dispositivo",
    descripcion: "Sensor nativo del navegador / móvil",
    coords: null,
  },
  {
    id: "salon",
    nombre: "🏢 En el Salón Élite (<= 50m)",
    descripcion: "-12.073188, -77.05192 (Distancia: ~0m)",
    coords: { lat: -12.073188, lng: -77.05192 },
  },
  {
    id: "prueba_usuario",
    nombre: "🧪 Coordenada de Prueba (~905m)",
    descripcion: "-12.0749366, -77.0600519 (Fuera de rango)",
    coords: { lat: -12.0749366, lng: -77.0600519 },
  },
  {
    id: "custom",
    nombre: "✏️ Coordenadas Personalizadas",
    descripcion: "Ingresar latitud y longitud manual",
    coords: null,
  },
];

export default function AsistenciaPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [asistencia, setAsistencia] = useState<AsistenciaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Selector y modo de pruebas GPS
  const [selectedPreset, setSelectedPreset] = useState<string>("prueba_usuario");
  const [customLat, setCustomLat] = useState<string>("-12.0749366");
  const [customLng, setCustomLng] = useState<string>("-77.0600519");
  const [showTestPanel, setShowTestPanel] = useState<boolean>(true);

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

  const resolverCoordenadasActivas = async (): Promise<{
    latitud: number;
    longitud: number;
    precision: number;
  } | null> => {
    if (selectedPreset === "salon") {
      return {
        latitud: SALON_COORDS.lat,
        longitud: SALON_COORDS.lng,
        precision: 10,
      };
    }

    if (selectedPreset === "prueba_usuario") {
      return {
        latitud: -12.0749366,
        longitud: -77.0600519,
        precision: 10,
      };
    }

    if (selectedPreset === "custom") {
      const lat = parseFloat(customLat);
      const lng = parseFloat(customLng);
      if (isNaN(lat) || isNaN(lng)) return null;
      return {
        latitud: lat,
        longitud: lng,
        precision: 10,
      };
    }

    // GPS real del dispositivo
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
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    });
  };

  // Cálculo de distancia previa para mostrar en el simulador
  const getDistanciaEstimada = (): { distancia: number | null; fueraDeRango: boolean } => {
    let lat: number | null = null;
    let lng: number | null = null;

    if (selectedPreset === "salon") {
      lat = SALON_COORDS.lat;
      lng = SALON_COORDS.lng;
    } else if (selectedPreset === "prueba_usuario") {
      lat = -12.0749366;
      lng = -77.0600519;
    } else if (selectedPreset === "custom") {
      const pLat = parseFloat(customLat);
      const pLng = parseFloat(customLng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        lat = pLat;
        lng = pLng;
      }
    }

    if (lat != null && lng != null) {
      const d = calcularDistanciaMetros(lat, lng);
      return { distancia: d, fueraDeRango: d > SALON_RADIO_METROS };
    }

    return { distancia: null, fueraDeRango: false };
  };

  const handleMarcar = async (
    tipoAccion: "checkin" | "checkout",
    permitirReintento: boolean = false
  ) => {
    setActionLoading(true);
    setError(null);
    setGpsStatus("Comprobando presencia física en el salón (GPS)...");

    try {
      const ubicacion = await resolverCoordenadasActivas();
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
          permitirReintento,
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
  const estimada = getDistanciaEstimada();

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

      {/* Panel de Pruebas y Simulación GPS */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-earth-100 dark:border-earth-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-earth-900 dark:text-cream-100">
              Simulador y Pruebas de Geocercado (Tolerancia: {SALON_RADIO_METROS}m)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowTestPanel(!showTestPanel)}
            className="text-xs text-earth-500 hover:text-earth-700 dark:hover:text-cream-200 flex items-center gap-1 font-medium"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showTestPanel ? "Ocultar opciones" : "Mostrar opciones"}</span>
          </button>
        </div>

        {showTestPanel && (
          <div className="pt-4 space-y-4">
            <div className="text-xs text-earth-600 dark:text-earth-400 space-y-1">
              <p>
                <strong>Coordenadas Oficiales Salón Élite:</strong>{" "}
                <code className="bg-earth-100 dark:bg-earth-800 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  {SALON_COORDS.lat}, {SALON_COORDS.lng}
                </code>{" "}
                ({SALON_COORDS.direccion})
              </p>
              <p>
                <strong>Radio de Tolerancia:</strong> {SALON_RADIO_METROS} metros. Si el agente marca a más de {SALON_RADIO_METROS}m, se activa la alerta de auditoría.
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COORD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`text-left p-3 rounded-2xl border transition-all ${
                    selectedPreset === preset.id
                      ? "bg-earth-100 dark:bg-earth-800 border-earth-400 dark:border-amber-400/60 shadow-xs"
                      : "bg-earth-50/50 dark:bg-earth-950/40 border-earth-200/70 dark:border-earth-800 hover:border-earth-300"
                  }`}
                >
                  <span className="font-bold text-xs text-earth-900 dark:text-cream-100 block">
                    {preset.nombre}
                  </span>
                  <span className="text-[11px] text-earth-500 block mt-0.5">
                    {preset.descripcion}
                  </span>
                </button>
              ))}
            </div>

            {/* Input para Custom */}
            {selectedPreset === "custom" && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-earth-50 dark:bg-earth-950 border border-earth-200 dark:border-earth-800">
                <div>
                  <label className="text-[11px] font-semibold text-earth-600 dark:text-earth-400 block mb-1">
                    Latitud
                  </label>
                  <input
                    type="text"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="-12.0749366"
                    className="w-full text-xs font-mono p-2 rounded-xl border border-earth-300 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-cream-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-earth-600 dark:text-earth-400 block mb-1">
                    Longitud
                  </label>
                  <input
                    type="text"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    placeholder="-77.0600519"
                    className="w-full text-xs font-mono p-2 rounded-xl border border-earth-300 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-cream-100"
                  />
                </div>
              </div>
            )}

            {/* Preview de Validación en Tiempo Real */}
            <div className="p-3.5 rounded-2xl bg-earth-50 dark:bg-earth-950/60 border border-earth-200 dark:border-earth-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[11px] text-earth-500 block">Distancia calculada al Salón:</span>
                <span className="font-bold text-sm text-earth-900 dark:text-cream-100">
                  {estimada.distancia != null
                    ? `${estimada.distancia} metros`
                    : "Obtenida al marcar vía GPS"}
                </span>
              </div>

              <div>
                {estimada.distancia != null ? (
                  estimada.fueraDeRango ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      ⚠️ Excede 50m (Activa alerta de auditoría)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      ✅ Dentro de 50m (Ubicación Válida)
                    </span>
                  )
                ) : (
                  <span className="text-xs text-earth-500 italic">
                    Sensor satelital en espera
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tarjeta de Marcaje Personal */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100 mb-1">
          Estado de {user?.nombre || "Colaborador"}
        </h2>
        <p className="text-xs text-earth-500 mb-4">
          La geolocalización valida tu presencia dentro del salón (radio {SALON_RADIO_METROS}m) para habilitar tus turnos.
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

                {/* Botón para Re-probar Check-in en modo pruebas */}
                <button
                  type="button"
                  onClick={() => handleMarcar("checkin", true)}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl border border-earth-300 dark:border-earth-700 bg-earth-50 dark:bg-earth-800 hover:bg-earth-100 dark:hover:bg-earth-750 text-earth-700 dark:text-cream-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-earth-500" />
                  <span>Re-probar Check-In con opción activa</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-cream-100 dark:bg-earth-950 border border-earth-200 dark:border-earth-800 text-earth-800 dark:text-cream-200 space-y-3">
                <CheckCircle2 className="w-8 h-8 text-sage-500 mx-auto" />
                <h3 className="font-bold text-sm">Jornada Completada</h3>
                <p className="text-xs text-earth-600 dark:text-earth-400">
                  Entrada: <strong>{miRegistro.hora_checkin} hrs</strong> | Salida:{" "}
                  <strong>{miRegistro.hora_checkout} hrs</strong>
                </p>

                {miRegistro.alerta_ubicacion ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                    ⚠️ Registrado fuera de local ({miRegistro.distancia_metros}m)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ✅ Verificado en Salón ({miRegistro.distancia_metros}m)
                  </span>
                )}

                {/* Botón para Re-probar Check-in en modo pruebas */}
                <button
                  type="button"
                  onClick={() => handleMarcar("checkin", true)}
                  disabled={actionLoading}
                  className="w-full mt-2 py-2.5 rounded-xl border border-earth-300 dark:border-earth-700 bg-earth-50 dark:bg-earth-800 hover:bg-earth-100 dark:hover:bg-earth-750 text-earth-700 dark:text-cream-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-earth-500" />
                  <span>Re-probar Check-In con opción activa</span>
                </button>
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
