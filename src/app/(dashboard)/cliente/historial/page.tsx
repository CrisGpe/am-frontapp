"use client";

import React, { useState, useEffect } from "react";
import { BorradorEntry, UserSession } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  ClipboardList,
  Sparkles,
  Scissors,
  Clock,
  User,
  Receipt,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function ClienteHistorialPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [historial, setHistorial] = useState<BorradorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resUser, resHist] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/cliente/historial"),
      ]);
      const dataUser = await resUser.json();
      const dataHist = await resHist.json();

      if (!resHist.ok) {
        throw new Error(dataHist.error || "Error al cargar historial");
      }

      if (dataUser.user) setUser(dataUser.user);
      if (dataHist.historial) setHistorial(dataHist.historial);
    } catch (err: any) {
      setError(err.message || "Error de red al cargar el historial");
      console.error("Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-earth-600 dark:text-earth-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <ClipboardList className="w-4 h-4 text-earth-500" />
          <span>Historial de Belleza</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
          Mis Atenciones Anteriores
        </h1>
        <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
          Revisa todos los tratamientos recibidos, fórmulas aplicadas y comprobantes de pago.
        </p>
      </div>

      {/* Lista de Atenciones */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-earth-500">
            Consultando historial de atenciones...
          </div>
        ) : error ? (
          <div className="text-center py-12 border border-dashed border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 rounded-2xl">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              Error al cargar el historial
            </p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
            <button
              onClick={cargarHistorial}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200"
            >
              Intentar nuevamente
            </button>
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-earth-200 dark:border-earth-800 rounded-2xl">
            <Sparkles className="w-10 h-10 mx-auto text-earth-400 mb-2 opacity-50" />
            <p className="text-sm font-medium text-earth-600 dark:text-earth-400">
              Aún no tienes atenciones registradas en el salón
            </p>
            <p className="text-xs text-earth-400 mt-1">
              Tus visitas aparecerán aquí conforme el equipo concluya tus servicios
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historial.map((item) => (
              <div
                key={item.id_oatc}
                className="p-5 rounded-2xl border border-earth-200 dark:border-earth-800 bg-earth-50/50 dark:bg-earth-950/50 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-earth-500">
                      {item.id_oatc}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sage-100 dark:bg-sage-950 text-sage-800 dark:text-sage-300">
                      {item.etapa}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-earth-900 dark:text-cream-100">
                    {item.nombre_servicio}
                  </h3>

                  <div className="text-xs text-earth-600 dark:text-earth-400 space-y-0.5">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-earth-400" />
                      <span>
                        Fecha: <strong>{item.fecha}</strong> ({item.hora_inicio} hrs)
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-earth-400" />
                      <span>
                        Atendido por: <strong>{item.nombre_agente}</strong>
                      </span>
                    </p>
                    {item.comprobante_externo && (
                      <p className="flex items-center gap-1.5 text-sage-700 dark:text-sage-300 font-semibold">
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Comprobante: {item.comprobante_externo}</span>
                      </p>
                    )}
                  </div>

                  {item.notas && (
                    <p className="text-xs bg-white dark:bg-earth-900 p-2.5 rounded-xl border border-earth-200/80 text-earth-700 dark:text-earth-300 mt-2">
                      💡 {item.notas}
                    </p>
                  )}
                </div>

                <div className="text-right sm:border-l sm:border-earth-200 dark:sm:border-earth-800 sm:pl-6">
                  <span className="text-[11px] text-earth-500 block">Total Pagado</span>
                  <span className="text-xl font-bold text-earth-900 dark:text-cream-100">
                    {formatCurrency(item.precio_final)}
                  </span>
                  <span className="text-[10px] text-sage-600 block mt-1 font-semibold">
                    ✓ Verificado
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
