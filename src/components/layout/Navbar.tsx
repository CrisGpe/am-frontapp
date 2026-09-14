"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  LogOut,
  Scissors,
  Calendar,
  Settings,
  User,
  ClipboardList,
  Users,
  BarChart2,
  BarChart3,
  Boxes,
  Crown,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { UserSession } from "@/lib/types";

interface NavbarProps {
  user: UserSession;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sheetsConnected, setSheetsConnected] = useState<boolean | null>(null);

  React.useEffect(() => {
    fetch("/api/health/sheets")
      .then((res) => res.json())
      .then((data) => {
        setSheetsConnected(data.connected === true);
      })
      .catch(() => setSheetsConnected(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const getNavLinks = () => {
    if (user.rol === "admin") {
      return [
        { href: "/admin", label: "Dashboard", icon: Sparkles },
        { href: "/admin/borrador", label: "Borrador Diario", icon: ClipboardList },
        { href: "/admin/agentes", label: "Colaboradores", icon: Users },
        { href: "/admin/inventario", label: "Inventario", icon: Boxes },
        { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
        { href: "/admin/configuracion", label: "Configuración", icon: Settings },
        { href: "/agente", label: "Vista Agente", icon: Scissors },
      ];
    }
    if (user.tipo === "agente") {
      return [
        { href: "/agente", label: "Mis OATCs", icon: Scissors },
        { href: "/agente/turnos", label: "Turnos", icon: Users },
        { href: "/agente/asistencia", label: "Mi Asistencia", icon: Calendar },
      ];
    }
    return [
      { href: "/cliente", label: "Inicio", icon: Sparkles },
      { href: "/cliente/citas", label: "Reservar Cita", icon: Calendar },
      { href: "/cliente/lealtad", label: "Mis Puntos", icon: Crown },
      { href: "/cliente/historial", label: "Historial", icon: ClipboardList },
      { href: "/catalogo", label: "Catálogo", icon: Scissors },
    ];
  };

  const links = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-earth-950/90 backdrop-blur-md border-b border-earth-200 dark:border-earth-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-earth-500 text-white flex items-center justify-center shadow-md shadow-earth-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-earth-900 dark:text-cream-100 tracking-tight block leading-tight">
                Salón Élite
              </span>
              <span className="text-[10px] uppercase tracking-widest text-earth-600 dark:text-earth-400 block">
                CRM & Belleza
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
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

          {/* User profile & actions */}
          <div className="hidden md:flex items-center gap-3">
            {sheetsConnected === true && (
              <span
                title="Sincronizado con Google Sheets en tiempo real"
                className="inline-flex text-[10px] sm:text-xs items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-sage-50 text-sage-700 border border-sage-200 dark:bg-sage-950 dark:text-sage-300 dark:border-sage-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                Sheets Conectado
              </span>
            )}
            {sheetsConnected === false && (
              <span
                title="Modo Fallback en Memoria. Configura las variables en Vercel Settings -> Environment Variables para escribir en Google Sheets."
                className="inline-flex text-[10px] sm:text-xs items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Sheets en Memoria (Configura Vercel)
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
              onClick={handleLogout}
              className="p-2 rounded-xl text-earth-600 dark:text-earth-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-earth-700 dark:text-earth-300 hover:bg-earth-100 dark:hover:bg-earth-900 transition-colors"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-earth-200 dark:border-earth-800 bg-white dark:bg-earth-950 px-4 pt-3 pb-5 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 bg-earth-50 dark:bg-earth-900 rounded-xl mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-earth-600" />
              <span className="font-medium text-sm text-earth-900 dark:text-cream-100">
                {user.nombre}
              </span>
            </div>
            <span className="bg-earth-200 dark:bg-earth-800 text-earth-700 dark:text-cream-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              {user.rol === "admin" ? "Admin" : user.tipo}
            </span>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-earth-100 dark:bg-earth-800 text-earth-900 dark:text-cream-100"
                    : "text-earth-700 dark:text-earth-300 hover:bg-earth-50 dark:hover:bg-earth-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </header>
  );
}
