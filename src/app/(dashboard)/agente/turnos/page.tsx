"use client";

import React, { useState, useEffect } from "react";
import { UserSession, Servicio, ColaAgenteItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Clock,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Zap,
  UserCheck,
  UserX,
  ArrowRight,
  HelpCircle,
  Crown,
  Layers,
} from "lucide-react";

export default function TurnosPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [colaAgentes, setColaAgentes] = useState<ColaAgenteItem[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>("todas");
  const [disponibleTurnos, setDisponibleTurnos] = useState(true);
  const [loading, setLoading] = useState(true);
  const [nuevoModalOpen, setNuevoModalOpen] = useState(false);

  // Formulario nuevo turno
  const [nombreConsumidor, setNombreConsumidor] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [notas, setNotas] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarSesion();
    cargarDatos();
  }, []);

  const cargarSesion = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setUser(data.user);

      const resDisp = await fetch("/api/agentes/disponibilidad");
      const dataDisp = await resDisp.json();
      if (typeof dataDisp.disponible_turnos === "boolean") {
        setDisponibleTurnos(dataDisp.disponible_turnos);
      }
    } catch (err) {
      console.error("Error al cargar sesión:", err);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resTurnos, resServ] = await Promise.all([
        fetch("/api/turnos"),
        fetch("/api/servicios"),
      ]);
      const dataTurnos = await resTurnos.json();
      const dataServ = await resServ.json();

      if (dataTurnos.turnos) setTurnos(dataTurnos.turnos);
      if (dataTurnos.colaAgentes) setColaAgentes(dataTurnos.colaAgentes);
      if (dataServ.servicios) setServicios(dataServ.servicios);
    } catch (err) {
      console.error("Error cargando turnos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisponibilidad = async () => {
    const nuevoValor = !disponibleTurnos;
    setDisponibleTurnos(nuevoValor);

    try {
      await fetch("/api/agentes/disponibilidad", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponible: nuevoValor }),
      });
      cargarDatos();
    } catch (err) {
      console.error("Error cambiando disponibilidad:", err);
    }
  };

  const handleCrearTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreConsumidor.trim() || !servicioId) {
      setError("Por favor completa el nombre y selecciona un servicio");
      return;
    }

    setFormSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_consumidor: nombreConsumidor,
          id_servicio: servicioId,
          notas,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al solicitar turno");
        setFormSubmitting(false);
        return;
      }

      setNombreConsumidor("");
      setServicioId("");
      setNotas("");
      setNuevoModalOpen(false);
      setFormSubmitting(false);
      setActionSuccess("Turno agregado exitosamente a la cola");
      setTimeout(() => setActionSuccess(null), 4000);
      cargarDatos();
    } catch (err) {
      setError("Error de red al crear turno");
      setFormSubmitting(false);
    }
  };

  const handleAsignarTurno = async (idTurno: string, agenteManualId?: string) => {
    setError(null);
    try {
      const res = await fetch("/api/turnos/asignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_turno: idTurno,
          id_agente_manual: agenteManualId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo asignar el turno");
        return;
      }

      setActionSuccess(
        `¡Turno asignado a ${data.agenteAsignado.nombre}! Se creó la OATC ${data.oatc.id_oatc} en el Borrador.`
      );
      setTimeout(() => setActionSuccess(null), 5000);
      cargarDatos();
    } catch (err) {
      setError("Error de red al asignar turno");
    }
  };

  // 1. Agente conectado en la cola
  const miAgente = colaAgentes.find((a) => a.id === user?.userId);

  // 2. Colaboradores elegibles y libres para turnos
  const colaboradoresLibres = colaAgentes.filter(
    (a) => a.elegible && !a.enAtencionActiva
  );

  // Posición personal en la cola (1-indexed entre los libres)
  const miIndiceLibre = colaboradoresLibres.findIndex(
    (a) => a.id === user?.userId
  );
  const miPosicionEnCola = miIndiceLibre !== -1 ? miIndiceLibre + 1 : null;

  // 3. Extraer especialidades únicas de todos los agentes
  const todasEspecialidades = Array.from(
    new Set(
      colaAgentes
        .flatMap((a) => a.especialidades || [])
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  // 4. Filtrar colaboradores según especialidad seleccionada
  const colaFiltrada = colaAgentes.filter((agente) => {
    if (filtroEspecialidad === "todas") return true;
    return (agente.especialidades || []).some(
      (e) => e.toLowerCase() === filtroEspecialidad.toLowerCase()
    );
  });

  return (
    <div className="space-y-6">
      {/* Banner Superior */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-earth-500" />
            <span>Sistema Inteligente de Asignación</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
            Cola de Espera para Turnos
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Prioriza por especialidad requerida y colaboradores con mayor tiempo de espera en cola.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle disponibilidad */}
          <button
            onClick={handleToggleDisponibilidad}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
              disponibleTurnos
                ? "bg-sage-50 dark:bg-sage-950 border-sage-300 text-sage-800 dark:text-sage-200"
                : "bg-earth-100 dark:bg-earth-800 border-earth-300 text-earth-600 dark:text-cream-300"
            }`}
          >
            {disponibleTurnos ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse" />
                <UserCheck className="w-4 h-4" />
                <span>Disponible para Turnos</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-earth-400" />
                <UserX className="w-4 h-4" />
                <span>En Pausa (No Recibir)</span>
              </>
            )}
          </button>

          <button
            onClick={cargarDatos}
            className="p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-600 transition-colors"
            title="Recargar cola"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setNuevoModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-earth-800 hover:bg-earth-900 text-white font-bold text-sm shadow-md shadow-earth-800/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Turno</span>
          </button>
        </div>
      </div>

      {/* Notificación de Éxito */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/70 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjeta Hero: Mi Posición en Cola */}
      {miAgente && (
        <div
          className={`border rounded-3xl p-6 shadow-sm transition-all ${
            miPosicionEnCola === 1
              ? "bg-gradient-to-br from-amber-500/15 via-amber-50/50 to-orange-50/30 dark:from-amber-950/40 dark:via-earth-900 dark:to-amber-950/20 border-amber-300 dark:border-amber-700/80 shadow-amber-500/10"
              : miPosicionEnCola && miPosicionEnCola > 1
              ? "bg-gradient-to-br from-earth-50 to-white dark:from-earth-900 dark:to-earth-950 border-earth-200 dark:border-earth-800"
              : miAgente.enAtencionActiva
              ? "bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-earth-900 border-purple-200 dark:border-purple-800"
              : "bg-gradient-to-br from-rose-50/60 to-white dark:from-rose-950/20 dark:to-earth-900 border-rose-200 dark:border-rose-900/60"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  miPosicionEnCola === 1
                    ? "bg-amber-500 text-white shadow-amber-500/30 animate-pulse"
                    : miPosicionEnCola && miPosicionEnCola > 1
                    ? "bg-earth-800 dark:bg-earth-700 text-white"
                    : miAgente.enAtencionActiva
                    ? "bg-purple-600 text-white"
                    : "bg-earth-400 text-white"
                }`}
              >
                {miPosicionEnCola === 1 ? (
                  <Crown className="w-7 h-7" />
                ) : miPosicionEnCola && miPosicionEnCola > 1 ? (
                  <span className="text-xl font-bold font-mono">#{miPosicionEnCola}</span>
                ) : miAgente.enAtencionActiva ? (
                  <Scissors className="w-6 h-6" />
                ) : (
                  <UserX className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-earth-500 dark:text-earth-400 uppercase tracking-wider">
                    Tu Estado en Rotación
                  </span>
                  {miPosicionEnCola === 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                      Siguiente Turno ⚡
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-earth-900 dark:text-cream-100 tracking-tight mt-0.5">
                  {miPosicionEnCola === 1
                    ? "¡Eres el #1 en la cola de turnos!"
                    : miPosicionEnCola && miPosicionEnCola > 1
                    ? `Estás en la posición #${miPosicionEnCola} de la cola`
                    : miAgente.enAtencionActiva
                    ? `En Atención Activa: ${miAgente.ordenActiva?.nombre_servicio || "Servicio"}`
                    : !miAgente.disponible_turnos
                    ? "Turnos en Pausa Manual"
                    : miAgente.motivoNoElegible || "No disponible para turnos"}
                </h2>

                <p className="text-xs text-earth-600 dark:text-earth-400 mt-1 max-w-xl leading-relaxed">
                  {miPosicionEnCola === 1
                    ? "El algoritmo inteligente te asignará de forma preferente el siguiente cliente casual que ingrese solicitando una de tus especialidades."
                    : miPosicionEnCola && miPosicionEnCola > 1
                    ? `Hay ${miPosicionEnCola - 1} compañero(s) disponible(s) antes de ti en la rotación por tiempo de espera.`
                    : miAgente.enAtencionActiva
                    ? "Al finalizar tu atención técnica y registrarse el cobro en Caja, volverás a posicionarte en la rotación de turnos."
                    : !miAgente.disponible_turnos
                    ? "Has pausado la recepción de turnos automáticos. Puedes activarte nuevamente con el botón superior."
                    : "Debes registrar tu asistencia (check-in de entrada) para poder ser elegible en la rotación de turnos de hoy."}
                </p>
              </div>
            </div>

            {/* Badges de soporte */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-earth-200 dark:border-earth-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/80 dark:bg-earth-800/80 border border-earth-200 dark:border-earth-700 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{miAgente.totalAtencionesHoy} atenciones hoy</span>
              </div>
              <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                {miAgente.especialidades.map((esp, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-sage-50 text-sage-800 dark:bg-sage-950 dark:text-sage-300 border border-sage-200 dark:border-sage-800 font-medium capitalize"
                  >
                    {esp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Responsivo Principal: Colaboradores (Izq) y Clientes (Der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna 1: Rotación de Colaboradores (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-earth-600 dark:text-earth-400" />
                  <span>Rotación de Colaboradores ({colaFiltrada.length})</span>
                </h2>
                <p className="text-xs text-earth-500 dark:text-earth-400">
                  Orden determinado según algoritmo de turnos y tiempos de espera
                </p>
              </div>
            </div>

            {/* Píldoras de Filtro por Especialidad */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-semibold text-earth-400 uppercase mr-1 flex items-center gap-1 shrink-0">
                <Layers className="w-3 h-3" /> Especialidad:
              </span>
              <button
                onClick={() => setFiltroEspecialidad("todas")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filtroEspecialidad === "todas"
                    ? "bg-earth-800 text-white dark:bg-cream-100 dark:text-earth-900 shadow-xs"
                    : "bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-earth-300 hover:bg-earth-200"
                }`}
              >
                Todas ({colaAgentes.length})
              </button>
              {todasEspecialidades.map((esp) => {
                const count = colaAgentes.filter((a) =>
                  a.especialidades.some((e) => e.toLowerCase() === esp)
                ).length;
                return (
                  <button
                    key={esp}
                    onClick={() => setFiltroEspecialidad(esp)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                      filtroEspecialidad === esp
                        ? "bg-earth-800 text-white dark:bg-cream-100 dark:text-earth-900 shadow-xs"
                        : "bg-earth-100 dark:bg-earth-800 text-earth-600 dark:text-earth-300 hover:bg-earth-200"
                    }`}
                  >
                    {esp} ({count})
                  </button>
                );
              })}
            </div>

            {/* Lista de Colaboradores */}
            {loading ? (
              <div className="py-12 text-center text-sm text-earth-500">
                Consultando rotación de colaboradores...
              </div>
            ) : colaFiltrada.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-earth-200 dark:border-earth-800 rounded-2xl">
                <p className="text-xs text-earth-500">
                  No hay colaboradores registrados con la especialidad seleccionada.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {colaFiltrada.map((agente) => {
                  const esYo = agente.id === user?.userId;
                  const estaLibre = agente.elegible && !agente.enAtencionActiva;
                  // Si está libre, calculamos su puesto entre los libres
                  const puestoLibre = estaLibre
                    ? colaFiltrada
                        .filter((a) => a.elegible && !a.enAtencionActiva)
                        .findIndex((a) => a.id === agente.id) + 1
                    : null;

                  return (
                    <div
                      key={agente.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        esYo
                          ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 ring-2 ring-amber-400/40 shadow-xs"
                          : "bg-earth-50/40 dark:bg-earth-950/40 border-earth-200/80 dark:border-earth-800/80 hover:bg-earth-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Puesto */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                            puestoLibre === 1
                              ? "bg-amber-500 text-white shadow-xs"
                              : puestoLibre && puestoLibre <= 3
                              ? "bg-earth-800 text-white dark:bg-earth-700"
                              : puestoLibre
                              ? "bg-earth-200 dark:bg-earth-800 text-earth-700 dark:text-cream-200"
                              : "bg-earth-100 dark:bg-earth-800/50 text-earth-400"
                          }`}
                        >
                          {puestoLibre ? `#${puestoLibre}` : "—"}
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-earth-900 dark:text-cream-100 truncate">
                              {agente.nombre}
                            </span>
                            {esYo && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                                Tú
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {agente.especialidades.map((esp, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-white dark:bg-earth-900 text-earth-600 dark:text-earth-300 border border-earth-200/80 dark:border-earth-800 capitalize font-medium"
                              >
                                {esp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Estado y atenciones */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {agente.enAtencionActiva ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 max-w-[150px] truncate">
                            <Scissors className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {agente.ordenActiva?.nombre_servicio || "En Atención"}
                            </span>
                          </span>
                        ) : estaLibre ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                            ● Libre en espera
                          </span>
                        ) : !agente.disponible_turnos ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                            ⏸️ Pausado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                            Sin asistencia
                          </span>
                        )}

                        <span className="text-[10px] text-earth-500">
                          {agente.totalAtencionesHoy} atenciones hoy
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna 2: Personas Esperando Atención (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
                  Clientes en Espera ({turnos.length})
                </h2>
                <p className="text-xs text-earth-500">
                  Cola de clientes casuales sin cita previa
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-earth-500">
                Consultando cola de espera en tiempo real...
              </div>
            ) : turnos.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-earth-200 dark:border-earth-800 rounded-2xl">
                <Users className="w-10 h-10 mx-auto text-earth-400 mb-2 opacity-50" />
                <p className="text-sm font-medium text-earth-600 dark:text-earth-400">
                  No hay turnos en espera en este momento
                </p>
                <p className="text-xs text-earth-400 mt-1">
                  Los nuevos clientes casuales que lleguen a recepción aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {turnos.map((t) => {
                  const esMiEspecialidad = user?.especialidades?.some(
                    (e) => e.toLowerCase() === t.especialidad_requerida?.toLowerCase()
                  );

                  return (
                    <div
                      key={t.id}
                      className="border border-earth-200 dark:border-earth-800 rounded-2xl p-4 bg-earth-50/40 dark:bg-earth-950/40 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold text-earth-500">
                            {t.id}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300">
                            En Espera
                          </span>
                        </div>

                        <h3 className="font-bold text-earth-900 dark:text-cream-100 text-sm">
                          {t.nombre_consumidor}
                        </h3>
                        <p className="text-xs text-earth-600 dark:text-earth-400 mt-0.5 font-medium">
                          {t.nombre_servicio} ({formatCurrency(t.servicio?.precio_base || 0)})
                        </p>

                        <div className="mt-2.5 space-y-1 text-xs text-earth-600 dark:text-earth-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-earth-400" />
                            <span>Llegada: {t.hora_llegada} hrs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Scissors className="w-3.5 h-3.5 text-earth-400" />
                            <span>
                              Especialidad:{" "}
                              <strong className="text-earth-800 dark:text-cream-200">
                                {t.especialidad_requerida}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Sugerencia del Algoritmo */}
                        <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-earth-900 border border-earth-200/80 dark:border-earth-800/80 text-xs">
                          <div className="flex items-center gap-1 font-bold text-earth-700 dark:text-cream-200 mb-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[11px]">Sugerencia del Algoritmo:</span>
                          </div>

                          {t.agenteSugerido ? (
                            <div className="text-[11px] text-earth-600 dark:text-earth-400">
                              Asignar a:{" "}
                              <strong className="text-earth-900 dark:text-cream-100">
                                {t.agenteSugerido.nombre}
                              </strong>{" "}
                              {t.agenteSugerido.enAtencionActiva ? "(En atención)" : "(Libre)"}
                            </div>
                          ) : (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400">
                              Sin agentes disponibles con la especialidad {t.especialidad_requerida}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="mt-3.5 pt-2.5 border-t border-earth-200/80 dark:border-earth-800/80 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleAsignarTurno(t.id)}
                          className="flex-1 py-2 rounded-xl bg-earth-800 hover:bg-earth-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Auto-Asignar
                        </button>

                        {esMiEspecialidad && (
                          <button
                            onClick={() => handleAsignarTurno(t.id, user?.userId)}
                            className="py-2 px-3 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Tomar Turno
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Registrar Turno */}
      {nuevoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100 mb-1">
              Registrar Turno en Espera
            </h2>
            <p className="text-xs text-earth-500 mb-4">
              Agrega a un cliente que acaba de llegar al salón sin cita previa
            </p>

            <form onSubmit={handleCrearTurno} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
                  Nombre del Consumidor
                </label>
                <input
                  type="text"
                  placeholder="Ej: Laura Méndez..."
                  value={nombreConsumidor}
                  onChange={(e) => setNombreConsumidor(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
                  Servicio Solicitado
                </label>
                <select
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                >
                  <option value="">-- Elige el servicio deseado --</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.especialidad_requerida}) — {formatCurrency(s.precio_base)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1.5">
                  Notas / Preferencias (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Petición especial o aclaración..."
                  className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNuevoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-earth-200 text-xs font-semibold text-earth-700 hover:bg-earth-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-xs shadow-md shadow-earth-500/20 active:scale-95 disabled:opacity-50"
                >
                  {formSubmitting ? "Guardando..." : "Ingresar a la Cola"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
