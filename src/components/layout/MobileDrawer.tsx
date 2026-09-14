import React from "react";
import Link from "next/link";
import {
  Users,
  Settings,
  Scissors,
  Sparkles,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { UserSession } from "@/lib/types";

interface MobileDrawerProps {
  user: UserSession;
  pathname: string;
  sheetsConnected: boolean | null;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileDrawer({
  user,
  pathname,
  sheetsConnected,
  onClose,
  onLogout,
}: MobileDrawerProps) {
  const getRoleBadgeLabel = () => {
    if (user.rol === "admin") return "Administrador";
    if (user.tipo === "agente") return "Especialista";
    return "Cliente";
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop con desenfoque suave */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del Drawer deslizante */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú y opciones del sistema"
        className="fixed bottom-0 inset-x-0 bg-white dark:bg-earth-950 rounded-t-3xl border-t border-earth-200 dark:border-earth-800 shadow-2xl p-5 pb-safe animate-slide-up max-h-[85vh] overflow-y-auto"
      >
        {/* Barra de agarre superior (Handle Bar) */}
        <div
          onClick={onClose}
          className="w-12 h-1.5 bg-earth-300 dark:bg-earth-700 rounded-full mx-auto mb-4 cursor-pointer"
        />

        {/* Ficha de Perfil de Usuario */}
        <div className="flex items-center justify-between p-3.5 bg-earth-50 dark:bg-earth-900/60 rounded-2xl border border-earth-200/70 dark:border-earth-800/70 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-earth-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="font-bold text-sm text-earth-900 dark:text-cream-100 leading-tight">
                {user.nombre}
              </h3>
              <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-earth-600 dark:text-earth-400">
                {getRoleBadgeLabel()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-earth-400 hover:text-earth-600 hover:bg-earth-200/50 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opciones Adicionales para Administrador */}
        {user.rol === "admin" && (
          <div className="space-y-1.5 mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-earth-400 dark:text-earth-500 px-2 mb-1">
              Administración del Salón
            </p>

            <Link
              href="/admin/agentes"
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/admin/agentes"
                  ? "bg-earth-100 dark:bg-earth-800 text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-700 dark:text-earth-300 hover:bg-earth-50 dark:hover:bg-earth-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-700 dark:text-earth-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="leading-tight">Colaboradores & Especialistas</p>
                  <p className="text-[11px] text-earth-400 font-normal">
                    Gestión de estilistas y accesos
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-earth-400" />
            </Link>

            <Link
              href="/admin/configuracion"
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/admin/configuracion"
                  ? "bg-earth-100 dark:bg-earth-800 text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-700 dark:text-earth-300 hover:bg-earth-50 dark:hover:bg-earth-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-700 dark:text-earth-300">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="leading-tight">Configuración del Salón</p>
                  <p className="text-[11px] text-earth-400 font-normal">
                    Horarios, cierre de día y parámetros
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-earth-400" />
            </Link>

            <Link
              href="/agente"
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/agente"
                  ? "bg-earth-100 dark:bg-earth-800 text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-700 dark:text-earth-300 hover:bg-earth-50 dark:hover:bg-earth-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-700 dark:text-earth-300">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <p className="leading-tight">Modo Terminal de Estilista</p>
                  <p className="text-[11px] text-earth-400 font-normal">
                    Visualizar interfaz como colaborador
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-earth-400" />
            </Link>

            <Link
              href="/catalogo"
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/catalogo"
                  ? "bg-earth-100 dark:bg-earth-800 text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-700 dark:text-earth-300 hover:bg-earth-50 dark:hover:bg-earth-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-700 dark:text-earth-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="leading-tight">Catálogo Público</p>
                  <p className="text-[11px] text-earth-400 font-normal">
                    Vista de servicios sin autenticación
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-earth-400" />
            </Link>
          </div>
        )}

        {/* Estado de Sincronización */}
        <div className="p-3 bg-earth-50/70 dark:bg-earth-900/40 rounded-xl border border-earth-200/50 dark:border-earth-800/50 mb-4 flex items-center justify-between">
          <span className="text-xs text-earth-600 dark:text-earth-400 font-medium">
            Conexión de Datos:
          </span>
          {sheetsConnected === true ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-700 dark:text-sage-300">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
              Google Sheets Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Memoria Temporal
            </span>
          )}
        </div>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-[0.98] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
