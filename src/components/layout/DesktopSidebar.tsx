"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Columns,
  LucideIcon,
} from "lucide-react";
import { UserSession } from "@/lib/types";

export interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DesktopSidebarProps {
  user: UserSession;
  pathname: string;
  links: NavLinkItem[];
  sheetsConnected: boolean | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSwitchLayout: () => void;
  onLogout: () => void;
}

export function DesktopSidebar({
  user,
  pathname,
  links,
  sheetsConnected,
  collapsed,
  onToggleCollapse,
  onSwitchLayout,
  onLogout,
}: DesktopSidebarProps) {
  const userInitial = user.nombre ? user.nombre.charAt(0).toUpperCase() : "U";

  return (
    <aside
      aria-label="Navegación principal lateral"
      className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-white/95 dark:bg-earth-950/95 backdrop-blur-md border-r border-earth-200 dark:border-earth-800 transition-all duration-300 select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-earth-100 dark:border-earth-800/80">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-earth-500 text-white flex items-center justify-center shadow-md shadow-earth-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="font-bold text-base text-earth-900 dark:text-cream-100 tracking-tight block leading-tight">
                Salón Élite
              </span>
              <span className="text-[10px] uppercase tracking-widest text-earth-600 dark:text-earth-400 block font-semibold">
                CRM & Spa
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div
              className="w-10 h-10 rounded-xl bg-earth-500 text-white flex items-center justify-center shadow-md shadow-earth-500/20 shrink-0"
              title="Salón Élite CRM & Spa"
            >
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Botón de Colapso */}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg text-earth-500 hover:text-earth-900 dark:text-earth-400 dark:hover:text-cream-100 hover:bg-earth-100 dark:hover:bg-earth-900 transition-colors ${
            collapsed ? "absolute right-2 top-4" : ""
          }`}
          title={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? "bg-earth-100 dark:bg-earth-800 text-earth-900 dark:text-cream-100 font-semibold shadow-xs"
                  : "text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-200 hover:bg-earth-50 dark:hover:bg-earth-900/50"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive
                    ? "text-earth-800 dark:text-cream-100"
                    : "text-earth-500 dark:text-earth-400"
                }`}
              />

              {!collapsed && <span className="truncate">{link.label}</span>}

              {/* Tooltip flotante al estar colapsado */}
              {collapsed && (
                <span className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute left-full ml-3 px-2.5 py-1 bg-earth-900 text-cream-100 text-xs rounded-lg whitespace-nowrap z-50 shadow-lg border border-earth-700">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-earth-100 dark:border-earth-800/80 space-y-2">
        {/* Google Sheets Status */}
        {sheetsConnected === true && (
          <div
            title="Sincronizado con Google Sheets en tiempo real"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800/80 text-[11px] font-semibold text-sage-700 dark:text-sage-300 ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse shrink-0" />
            {!collapsed && <span className="truncate">Sheets Conectado</span>}
          </div>
        )}

        {sheetsConnected === false && (
          <div
            title="Modo Fallback en Memoria. Configura las variables en Vercel."
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-[11px] font-semibold text-amber-800 dark:text-amber-300 ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            {!collapsed && <span className="truncate">Sheets en Memoria</span>}
          </div>
        )}

        {/* User Profile Card */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl bg-earth-50 dark:bg-earth-900/60 border border-earth-200 dark:border-earth-800 ${
            collapsed ? "justify-center p-1.5" : ""
          }`}
          title={`${user.nombre} (${user.rol === "admin" ? "Administrador" : user.tipo})`}
        >
          <div className="w-8 h-8 rounded-full bg-earth-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-earth-900 dark:text-cream-100 truncate">
                {user.nombre}
              </p>
              <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-earth-200 dark:bg-earth-800 text-earth-700 dark:text-cream-300">
                {user.rol === "admin" ? "Admin" : user.tipo}
              </span>
            </div>
          )}
        </div>

        {/* Layout Switcher: Switch to Topbar */}
        <button
          onClick={onSwitchLayout}
          title={
            collapsed
              ? "Cambiar a barra superior"
              : "Cambiar disposición a barra superior horizontal"
          }
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-100 hover:bg-earth-100 dark:hover:bg-earth-900 transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <Columns className="w-4 h-4 shrink-0 text-earth-500" />
          {!collapsed && <span className="truncate">Barra Superior</span>}
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title={collapsed ? "Cerrar sesión" : undefined}
          aria-label="Cerrar sesión"
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-earth-600 dark:text-earth-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
