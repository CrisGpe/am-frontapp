"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  Scissors,
  Calendar,
  Settings,
  ClipboardList,
  Users,
  BarChart3,
  Boxes,
  Crown,
} from "lucide-react";
import { UserSession } from "@/lib/types";
import { useSheetsHealth } from "@/hooks/useSheetsHealth";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopNavbar } from "./DesktopNavbar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileDrawer } from "./MobileDrawer";

interface DashboardShellProps {
  user: UserSession;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { connected: sheetsConnected } = useSheetsHealth();

  // Estados de layout con persistencia en localStorage
  const [navLayout, setNavLayout] = useState<"sidebar" | "topbar">("sidebar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem("salon_nav_layout");
      if (savedLayout === "topbar" || savedLayout === "sidebar") {
        setNavLayout(savedLayout);
      }
      const savedCollapsed = localStorage.getItem("salon_sidebar_collapsed");
      if (savedCollapsed !== null) {
        setSidebarCollapsed(savedCollapsed === "true");
      }
    } catch {
      // Ignorar si localStorage está restringido
    }
  }, []);

  const handleSwitchLayout = () => {
    const next = navLayout === "sidebar" ? "topbar" : "sidebar";
    setNavLayout(next);
    try {
      localStorage.setItem("salon_nav_layout", next);
    } catch {
      // Ignorar
    }
  };

  const handleToggleCollapse = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try {
      localStorage.setItem("salon_sidebar_collapsed", String(next));
    } catch {
      // Ignorar
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

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

  // Bloquear scroll de fondo cuando el drawer móvil esté abierto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

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

  const isMoreActive =
    user.rol === "admin" &&
    ["/admin/agentes", "/admin/configuracion", "/agente"].some((path) =>
      pathname.startsWith(path)
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3] dark:bg-[#15120E] text-earth-900 dark:text-cream-100">
      {/* Navegación Desktop */}
      {navLayout === "sidebar" ? (
        <>
          <DesktopSidebar
            user={user}
            pathname={pathname}
            links={links}
            sheetsConnected={sheetsConnected}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onSwitchLayout={handleSwitchLayout}
            onLogout={handleLogout}
          />
          {/* Header Móvil */}
          <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-earth-950/95 backdrop-blur-md border-b border-earth-200 dark:border-earth-800">
            <MobileHeader
              user={user}
              sheetsConnected={sheetsConnected}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
          </header>
        </>
      ) : (
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-earth-950/95 backdrop-blur-md border-b border-earth-200 dark:border-earth-800">
          <DesktopNavbar
            user={user}
            pathname={pathname}
            links={links}
            sheetsConnected={sheetsConnected}
            onSwitchLayout={handleSwitchLayout}
            onLogout={handleLogout}
          />
          <MobileHeader
            user={user}
            sheetsConnected={sheetsConnected}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        </header>
      )}

      {/* Contenedor Principal con Margen Adaptativo para Sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          navLayout === "sidebar"
            ? sidebarCollapsed
              ? "md:pl-20"
              : "md:pl-64"
            : "md:pl-0"
        }`}
      >
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
          {children}
        </main>
      </div>

      {/* Navegación Móvil Táctil */}
      <MobileBottomNav
        user={user}
        pathname={pathname}
        isMoreActive={isMoreActive}
        drawerOpen={drawerOpen}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {drawerOpen && (
        <MobileDrawer
          user={user}
          pathname={pathname}
          sheetsConnected={sheetsConnected}
          onClose={() => setDrawerOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
