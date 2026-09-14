import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ClipboardList,
  Boxes,
  BarChart3,
  LayoutGrid,
  Scissors,
  Users,
  Calendar,
  User,
  Crown,
} from "lucide-react";
import { UserSession } from "@/lib/types";

interface MobileBottomNavProps {
  user: UserSession;
  pathname: string;
  isMoreActive: boolean;
  drawerOpen: boolean;
  onOpenDrawer: () => void;
}

export function MobileBottomNav({
  user,
  pathname,
  isMoreActive,
  drawerOpen,
  onOpenDrawer,
}: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navegación principal móvil"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-earth-950/95 backdrop-blur-xl border-t border-earth-200/80 dark:border-earth-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] md:hidden pb-safe pt-1.5 px-2"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Tabs para ADMINISTRADOR */}
        {user.rol === "admin" && (
          <>
            <Link
              href="/admin"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/admin"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/admin" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Inicio</span>
            </Link>

            <Link
              href="/admin/borrador"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/admin/borrador"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/admin/borrador" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Borrador</span>
            </Link>

            <Link
              href="/admin/inventario"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/admin/inventario"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/admin/inventario" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Inventario</span>
            </Link>

            <Link
              href="/admin/reportes"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/admin/reportes"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/admin/reportes" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Reportes</span>
            </Link>

            <button
              type="button"
              onClick={onOpenDrawer}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isMoreActive || drawerOpen
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
              aria-label="Más opciones"
            >
              <div
                className={`p-1 rounded-xl relative transition-colors ${
                  isMoreActive || drawerOpen ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                {isMoreActive && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-earth-500 ring-2 ring-white dark:ring-earth-950" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Más</span>
            </button>
          </>
        )}

        {/* Tabs para AGENTE / COLABORADOR */}
        {user.rol !== "admin" && user.tipo === "agente" && (
          <>
            <Link
              href="/agente"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/agente"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/agente" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Mis OATCs</span>
            </Link>

            <Link
              href="/agente/turnos"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/agente/turnos"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/agente/turnos" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Turnos</span>
            </Link>

            <Link
              href="/agente/asistencia"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/agente/asistencia"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/agente/asistencia" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Asistencia</span>
            </Link>

            <button
              type="button"
              onClick={onOpenDrawer}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                drawerOpen
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
              aria-label="Perfil y cuenta"
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  drawerOpen ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Mi Cuenta</span>
            </button>
          </>
        )}

        {/* Tabs para CLIENTE */}
        {user.tipo === "cliente" && (
          <>
            <Link
              href="/cliente"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/cliente"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/cliente" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Inicio</span>
            </Link>

            <Link
              href="/cliente/citas"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/cliente/citas"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/cliente/citas" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Reservar</span>
            </Link>

            <Link
              href="/cliente/lealtad"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/cliente/lealtad"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/cliente/lealtad" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Puntos</span>
            </Link>

            <Link
              href="/cliente/historial"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/cliente/historial"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/cliente/historial" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Historial</span>
            </Link>

            <Link
              href="/catalogo"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                pathname === "/catalogo"
                  ? "text-earth-900 dark:text-cream-100 font-bold"
                  : "text-earth-400 dark:text-earth-500 hover:text-earth-700"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  pathname === "/catalogo" ? "bg-earth-100 dark:bg-earth-800" : ""
                }`}
              >
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">Catálogo</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
