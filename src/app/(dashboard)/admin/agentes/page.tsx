"use client";

import React, { useState, useEffect } from "react";
import { Agente, AsistenciaRecord, BorradorEntry, RolAgente } from "@/lib/types";
import {
  Users,
  PlusCircle,
  Scissors,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  CalendarCheck,
  Clock,
  PauseCircle,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function AdminAgentesPage() {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaRecord[]>([]);
  const [borrador, setBorrador] = useState<BorradorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario nuevo colaborador
  const [nombre, setNombre] = useState("");
  const [pin, setPin] = useState("");
  const [rol, setRol] = useState<RolAgente>("agente");
  const [especialidadesStr, setEspecialidadesStr] = useState("estilista");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen && !submitting) {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, submitting]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resAgentes, resAsistencia, resBorrador] = await Promise.all([
        fetch("/api/agentes"),
        fetch("/api/asistencia"),
        fetch("/api/borrador"),
      ]);

      const dataAgentes = await resAgentes.json();
      const dataAsistencia = await resAsistencia.json();
      const dataBorrador = await resBorrador.json();

      if (dataAgentes.agentes) setAgentes(dataAgentes.agentes);
      if (dataAsistencia.asistencia) setAsistencias(dataAsistencia.asistencia);
      if (dataBorrador.borrador) setBorrador(dataBorrador.borrador);
    } catch (err) {
      console.error("Error cargando datos de colaboradores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisponibilidad = async (
    agenteId: string,
    estadoActual: boolean
  ) => {
    try {
      setUpdatingId(agenteId);
      const nuevoEstado = !estadoActual;
      const res = await fetch("/api/agentes/disponibilidad", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_agente: agenteId,
          disponible: nuevoEstado,
        }),
      });

      if (res.ok) {
        setAgentes((prev) =>
          prev.map((a) =>
            a.id === agenteId ? { ...a, disponible_turnos: nuevoEstado } : a
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar disponibilidad");
      }
    } catch {
      alert("Error de red al actualizar disponibilidad");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCrearAgente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !pin.trim()) {
      setError("Nombre y PIN son obligatorios");
      return;
    }

    if (!/^\d{4}$/.test(pin.trim())) {
      setError("El PIN debe tener exactamente 4 dígitos numéricos");
      return;
    }

    setSubmitting(true);
    setError(null);

    const especialidades = especialidadesStr
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    try {
      const res = await fetch("/api/agentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          pin,
          rol,
          especialidades,
          telefono,
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear colaborador");
        setSubmitting(false);
        return;
      }

      setNombre("");
      setPin("");
      setTelefono("");
      setEmail("");
      setModalOpen(false);
      setSubmitting(false);
      cargarDatos();
    } catch {
      setError("Error de red al guardar colaborador");
      setSubmitting(false);
    }
  };

  // Métricas de estado en tiempo real
  const totalColaboradores = agentes.length;
  const presentesHoy = agentes.filter((a) =>
    asistencias.some((as) => as.id_agente === a.id && as.hora_checkin && !as.hora_checkout)
  ).length;

  const enAtencionHoy = agentes.filter((a) =>
    borrador.some(
      (b) =>
        b.id_agente === a.id &&
        (b.etapa === "atencion" || b.etapa === "asesoria" || b.etapa === "fin_atencion")
    )
  ).length;

  const habilitadosReales = agentes.filter((a) => {
    const tieneAsistencia = asistencias.some(
      (as) => as.id_agente === a.id && as.hora_checkin && !as.hora_checkout
    );
    return a.activo && a.disponible_turnos && tieneAsistencia;
  }).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-earth-600 hover:text-earth-900 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al panel admin
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
            Equipo de Colaboradores
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Gestión sincronizada con pestañas <strong>Agentes</strong>, <strong>Asistencia</strong> y <strong>Borrador</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-600 transition-colors"
            title="Recargar estado"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setPin(String(Math.floor(1000 + Math.random() * 9000)));
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-earth-800 hover:bg-earth-900 text-white font-bold text-xs shadow-md shadow-earth-800/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Colaborador</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Operación en Tiempo Real */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-earth-500 uppercase tracking-wider">
            Total Equipo
          </p>
          <p className="text-2xl font-bold text-earth-900 dark:text-cream-100 mt-1">
            {totalColaboradores}
          </p>
          <span className="text-[10px] text-earth-400">Hoja: Agentes</span>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-earth-500 uppercase tracking-wider">
            Presentes Hoy
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {presentesHoy}
          </p>
          <span className="text-[10px] text-earth-400">Hoja: Asistencia</span>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-earth-500 uppercase tracking-wider">
            En Atención
          </p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {enAtencionHoy}
          </p>
          <span className="text-[10px] text-earth-400">Hoja: Borrador</span>
        </div>

        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-earth-500 uppercase tracking-wider">
            Recibiendo Turnos
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {habilitadosReales}
          </p>
          <span className="text-[10px] text-earth-400">Turnos Habilitados Reales</span>
        </div>
      </div>

      {/* Grid de Colaboradores */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-earth-300 border-t-earth-800 rounded-full animate-spin" />
          <p className="text-sm text-earth-600 dark:text-earth-400 font-medium animate-pulse">
            Consultando estado de colaboradores y asistencia...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentes.map((a) => {
            // Consulta de Asistencia de Hoy
            const regAsistencia = asistencias.find((as) => as.id_agente === a.id);
            const estaPresente = Boolean(
              regAsistencia?.hora_checkin && !regAsistencia?.hora_checkout
            );
            const yaSalio = Boolean(regAsistencia?.hora_checkout);

            // Consulta de Atención Activa en Borrador
            const ordenActiva = borrador.find(
              (b) =>
                b.id_agente === a.id &&
                (b.etapa === "atencion" ||
                  b.etapa === "asesoria" ||
                  b.etapa === "fin_atencion")
            );

            // Elegibilidad Real para el Algoritmo de Turnos
            // Regla: Requiere activo + disponible_turnos + check-in de asistencia hoy
            const elegibleTurnosReal = a.activo && a.disponible_turnos && estaPresente;

            return (
              <div
                key={a.id}
                className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-earth-300 dark:hover:border-earth-700 transition-colors"
              >
                <div>
                  {/* Top Bar Card */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-earth-500">
                      {a.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          a.rol === "admin"
                            ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-earth-100 text-earth-800 dark:bg-earth-800 dark:text-cream-200"
                        }`}
                      >
                        {a.rol === "admin" ? "👑 Admin" : "✂️ Agente"}
                      </span>
                      <span className="text-[11px] text-sage-600 font-semibold">
                        ● Activo
                      </span>
                    </div>
                  </div>

                  {/* Nombre */}
                  <h3 className="font-bold text-base text-earth-900 dark:text-cream-100">
                    {a.nombre}
                  </h3>

                  {/* Especialidades */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {a.especialidades.map((esp, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-sage-50 dark:bg-sage-950 text-sage-800 dark:text-sage-300 border border-sage-200 dark:border-sage-800 font-medium"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>

                  {/* Contacto */}
                  <div className="mt-3.5 space-y-1 text-xs text-earth-600 dark:text-earth-400">
                    {a.telefono && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-earth-400 shrink-0" />
                        <span>{a.telefono}</span>
                      </p>
                    )}
                    {a.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-earth-400 shrink-0" />
                        <span className="truncate">{a.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Bloque de Estados Sincronizados en Tiempo Real */}
                <div className="pt-3 border-t border-earth-100 dark:border-earth-800/80 space-y-2 text-xs">
                  {/* 1. Estado de Asistencia (Hoja Asistencia) */}
                  <div className="flex items-center justify-between">
                    <span className="text-earth-500 text-[11px]">Asistencia:</span>
                    {estaPresente ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Presente ({regAsistencia?.hora_checkin})
                      </span>
                    ) : yaSalio ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                        <Clock className="w-3 h-3" />
                        Salida ({regAsistencia?.hora_checkout})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                        <X className="w-3 h-3" />
                        Sin Asistencia Hoy
                      </span>
                    )}
                  </div>

                  {/* 2. Estado Operativo (Hoja Borrador) */}
                  <div className="flex items-center justify-between">
                    <span className="text-earth-500 text-[11px]">Operación:</span>
                    {ordenActiva ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 truncate max-w-[180px]">
                        <Scissors className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          Atendiendo: {ordenActiva.nombre_servicio}
                        </span>
                      </span>
                    ) : estaPresente ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                        ● Libre / En Espera
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">
                        No disponible
                      </span>
                    )}
                  </div>

                  {/* 3. Recepción de Turnos Real (Algoritmo Turnos) */}
                  <div className="flex items-center justify-between pt-1 border-t border-dashed border-earth-100 dark:border-earth-800">
                    <span className="text-earth-500 text-[11px]">Turnos:</span>
                    <div className="flex items-center gap-1.5">
                      {elegibleTurnosReal ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Habilitado
                        </span>
                      ) : !a.disponible_turnos ? (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          Pausado
                        </span>
                      ) : (
                        <span
                          className="text-[11px] font-bold text-rose-600 dark:text-rose-400"
                          title="No recibe turnos porque no ha registrado check-in de asistencia hoy"
                        >
                          Inactivo (Falta Asistencia)
                        </span>
                      )}

                      {/* Botón Switch para Admin */}
                      <button
                        onClick={() =>
                          handleToggleDisponibilidad(a.id, a.disponible_turnos)
                        }
                        disabled={updatingId === a.id}
                        className={`p-1 rounded-lg transition-colors ${
                          a.disponible_turnos
                            ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                            : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        }`}
                        title={
                          a.disponible_turnos
                            ? "Hacer clic para pausar recepción de turnos"
                            : "Hacer clic para habilitar recepción de turnos"
                        }
                      >
                        {updatingId === a.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : a.disponible_turnos ? (
                          <PauseCircle className="w-4 h-4" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nuevo Colaborador */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={() => !submitting && setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl w-full max-w-md shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-colaborador-title"
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="modal-colaborador-title"
                className="text-lg font-bold text-earth-900 dark:text-cream-100"
              >
                Dar de Alta Colaborador
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-earth-400 hover:text-earth-600"
                aria-label="Cerrar"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearAgente} className="space-y-4">
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1"
                >
                  Nombre Completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Laura Gómez"
                  className="w-full px-3 py-2 rounded-xl border border-earth-200 dark:border-earth-800 bg-earth-50 dark:bg-earth-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-earth-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pin"
                    className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1"
                  >
                    PIN (4 dígitos)
                  </label>
                  <input
                    id="pin"
                    type="text"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-earth-200 dark:border-earth-800 bg-earth-50 dark:bg-earth-950 text-sm font-mono text-center tracking-widest focus:outline-hidden focus:ring-2 focus:ring-earth-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rol"
                    className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1"
                  >
                    Rol de Acceso
                  </label>
                  <select
                    id="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value as RolAgente)}
                    className="w-full px-3 py-2 rounded-xl border border-earth-200 dark:border-earth-800 bg-earth-50 dark:bg-earth-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-earth-500"
                  >
                    <option value="agente">Agente / Estilista</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="especialidades"
                  className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1"
                >
                  Especialidades (separadas por coma)
                </label>
                <input
                  id="especialidades"
                  type="text"
                  value={especialidadesStr}
                  onChange={(e) => setEspecialidadesStr(e.target.value)}
                  placeholder="estilista, colorista, manicurista"
                  className="w-full px-3 py-2 rounded-xl border border-earth-200 dark:border-earth-800 bg-earth-50 dark:bg-earth-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-earth-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1"
                  >
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full px-3 py-2 rounded-xl border border-earth-200 dark:border-earth-800 bg-earth-50 dark:bg-earth-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-earth-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@salon.com"
                    className="w-full px-3 py-2 rounded-xl border border-earth-200 dark:border-earth-800 bg-earth-50 dark:bg-earth-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-earth-500"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                  {error}
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-earth-200 dark:border-earth-800 text-xs font-semibold text-earth-600 hover:bg-earth-50 dark:hover:bg-earth-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-earth-800 hover:bg-earth-900 text-white text-xs font-bold shadow-md shadow-earth-800/20 disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Guardar en Google Sheets"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
