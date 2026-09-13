"use client";

import React, { useState, useEffect } from "react";
import { Servicio, Agente, UserSession } from "@/lib/types";
import { formatCurrency, getTodayDateString } from "@/lib/utils";
import { TimeSlot } from "@/lib/agenda-utils";
import {
  Calendar,
  Clock,
  Scissors,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  XCircle,
  CalendarCheck,
} from "lucide-react";

export default function ClienteCitasPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [citas, setCitas] = useState<any[]>([]);

  // Estado del flujo de reserva
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const [agenteSeleccionado, setAgenteSeleccionado] = useState<Agente | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(getTodayDateString());
  const [slotsDisponibles, setSlotsDisponibles] = useState<TimeSlot[]>([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resUser, resServ, resAg, resCitas] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/servicios"),
        fetch("/api/agentes"),
        fetch("/api/citas"),
      ]);

      const dataUser = await resUser.json();
      const dataServ = await resServ.json();
      const dataAg = await resAg.json();
      const dataCitas = await resCitas.json();

      if (dataUser.user) setUser(dataUser.user);
      if (dataServ.servicios) setServicios(dataServ.servicios);
      if (dataAg.agentes) setAgentes(dataAg.agentes);
      if (dataCitas.citas) setCitas(dataCitas.citas);
    } catch (err) {
      console.error("Error cargando agenda:", err);
    }
  };

  // Filtrar agentes por la especialidad del servicio seleccionado
  const agentesElegibles = agentes.filter((a) => {
    if (!servicioSeleccionado) return false;
    return a.especialidades.some(
      (esp) => esp.toLowerCase() === servicioSeleccionado.especialidad_requerida.toLowerCase()
    );
  });

  // Consultar slots cuando cambian agente, servicio o fecha
  useEffect(() => {
    if (servicioSeleccionado && agenteSeleccionado && fechaSeleccionada) {
      consultarSlots();
    } else {
      setSlotsDisponibles([]);
    }
  }, [servicioSeleccionado, agenteSeleccionado, fechaSeleccionada]);

  const consultarSlots = async () => {
    if (!agenteSeleccionado || !servicioSeleccionado) return;
    setLoadingSlots(true);
    setHoraSeleccionada("");

    try {
      const url = `/api/agenda/slots?agenteId=${agenteSeleccionado.id}&servicioId=${servicioSeleccionado.id}&fecha=${fechaSeleccionada}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.slots) {
        setSlotsDisponibles(data.slots);
      }
    } catch (err) {
      console.error("Error consultando slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioSeleccionado || !agenteSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
      setErrorMsg("Por favor completa todos los pasos: servicio, especialista, fecha y hora.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_agente: agenteSeleccionado.id,
          id_servicio: servicioSeleccionado.id,
          fecha: fechaSeleccionada,
          hora: horaSeleccionada,
          notas,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "No se pudo agendar la cita");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(
        `¡Cita confirmada con éxito para el ${fechaSeleccionada} a las ${horaSeleccionada} hrs con ${agenteSeleccionado.nombre}!`
      );
      setServicioSeleccionado(null);
      setAgenteSeleccionado(null);
      setHoraSeleccionada("");
      setNotas("");
      setSubmitting(false);

      // Recargar citas del cliente
      cargarDatos();
    } catch (err) {
      setErrorMsg("Error de red al agendar la cita");
      setSubmitting(false);
    }
  };

  const handleCancelarCita = async (idCita: string) => {
    try {
      await fetch("/api/citas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cita: idCita, estado: "cancelada" }),
      });
      cargarDatos();
    } catch (err) {
      console.error("Error cancelando cita:", err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <CalendarCheck className="w-4 h-4 text-sage-600" />
          <span>Agenda Exclusiva de Servicios</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
          Reservar Nueva Cita
        </h1>
        <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
          Elige el servicio, tu especialista favorito y reserva en los horarios disponibles en tiempo real.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/70 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs flex items-center gap-2 animate-fade-in font-semibold">
          <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Selección Paso a Paso (2 columnas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* PASO 1: Elegir Servicio */}
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-earth-900 dark:text-cream-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-earth-500 text-white text-xs flex items-center justify-center">
                1
              </span>
              Selecciona el Servicio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {servicios.map((s) => {
                const seleccionado = servicioSeleccionado?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setServicioSeleccionado(s);
                      setAgenteSeleccionado(null);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      seleccionado
                        ? "bg-earth-500 text-white border-earth-600 shadow-md shadow-earth-500/20"
                        : "bg-earth-50/50 dark:bg-earth-950 border-earth-200 dark:border-earth-800 text-earth-800 dark:text-cream-200 hover:bg-earth-100/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          seleccionado
                            ? "bg-white/20 text-white"
                            : "bg-earth-200 dark:bg-earth-800 text-earth-700 dark:text-cream-200"
                        }`}
                      >
                        {s.categoria}
                      </span>
                      <span className="text-xs font-bold">
                        {formatCurrency(s.precio_base)}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs mt-1.5 line-clamp-1">{s.nombre}</h3>
                    <p
                      className={`text-[11px] mt-1 flex items-center gap-1 ${
                        seleccionado ? "text-cream-200" : "text-earth-500"
                      }`}
                    >
                      <Clock className="w-3 h-3" /> {s.duracion_min} min | Esp: {s.especialidad_requerida}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 2: Elegir Especialista */}
          {servicioSeleccionado && (
            <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm animate-fade-in">
              <h2 className="text-sm font-bold text-earth-900 dark:text-cream-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-earth-500 text-white text-xs flex items-center justify-center">
                  2
                </span>
                Elige tu Especialista ({servicioSeleccionado.especialidad_requerida})
              </h2>

              {agentesElegibles.length === 0 ? (
                <p className="text-xs text-amber-600 py-3">
                  No hay colaboradores disponibles con la especialidad requerida.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agentesElegibles.map((a) => {
                    const seleccionado = agenteSeleccionado?.id === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAgenteSeleccionado(a)}
                        className={`p-3.5 rounded-2xl text-left border transition-all ${
                          seleccionado
                            ? "bg-earth-500 text-white border-earth-600 shadow-md shadow-earth-500/20"
                            : "bg-earth-50/50 dark:bg-earth-950 border-earth-200 dark:border-earth-800 text-earth-800 dark:text-cream-200 hover:bg-earth-100/70"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <h3 className="font-bold text-xs">{a.nombre}</h3>
                        </div>
                        <p
                          className={`text-[11px] mt-1 ${
                            seleccionado ? "text-cream-200" : "text-earth-500"
                          }`}
                        >
                          Especialidades: {a.especialidades.join(", ")}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PASO 3 y 4: Fecha y Horarios */}
          {agenteSeleccionado && (
            <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm animate-fade-in space-y-4">
              <h2 className="text-sm font-bold text-earth-900 dark:text-cream-100 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-earth-500 text-white text-xs flex items-center justify-center">
                  3
                </span>
                Fecha y Horario Disponible
              </h2>

              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
                  Fecha Deseada
                </label>
                <input
                  type="date"
                  min={getTodayDateString()}
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  className="w-full max-w-xs p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-2">
                  Horarios Disponibles para {fechaSeleccionada}
                </label>

                {loadingSlots ? (
                  <div className="py-4 text-xs text-earth-500">Calculando disponibilidad...</div>
                ) : slotsDisponibles.length === 0 ? (
                  <p className="text-xs text-amber-600 py-3">
                    El colaborador no tiene horario configurado para este día o no hay cupos libres.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slotsDisponibles.map((slot) => {
                      const sel = horaSeleccionada === slot.hora;
                      return (
                        <button
                          key={slot.hora}
                          type="button"
                          disabled={!slot.disponible}
                          onClick={() => setHoraSeleccionada(slot.hora)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                            !slot.disponible
                              ? "opacity-30 bg-earth-100 text-earth-400 cursor-not-allowed line-through"
                              : sel
                              ? "bg-sage-600 text-white shadow-md shadow-sage-600/25 scale-105"
                              : "bg-earth-50 dark:bg-earth-950 border border-earth-200 text-earth-800 hover:bg-earth-100"
                          }`}
                        >
                          {slot.hora}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notas opcionales */}
              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
                  Notas para el Especialista (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Alergias, preferencias o detalles que deba saber..."
                  className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                />
              </div>

              {/* Botón de Confirmación */}
              <button
                type="button"
                onClick={handleConfirmarCita}
                disabled={submitting || !horaSeleccionada}
                className="w-full py-3 rounded-2xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-sm shadow-md shadow-earth-500/20 active:scale-95 transition-all disabled:opacity-40"
              >
                {submitting ? "Confirmando..." : "Confirmar y Reservar Cita"}
              </button>
            </div>
          )}
        </div>

        {/* Citas Agendadas del Cliente (1 columna lateral) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-earth-900 dark:text-cream-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-earth-500" />
              Mis Citas Agendadas ({citas.length})
            </h2>

            {citas.length === 0 ? (
              <p className="text-xs text-earth-500 py-6 text-center">
                No tienes citas agendadas actualmente.
              </p>
            ) : (
              <div className="space-y-3">
                {citas.map((cita) => {
                  const cancelada = cita.estado === "cancelada";
                  return (
                    <div
                      key={cita.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                        cancelada
                          ? "opacity-50 bg-gray-50 border-gray-200"
                          : "bg-earth-50/60 dark:bg-earth-950 border-earth-200 dark:border-earth-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-earth-500">
                          {cita.id}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            cancelada
                              ? "bg-red-100 text-red-700"
                              : "bg-sage-100 text-sage-800 dark:bg-sage-950 dark:text-sage-300"
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </div>

                      <h4 className="font-bold text-earth-900 dark:text-cream-100">
                        {cita.nombre_servicio}
                      </h4>

                      <div className="text-earth-600 dark:text-earth-400 space-y-0.5 text-[11px]">
                        <p>
                          📅 Fecha: <strong>{cita.fecha}</strong> a las <strong>{cita.hora} hrs</strong>
                        </p>
                        <p>
                          👤 Especialista: <strong>{cita.nombre_agente}</strong>
                        </p>
                      </div>

                      {!cancelada && (
                        <div className="pt-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleCancelarCita(cita.id)}
                            className="text-[11px] text-red-600 hover:text-red-800 font-semibold"
                          >
                            Cancelar cita
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
