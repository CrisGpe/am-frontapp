"use client";

import React, { useState, useEffect } from "react";
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
  BarChart3,
  Boxes,
  Crown,
  LayoutGrid,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { UserSession } from "@/lib/types";

interface NavbarProps {
  user: UserSession;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetsConnected, setSheetsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health/sheets")
      .then((res) => res.json())
      .then((data) => {
        setSheetsConnected(data.connected === true);
      })
      .catch(() => setSheetsConnected(false));
  }, []);

  // Cerrar drawer al presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  // Bloquear scroll de fondo cuando el drawer está abierto en móvil
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Enlaces completos para versión de escritorio
  const getDesktopNavLinks = () => {
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

  const desktopLinks = getDesktopNavLinks();

  // Enlaces de la Barra Inferior Móvil (Bottom Tab Bar)
  const isMoreActive =
    user.rol === "admin" &&
    ["/admin/agentes", "/admin/configuracion", "/agente"].some((path) =>
      pathname.startsWith(path)
    );

  const getRoleBadgeLabel = () => {
    if (user.rol === "admin") return "Administrador";
    if (user.tipo === "agente") return "Especialista";
    return "Cliente";
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP BAR (Escritorio completo + Header limpio de App para Móvil)        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-earth-950/95 backdrop-blur-md border-b border-earth-200 dark:border-earth-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo y Branding */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-earth-500 text-white flex items-center justify-center shadow-md shadow-earth-500/20 flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg text-earth-900 dark:text-cream-100 tracking-tight block leading-tight">
                  Salón Élite
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-earth-600 dark:text-earth-400 block font-medium">
                  CRM & Spa
                </span>
              </div>
            </div>

            {/* Navegación para Pantallas Grandes (Desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {desktopLinks.map((link) => {
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

            {/* Estado de Sheets y Perfil en Desktop */}
            <div className="hidden md:flex items-center gap-3">
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
                onClick={handleLogout}
                className="p-2 rounded-xl text-earth-600 dark:text-earth-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Header Móvil (Icono de Estado Sheets + Botón de Perfil de Usuario) */}
            <div className="flex md:hidden items-center gap-2">
              {sheetsConnected === true && (
                <span
                  title="Conectado a Google Sheets"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage-50 text-sage-700 border border-sage-200 dark:bg-sage-950 dark:text-sage-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  Sheets
                </span>
              )}
              {sheetsConnected === false && (
                <span
                  title="En Memoria"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Memoria
                </span>
              )}

              {/* Botón de Perfil Móvil */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-earth-100 dark:bg-earth-900 border border-earth-200 dark:border-earth-800 text-earth-800 dark:text-cream-200 active:scale-95 transition-transform"
                aria-label="Abrir panel de cuenta y opciones"
              >
                <div className="w-6 h-6 rounded-full bg-earth-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="text-xs font-semibold max-w-[80px] truncate">
                  {user.nombre.split(" ")[0]}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION BAR (Barra Inferior Estilo App Nativa)        */}
      {/* ========================================================================= */}
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
                onClick={() => setDrawerOpen(true)}
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
                onClick={() => setDrawerOpen(true)}
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

      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM SHEET DRAWER (Panel Deslizante Estilo iOS / Android)     */}
      {/* ========================================================================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop con desenfoque suave */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in transition-opacity"
            onClick={() => setDrawerOpen(false)}
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
            <div className="w-12 h-1.5 bg-earth-300 dark:bg-earth-700 rounded-full mx-auto mb-4 cursor-pointer" />

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
                onClick={() => setDrawerOpen(false)}
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
                  onClick={() => setDrawerOpen(false)}
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
                  onClick={() => setDrawerOpen(false)}
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
                  onClick={() => setDrawerOpen(false)}
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
                  onClick={() => setDrawerOpen(false)}
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
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-[0.98] transition-all"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}

