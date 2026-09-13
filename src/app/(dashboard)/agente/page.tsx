"use client";

import React, { useState, useEffect } from "react";
import { BorradorEntry, EtapaOATC, UserSession } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CobranzaModal } from "@/components/oatc/CobranzaModal";
import { NuevaOATCModal } from "@/components/oatc/NuevaOATCModal";
import {
  Scissors,
  Clock,
  User,
  CheckCircle,
  Play,
  CreditCard,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Receipt,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function AgenteDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [oatcs, setOatcs] = useState<BorradorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEtapa, setFiltroEtapa] = useState<string>("todas");

  // Modales
  const [cobranzaOatc, setCobranzaOatc] = useState<BorradorEntry | null>(null);
  const [nuevaOatcOpen, setNuevaOatcOpen] = useState(false);

  useEffect(() => {
    cargarSesion();
    cargarBorrador();
  }, []);

  const cargarSesion = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error("Error al cargar sesión:", err);
    }
  };

  const cargarBorrador = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/borrador");
      const data = await res.json();
      if (data.borrador) {
        setOatcs(data.borrador);
      }
    } catch (err) {
      console.error("Error cargando borrador:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEtapa = async (id_oatc: string, nuevaEtapa: EtapaOATC) => {
    try {
      const res = await fetch("/api/borrador", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_oatc,
          updates: { etapa: nuevaEtapa },
        }),
      });

      if (res.ok) {
        cargarBorrador();
      }
    } catch (err) {
      console.error("Error cambiando etapa:", err);
    }
  };

  // Filtrado de OATCs asignadas a este agente o todas si es admin
  const misOatcs = oatcs.filter(
    (item) => item.id_agente === user?.userId || user?.rol === "admin"
  );

  const oatcsFiltradas = misOatcs.filter((item) => {
    if (filtroEtapa === "todas") return true;
    return item.etapa === filtroEtapa;
  });

  const etapaColors: Record<string, string> = {
    asesoria: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-300",
    atencion: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300",
    fin_atencion: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border-purple-300",
    cobranza: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300",
    completada: "bg-sage-100 text-sage-800 dark:bg-sage-950 dark:text-sage-200 border-sage-300",
  };

  const etapaLabels: Record<string, string> = {
    asesoria: "1. Asesoría",
    atencion: "2. En Atención",
    fin_atencion: "3. Fin Atención",
    cobranza: "4. En Cobranza",
    completada: "5. Completada",
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-earth-500" />
            <span>Centro Operativo del Colaborador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-earth-900 dark:text-cream-100">
            ¡Hola, {user?.nombre || "Colaborador"}!
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Especialidades:{" "}
            <span className="font-semibold text-earth-800 dark:text-cream-200">
              {user?.especialidades?.join(", ") || "General"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarBorrador}
            className="p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-600 transition-colors"
            title="Recargar órdenes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setNuevaOatcOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-earth-500 hover:bg-earth-600 text-white font-bold text-sm shadow-md shadow-earth-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva OATC</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-earth-500 dark:text-earth-400 block mb-1">
            Mis OATCs Hoy
          </span>
          <span className="text-2xl font-bold text-earth-900 dark:text-cream-100">
            {misOatcs.length}
          </span>
        </div>
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-earth-500 dark:text-earth-400 block mb-1">
            En Atención
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {misOatcs.filter((o) => o.etapa === "atencion").length}
          </span>
        </div>
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-earth-500 dark:text-earth-400 block mb-1">
            En Cobranza
          </span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {misOatcs.filter((o) => o.etapa === "cobranza").length}
          </span>
        </div>
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-earth-500 dark:text-earth-400 block mb-1">
            Completadas
          </span>
          <span className="text-2xl font-bold text-sage-600 dark:text-sage-400">
            {misOatcs.filter((o) => o.etapa === "completada").length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "todas", label: `Todas (${misOatcs.length})` },
          { id: "asesoria", label: "Asesoría" },
          { id: "atencion", label: "En Atención" },
          { id: "fin_atencion", label: "Fin Atención" },
          { id: "cobranza", label: "Cobranza" },
          { id: "completada", label: "Completadas" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFiltroEtapa(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filtroEtapa === tab.id
                ? "bg-earth-500 text-white shadow-sm shadow-earth-500/20"
                : "bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 text-earth-700 dark:text-cream-200 hover:bg-earth-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OATC Cards Grid */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-earth-500">
            Cargando órdenes del día...
          </div>
        ) : oatcsFiltradas.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-earth-200 dark:border-earth-800 rounded-2xl">
            <Scissors className="w-10 h-10 mx-auto text-earth-400 mb-2 opacity-50" />
            <p className="text-sm font-medium text-earth-600 dark:text-earth-400">
              No hay órdenes de atención en esta etapa
            </p>
            <p className="text-xs text-earth-400 mt-1">
              Puedes crear una nueva usando el botón superior "Nueva OATC"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oatcsFiltradas.map((oatc) => (
              <div
                key={oatc.id_oatc}
                className="border border-earth-200 dark:border-earth-800 rounded-2xl p-5 bg-earth-50/40 dark:bg-earth-950/40 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top card info */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-earth-500">
                      {oatc.id_oatc}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        etapaColors[oatc.etapa] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {etapaLabels[oatc.etapa] || oatc.etapa}
                    </span>
                  </div>

                  <h3 className="font-bold text-earth-900 dark:text-cream-100 text-base">
                    {oatc.nombre_servicio}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-earth-600 dark:text-earth-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-earth-400" />
                      <span>
                        Consumidor: <strong>{oatc.nombre_consumidor}</strong> (
                        {oatc.tipo_consumidor === "cliente" ? "Fidelizado" : "Turno"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-earth-400" />
                      <span>Inicio: {oatc.hora_inicio} hrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-earth-400" />
                      <span>Precio actual: <strong>{formatCurrency(oatc.precio_final)}</strong></span>
                    </div>
                    {oatc.comprobante_externo && (
                      <div className="flex items-center gap-2 text-sage-700 dark:text-sage-300 font-semibold">
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Comprobante: {oatc.comprobante_externo}</span>
                      </div>
                    )}
                  </div>

                  {oatc.notas && (
                    <p className="mt-3 text-xs bg-white dark:bg-earth-900 p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 text-earth-700 dark:text-earth-300">
                      💡 {oatc.notas}
                    </p>
                  )}
                </div>

                {/* Botones de cambio de etapa */}
                <div className="mt-5 pt-3 border-t border-earth-200/80 dark:border-earth-800/80">
                  {oatc.etapa === "asesoria" && (
                    <button
                      onClick={() => handleCambiarEtapa(oatc.id_oatc, "atencion")}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Comenzar Atención
                    </button>
                  )}

                  {oatc.etapa === "atencion" && (
                    <button
                      onClick={() => handleCambiarEtapa(oatc.id_oatc, "fin_atencion")}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Finalizar Atención del Servicio
                    </button>
                  )}

                  {oatc.etapa === "fin_atencion" && (
                    <button
                      onClick={() => handleCambiarEtapa(oatc.id_oatc, "cobranza")}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pasar a Cobranza / Caja
                    </button>
                  )}

                  {oatc.etapa === "cobranza" && (
                    <button
                      onClick={() => setCobranzaOatc(oatc)}
                      className="w-full py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sage-600/20 transition-all animate-pulse"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Ingresar Comprobante & Cerrar Cobro
                    </button>
                  )}

                  {oatc.etapa === "completada" && (
                    <div className="flex items-center justify-between text-xs text-sage-600 dark:text-sage-400 font-semibold py-1">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-sage-500" />
                        Completada & Cobrada
                      </span>
                      <span className="font-mono text-earth-500">
                        Fin: {oatc.hora_fin || "Registrado"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {cobranzaOatc && (
        <CobranzaModal
          isOpen={!!cobranzaOatc}
          oatc={cobranzaOatc}
          onClose={() => setCobranzaOatc(null)}
          onSuccess={() => {
            setCobranzaOatc(null);
            cargarBorrador();
          }}
        />
      )}

      {nuevaOatcOpen && (
        <NuevaOATCModal
          isOpen={nuevaOatcOpen}
          onClose={() => setNuevaOatcOpen(false)}
          onSuccess={() => {
            setNuevaOatcOpen(false);
            cargarBorrador();
          }}
          currentAgent={{
            id: user?.userId || "AG-001",
            nombre: user?.nombre || "Colaborador",
          }}
        />
      )}
    </div>
  );
}
