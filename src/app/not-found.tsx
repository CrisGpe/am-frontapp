import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[--background] text-[--foreground] text-center">
      <div className="w-12 h-12 rounded-2xl bg-earth-500 text-white flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Página no encontrada</h2>
      <p className="text-sm text-earth-600 mb-6">
        La ruta a la que intentas acceder no existe en el CRM.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-earth-500 text-white font-medium text-sm hover:bg-earth-600 transition-colors shadow-sm"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
