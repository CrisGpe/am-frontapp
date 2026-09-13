"use client";

import React, { useState, useEffect } from "react";
import { UserSession, Servicio } from "@/lib/types";
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
} from "lucide-react";

export default function TurnosPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
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

  return (
    <div className="space-y-6">
      {/* Banner */}
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-sm shadow-md shadow-earth-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Turno</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/70 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Queue List */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
              Personas Esperando Atención ({turnos.length})
            </h2>
            <p className="text-xs text-earth-500">
              Clientes casuales sin cita previa asignados por el algoritmo
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {turnos.map((t) => {
              const esMiEspecialidad = user?.especialidades?.some(
                (e) => e.toLowerCase() === t.especialidad_requerida?.toLowerCase()
              );

              return (
                <div
                  key={t.id}
                  className="border border-earth-200 dark:border-earth-800 rounded-2xl p-5 bg-earth-50/40 dark:bg-earth-950/40 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-earth-500">
                        {t.id}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300">
                        En Espera
                      </span>
                    </div>

                    <h3 className="font-bold text-earth-900 dark:text-cream-100 text-base">
                      {t.nombre_consumidor}
                    </h3>
                    <p className="text-xs text-earth-600 dark:text-earth-400 mt-0.5 font-medium">
                      {t.nombre_servicio} ({formatCurrency(t.servicio?.precio_base || 0)})
                    </p>

                    <div className="mt-3 space-y-1 text-xs text-earth-600 dark:text-earth-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-earth-400" />
                        <span>Llegada: {t.hora_llegada} hrs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-earth-400" />
                        <span>
                          Especialidad Requerida:{" "}
                          <strong className="text-earth-800 dark:text-cream-200">
                            {t.especialidad_requerida}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Algoritmo Recommendation Box */}
                    <div className="mt-4 p-3 rounded-xl bg-white dark:bg-earth-900 border border-earth-200/80 dark:border-earth-800/80 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-earth-700 dark:text-cream-200 mb-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Sugerencia del Algoritmo:</span>
                      </div>

                      {t.agenteSugerido ? (
                        <div className="text-[11px] text-earth-600 dark:text-earth-400">
                          Asignar a:{" "}
                          <strong className="text-earth-900 dark:text-cream-100">
                            {t.agenteSugerido.nombre}
                          </strong>{" "}
                          (Score: {t.agenteSugerido.score}
                          {t.agenteSugerido.enAtencionActiva ? " - Actualmente en atención" : " - Libre"})
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400">
                          Sin agentes disponibles con la especialidad {t.especialidad_requerida}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-5 pt-3 border-t border-earth-200/80 dark:border-earth-800/80 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleAsignarTurno(t.id)}
                      className="flex-1 py-2.5 rounded-xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Asignación Automática
                    </button>

                    {esMiEspecialidad && (
                      <button
                        onClick={() => handleAsignarTurno(t.id, user?.userId)}
                        className="py-2.5 px-4 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Tomar Turno Yo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
