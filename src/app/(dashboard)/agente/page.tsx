import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { getBorrador, getServicios } from "@/lib/google-sheets";
import { formatCurrency } from "@/lib/utils";
import {
  Scissors,
  Clock,
  User,
  CheckCircle,
  Play,
  CreditCard,
  PlusCircle,
  Sparkles,
} from "lucide-react";

export default async function AgenteDashboardPage() {
  const user = await getCurrentUser();
  const allBorrador = await getBorrador();
  const servicios = await getServicios();

  // Filtrar OATCs asignadas a este agente o abiertas
  const misOatcs = allBorrador.filter(
    (item) => item.id_agente === user?.userId || user?.rol === "admin"
  );

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
    fin_atencion: "3. Fin de Atención",
    cobranza: "4. En Cobranza",
    completada: "5. Completada",
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-sm font-medium mb-1">
            <Sparkles className="w-4 h-4 text-earth-500" />
            <span>Panel de Colaborador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-earth-900 dark:text-cream-100">
            ¡Hola, {user?.nombre}!
          </h1>
          <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
            Especialidades:{" "}
            <span className="font-semibold text-earth-800 dark:text-cream-200">
              {user?.especialidades?.join(", ") || "General"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse" />
            <span className="text-xs font-semibold text-sage-800 dark:text-sage-200">
              Disponible para Turnos
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-earth-500 dark:text-earth-400 block mb-1">
            OATCs Hoy
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
            Pendientes Cobro
          </span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {misOatcs.filter((o) => o.etapa === "cobranza").length}
          </span>
        </div>
        <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-earth-500 dark:text-earth-400 block mb-1">
            Total Generado
          </span>
          <span className="text-xl font-bold text-earth-900 dark:text-cream-100">
            {formatCurrency(
              misOatcs.reduce((acc, curr) => acc + (Number(curr.precio_final) || 0), 0)
            )}
          </span>
        </div>
      </div>

      {/* OATCs List / Borrador */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
              Órdenes de Atención Activas (Borrador)
            </h2>
            <p className="text-xs text-earth-500 dark:text-earth-400">
              Control operativo en tiempo real para el cierre de día
            </p>
          </div>
        </div>

        {misOatcs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-earth-200 dark:border-earth-800 rounded-2xl">
            <Scissors className="w-10 h-10 mx-auto text-earth-400 mb-2 opacity-50" />
            <p className="text-sm font-medium text-earth-600 dark:text-earth-400">
              No tienes órdenes activas en este momento
            </p>
            <p className="text-xs text-earth-400 mt-1">
              Las nuevas atenciones y turnos aparecerán aquí automáticamente
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misOatcs.map((oatc) => (
              <div
                key={oatc.id_oatc}
                className="border border-earth-200 dark:border-earth-800 rounded-2xl p-5 hover:shadow-md transition-shadow bg-earth-50/40 dark:bg-earth-950/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-earth-500 dark:text-earth-400">
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
                      <span>Precio: <strong>{formatCurrency(oatc.precio_final)}</strong></span>
                    </div>
                  </div>

                  {oatc.notas && (
                    <p className="mt-3 text-xs bg-white dark:bg-earth-900 p-2.5 rounded-xl border border-earth-200 dark:border-earth-800 text-earth-700 dark:text-earth-300">
                      💡 {oatc.notas}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-earth-200/80 dark:border-earth-800/80 flex items-center justify-between text-xs">
                  <span className="text-earth-500 font-mono">
                    Corr: {oatc.correlativo_sistema}
                  </span>
                  <span className="font-semibold text-earth-700 dark:text-earth-300">
                    Atendido por: {oatc.nombre_agente}
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
