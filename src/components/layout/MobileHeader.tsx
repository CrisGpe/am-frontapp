import React from "react";
import { Sparkles } from "lucide-react";
import { UserSession } from "@/lib/types";

interface MobileHeaderProps {
  user: UserSession;
  sheetsConnected: boolean | null;
  onOpenDrawer: () => void;
}

export function MobileHeader({
  user,
  sheetsConnected,
  onOpenDrawer,
}: MobileHeaderProps) {
  return (
    <div className="flex md:hidden items-center justify-between h-14 max-w-7xl mx-auto px-4">
      {/* Mini Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-earth-500 text-white flex items-center justify-center shadow-md shadow-earth-500/20 flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-base text-earth-900 dark:text-cream-100 tracking-tight block leading-tight">
            Salón Élite
          </span>
          <span className="text-[9px] uppercase tracking-widest text-earth-600 dark:text-earth-400 block font-medium">
            CRM & Spa
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
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

        {/* User Avatar Chip */}
        <button
          onClick={onOpenDrawer}
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
  );
}
