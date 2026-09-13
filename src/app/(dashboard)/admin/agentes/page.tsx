"use client";

import React, { useState, useEffect } from "react";
import { Agente } from "@/lib/types";
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
} from "lucide-react";
import Link from "next/link";

export default function AdminAgentesPage() {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario nuevo colaborador
  const [nombre, setNombre] = useState("");
  const [pin, setPin] = useState("");
  const [rol, setRol] = useState<"agente" | "admin">("agente");
  const [especialidadesStr, setEspecialidadesStr] = useState("estilista");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarAgentes();
  }, []);

  const cargarAgentes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agentes");
      const data = await res.json();
      if (data.agentes) setAgentes(data.agentes);
    } catch (err) {
      console.error("Error cargando colaboradores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearAgente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !pin.trim()) {
      setError("Nombre y PIN de 4 dígitos son obligatorios");
      return;
    }

    if (pin.trim().length !== 4) {
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
      cargarAgentes();
    } catch (err) {
      setError("Error de red al guardar colaborador");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
            Gestión de roles, especialidades y credenciales de acceso por PIN.
          </p>
        </div>

        <button
          onClick={() => {
            setPin(String(Math.floor(1000 + Math.random() * 9000)));
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-sm shadow-md shadow-earth-500/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Colaborador</span>
        </button>
      </div>

      {/* Grid de Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentes.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-earth-500">{a.id}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    a.rol === "admin"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-earth-100 text-earth-800"
                  }`}
                >
                  {a.rol === "admin" ? "👑 Admin" : "✂️ Agente"}
                </span>
              </div>

              <h3 className="font-bold text-base text-earth-900 dark:text-cream-100">
                {a.nombre}
              </h3>

              <div className="mt-3 flex flex-wrap gap-1">
                {a.especialidades.map((esp, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-sage-100 dark:bg-sage-950 text-sage-800 dark:text-sage-300 font-semibold"
                  >
                    {esp}
                  </span>
                ))}
              </div>

              <div className="mt-4 space-y-1 text-xs text-earth-600 dark:text-earth-400">
                {a.telefono && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-earth-400" />
                    <span>{a.telefono}</span>
                  </p>
                )}
                {a.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-earth-400" />
                    <span className="truncate">{a.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-earth-100 dark:border-earth-800 flex items-center justify-between text-[11px]">
              <span className="text-earth-500">
                Turnos: <strong>{a.disponible_turnos ? "Habilitado" : "Pausado"}</strong>
              </span>
              <span className="text-sage-600 font-semibold">● Activo</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nuevo Colaborador */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
                Dar de Alta Colaborador
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-earth-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearAgente} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Laura Morales..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1">
                    PIN (4 Dígitos)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 font-mono text-center text-sm font-bold text-earth-900 dark:text-cream-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1">
                    Rol
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                  >
                    <option value="agente">Colaborador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1">
                  Especialidades (separadas por comas)
                </label>
                <input
                  type="text"
                  placeholder="estilista, colorista, manicurista..."
                  value={especialidadesStr}
                  onChange={(e) => setEspecialidadesStr(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="+52 55..."
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-700 dark:text-earth-300 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="correo@..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 text-earth-900 dark:text-cream-100"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-earth-200 text-xs font-semibold text-earth-700 hover:bg-earth-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-xs shadow-md shadow-earth-500/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Guardar Colaborador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
