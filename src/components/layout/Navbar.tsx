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
import { DesktopNavbar } from "./DesktopNavbar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileDrawer } from "./MobileDrawer";

interface NavbarProps {
  user: UserSession;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { connected: sheetsConnected } = useSheetsHealth();

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
    document.body.style.overflow = drawerOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

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

  const isMoreActive =
    user.rol === "admin" &&
    ["/admin/agentes", "/admin/configuracion", "/agente"].some((path) =>
      pathname.startsWith(path)
    );

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-earth-950/95 backdrop-blur-md border-b border-earth-200 dark:border-earth-800">
        <DesktopNavbar
          user={user}
          pathname={pathname}
          links={getDesktopNavLinks()}
          sheetsConnected={sheetsConnected}
          onLogout={handleLogout}
        />
        <MobileHeader
          user={user}
          sheetsConnected={sheetsConnected}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
      </header>

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
    </>
  );
}
