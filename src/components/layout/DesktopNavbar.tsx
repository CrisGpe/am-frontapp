import React from "react";
import Link from "next/link";
import { Sparkles, LogOut, LucideIcon } from "lucide-react";
import { UserSession } from "@/lib/types";

interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DesktopNavbarProps {
  user: UserSession;
  pathname: string;
  links: NavLinkItem[];
  sheetsConnected: boolean | null;
  onLogout: () => void;
}

export function DesktopNavbar({
  user,
  pathname,
  links,
  sheetsConnected,
  onLogout,
}: DesktopNavbarProps) {
  return (
    <div className="hidden md:flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-earth-500 text-white flex items-center justify-center shadow-md shadow-earth-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg text-earth-900 dark:text-cream-100 tracking-tight block leading-tight">
            Salón Élite
          </span>
          <span className="text-[10px] uppercase tracking-widest text-earth-600 dark:text-earth-400 block font-medium">
            CRM & Spa
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-earth-100 dark:bg-earth-800 text-earth-900 dark:text-cream-100"
                  : "text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-200 hover:bg-earth-50 dark:hover:bg-earth-900/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Actions and Status */}
      <div className="flex items-center gap-3">
        {sheetsConnected === true && (
          <span
            title="Sincronizado con Google Sheets en tiempo real"
            className="inline-flex text-[11px] items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-sage-50 text-sage-700 border border-sage-200 dark:bg-sage-950 dark:text-sage-300 dark:border-sage-800"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
            Sheets Conectado
          </span>
        )}
        {sheetsConnected === false && (
          <span
            title="Modo Fallback en Memoria. Configura las variables en Vercel."
            className="inline-flex text-[11px] items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Sheets en Memoria
          </span>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-earth-50 dark:bg-earth-900 border border-earth-200 dark:border-earth-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
          <span className="font-medium text-earth-800 dark:text-cream-100">
            {user.nombre}
          </span>
          <span className="bg-earth-200 dark:bg-earth-800 text-earth-700 dark:text-cream-200 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            {user.rol === "admin" ? "Admin" : user.tipo}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl text-earth-600 dark:text-earth-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
