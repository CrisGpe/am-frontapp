import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { getServicios } from "@/lib/google-sheets";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Calendar, Clock, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ClienteDashboardPage() {
  const user = await getCurrentUser();
  const servicios = await getServicios();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-earth-100 via-cream-200 to-sage-100 dark:from-earth-950 dark:via-earth-900 dark:to-sage-950 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-earth-700 dark:text-cream-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 text-sage-600 fill-sage-600" />
            <span>Experiencia Exclusiva</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-cream-100 tracking-tight">
            Bienvenida, {user?.nombre}
          </h1>
          <p className="text-sm text-earth-700 dark:text-earth-300 mt-2 leading-relaxed">
            Reserva tus servicios favoritos con tu estilista de confianza y consulta tu historial de belleza cuando quieras.
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/cliente/citas"
          className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-earth-500/10 text-earth-600 flex items-center justify-center mb-4 group-hover:bg-earth-500 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
              Solicitar Turno o Cita
            </h2>
            <p className="text-xs text-earth-600 dark:text-earth-400 mt-1">
              Selecciona tu servicio y elige el horario disponible con tu especialista.
            </p>
          </div>
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-earth-700 dark:text-cream-200 bg-earth-100 dark:bg-earth-800 px-3.5 py-2 rounded-xl group-hover:bg-earth-500 group-hover:text-white transition-colors">
              Reservar ahora <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        <Link
          href="/cliente/historial"
          className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-sage-500/10 text-sage-600 flex items-center justify-center mb-4 group-hover:bg-sage-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
              Historial de Atenciones
            </h2>
            <p className="text-xs text-earth-600 dark:text-earth-400 mt-1">
              Revisa tus tratamientos previos, recomendaciones y productos sugeridos.
            </p>
          </div>
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-sage-800 dark:text-sage-200 bg-sage-50 dark:bg-sage-950 px-3.5 py-2 rounded-xl group-hover:bg-sage-600 group-hover:text-white transition-colors">
              Ver mis visitas <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Featured Services */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100 mb-4">
          Nuestra Carta de Servicios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicios.map((s) => (
            <div
              key={s.id}
              className="border border-earth-200 dark:border-earth-800 rounded-2xl p-4 bg-earth-50/50 dark:bg-earth-950/50 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-earth-200 dark:bg-earth-800 text-earth-700 dark:text-cream-200">
                  {s.categoria}
                </span>
                <h3 className="font-semibold text-sm text-earth-900 dark:text-cream-100 mt-2">
                  {s.nombre}
                </h3>
                {s.descripcion && (
                  <p className="text-xs text-earth-500 dark:text-earth-400 mt-1 line-clamp-2">
                    {s.descripcion}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-earth-200/60 dark:border-earth-800/60 flex items-center justify-between text-xs">
                <span className="text-earth-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {s.duracion_min} min
                </span>
                <span className="font-bold text-earth-900 dark:text-cream-100">
                  {formatCurrency(s.precio_base)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
