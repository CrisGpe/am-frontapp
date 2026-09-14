"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { generarLinkWhatsApp } from "@/lib/whatsapp";
import {
  Award,
  Crown,
  Sparkles,
  Gift,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Scissors,
  MessageCircle,
} from "lucide-react";

interface Recompensa {
  id: string;
  titulo: string;
  puntosRequeridos: number;
  descripcion: string;
  categoria: string;
}

interface ItemHistorial {
  fecha: string;
  servicio: string;
  monto: number;
  puntosGanados: number;
}

interface DatosLealtad {
  cliente: { id: string; nombre: string };
  puntosTotales: number;
  puntosDisponibles: number;
  nivel: "Bronce" | "Plata" | "Oro";
  metaSiguiente: number;
  porcentajeNivel: number;
  recompensas: Recompensa[];
  historialPuntos: ItemHistorial[];
}

export default function ClienteLealtadPage() {
  const [datos, setDatos] = useState<DatosLealtad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarLealtad();
  }, []);

  const cargarLealtad = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cliente/lealtad");
      const data = await res.json();
      if (res.ok) {
        setDatos(data);
      }
    } catch (err) {
      console.error("Error al cargar lealtad:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCanjearWhatsApp = (recompensa: Recompensa) => {
    if (!datos) return;
    const mensaje =
      `¡Hola Salón Élite! 👋 Soy ${datos.cliente.nombre} y deseo canjear mi recompensa de lealtad:\n\n` +
      `🎁 *${recompensa.titulo}* (${recompensa.puntosRequeridos} puntos).\n\n` +
      `¿Podrían indicarme qué fecha tienen disponible para agendarlo? ¡Muchas gracias!`;
    const url = generarLinkWhatsApp("51999999999", mensaje);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-earth-500">
        Cargando tu membresía de lealtad...
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="p-12 text-center text-xs text-earth-500">
        No se pudo cargar la información de lealtad.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tarjeta de Membresía VIP */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-earth-900 via-earth-800 to-[#1f1711] text-white shadow-2xl border border-earth-700/60">
        {/* Glow & Texture Decor */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-earth-500/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Crown className="w-4 h-4" />
              <span>Programa Élite Rewards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {datos.cliente.nombre}
            </h1>
            <p className="text-xs text-earth-300 mt-1">
              Membresía Oficial • Salón Élite & Spa Jesús María
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15 text-center sm:text-right">
            <span className="text-[11px] text-amber-300 font-semibold block uppercase tracking-wider">
              Nivel de Membresía
            </span>
            <div className="text-2xl font-extrabold tracking-tight flex items-center justify-center sm:justify-end gap-2 mt-0.5">
              <span>{datos.nivel}</span>
              <Award className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Puntos y Barra de Progreso */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-xs text-earth-300 block">Puntos Acumulados</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-amber-300">
                {datos.puntosTotales}
              </span>
              <span className="text-xs text-earth-300 font-medium">puntos lealtad</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-earth-300">Progreso a siguiente nivel</span>
              <span className="font-bold text-amber-300">
                {datos.puntosTotales} / {datos.metaSiguiente} pts
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{ width: `${Math.max(5, datos.porcentajeNivel)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Catálogo de Recompensas Disponibles */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-earth-600 dark:text-earth-400" />
          <h2 className="text-lg font-bold text-earth-900 dark:text-cream-100">
            Beneficios y Recompensas Canjeables
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datos.recompensas.map((rec) => {
            const puedeCanjear = datos.puntosTotales >= rec.puntosRequeridos;
            return (
              <div
                key={rec.id}
                className={`border rounded-3xl p-6 transition-all flex flex-col justify-between ${
                  puedeCanjear
                    ? "bg-white dark:bg-earth-900 border-earth-300 dark:border-earth-700 shadow-sm hover:shadow-md"
                    : "bg-earth-50/60 dark:bg-earth-950/40 border-earth-200/60 dark:border-earth-800/60 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-earth-100 dark:bg-earth-800 text-earth-700 dark:text-earth-300">
                      {rec.categoria}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        puedeCanjear
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                          : "bg-earth-200 text-earth-600 dark:bg-earth-800 dark:text-earth-400"
                      }`}
                    >
                      {rec.puntosRequeridos} Puntos
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-earth-900 dark:text-cream-100 mb-1">
                    {rec.titulo}
                  </h3>
                  <p className="text-xs text-earth-600 dark:text-earth-400 leading-relaxed">
                    {rec.descripcion}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-earth-100 dark:border-earth-800 flex items-center justify-between">
                  <span className="text-[11px] text-earth-500 font-medium">
                    {puedeCanjear
                      ? "¡Puntos suficientes!"
                      : `Te faltan ${rec.puntosRequeridos - datos.puntosTotales} pts`}
                  </span>

                  <button
                    type="button"
                    disabled={!puedeCanjear}
                    onClick={() => handleCanjearWhatsApp(rec)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      puedeCanjear
                        ? "bg-earth-500 hover:bg-earth-600 text-white shadow-sm active:scale-95"
                        : "bg-earth-200 text-earth-400 dark:bg-earth-800 dark:text-earth-600 cursor-not-allowed"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Canjear</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de Puntos Acumulados */}
      <div className="bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-earth-500" />
          <h3 className="font-bold text-sm text-earth-900 dark:text-cream-100">
            Historial de Puntos Ganados
          </h3>
        </div>

        {datos.historialPuntos.length === 0 ? (
          <p className="text-xs text-earth-500 text-center py-6">
            Aún no tienes visitas completadas registradas. ¡Cada atención que recibas sumará puntos!
          </p>
        ) : (
          <div className="divide-y divide-earth-100 dark:divide-earth-800">
            {datos.historialPuntos.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-earth-900 dark:text-cream-100 block">
                    {item.servicio}
                  </span>
                  <span className="text-[11px] text-earth-500">
                    {item.fecha} • Consumo: {formatCurrency(item.monto)}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                  +{item.puntosGanados} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
