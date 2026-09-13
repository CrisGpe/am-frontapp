"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PinPad } from "@/components/auth/PinPad";
import { Sparkles, Users, HeartHandshake, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"agente" | "cliente">("agente");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<string | null>(null);

  const handlePinSubmit = async (pin: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, tipo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "PIN inválido");
        setIsLoading(false);
        return;
      }

      setSuccessUser(data.user.nombre);
      setTimeout(() => {
        router.push(data.redirectUrl);
        router.refresh();
      }, 500);
    } catch (err) {
      setError("Error de conexión con el servidor");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gradient-to-b from-cream-100 via-cream-200 to-cream-300 dark:from-earth-900 dark:via-earth-950 dark:to-[#120F0B]">
      <div className="w-full max-w-md bg-white/80 dark:bg-earth-900/90 backdrop-blur-md rounded-3xl border border-earth-200 dark:border-earth-800 shadow-xl p-6 sm:p-8 flex flex-col items-center text-center">
        
        {/* Brand Icon & Name */}
        <div className="w-16 h-16 rounded-2xl bg-earth-500 text-white flex items-center justify-center shadow-lg shadow-earth-500/25 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-earth-900 dark:text-cream-100">
          Salón Élite & Spa
        </h1>
        <p className="text-sm text-earth-600 dark:text-earth-400 mt-1">
          Ingresa tu PIN de 4 dígitos para acceder
        </p>

        {/* Tab Selector: Colaboradores vs Clientes */}
        <div className="grid grid-cols-2 p-1.5 bg-earth-100 dark:bg-earth-950 rounded-2xl w-full mt-6 mb-2 border border-earth-200/60 dark:border-earth-800/60">
          <button
            type="button"
            onClick={() => {
              setTipo("agente");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
              tipo === "agente"
                ? "bg-white dark:bg-earth-800 text-earth-900 dark:text-cream-100 shadow-sm"
                : "text-earth-600 dark:text-earth-400 hover:text-earth-900"
            }`}
          >
            <Users className="w-4 h-4" />
            Colaborador
          </button>
          <button
            type="button"
            onClick={() => {
              setTipo("cliente");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
              tipo === "cliente"
                ? "bg-white dark:bg-earth-800 text-earth-900 dark:text-cream-100 shadow-sm"
                : "text-earth-600 dark:text-earth-400 hover:text-earth-900"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Cliente
          </button>
        </div>

        {/* Success Banner */}
        {successUser ? (
          <div className="my-8 py-4 px-6 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-300 dark:border-sage-800 text-sage-800 dark:text-sage-200 flex flex-col items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-sage-500" />
            <span className="font-semibold">¡Bienvenido(a), {successUser}!</span>
            <span className="text-xs text-sage-600 dark:text-sage-400">Accediendo a tu panel...</span>
          </div>
        ) : (
          <PinPad
            onComplete={handlePinSubmit}
            isLoading={isLoading}
            error={error}
            onClearError={() => setError(null)}
          />
        )}

        {/* Quick Demo Credentials Footer */}
        <div className="mt-6 pt-6 border-t border-earth-100 dark:border-earth-800/80 w-full text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-earth-500 dark:text-earth-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            PINs de Prueba (Demostración)
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {tipo === "agente" ? (
              <>
                <button
                  type="button"
                  onClick={() => handlePinSubmit("1234")}
                  className="px-2.5 py-1.5 rounded-lg bg-earth-50 dark:bg-earth-950 hover:bg-earth-200 border border-earth-200 dark:border-earth-800 text-earth-800 dark:text-earth-200 transition-colors"
                >
                  👑 Admin: <strong className="text-earth-900 dark:text-white">1234</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handlePinSubmit("2345")}
                  className="px-2.5 py-1.5 rounded-lg bg-earth-50 dark:bg-earth-950 hover:bg-earth-200 border border-earth-200 dark:border-earth-800 text-earth-800 dark:text-earth-200 transition-colors"
                >
                  ✂️ Agente Carlos: <strong className="text-earth-900 dark:text-white">2345</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handlePinSubmit("4567")}
                  className="px-2.5 py-1.5 rounded-lg bg-earth-50 dark:bg-earth-950 hover:bg-earth-200 border border-earth-200 dark:border-earth-800 text-earth-800 dark:text-earth-200 transition-colors"
                >
                  💅 Agente Mariana: <strong className="text-earth-900 dark:text-white">4567</strong>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handlePinSubmit("1111")}
                  className="px-2.5 py-1.5 rounded-lg bg-sage-50 dark:bg-sage-950 hover:bg-sage-200 border border-sage-200 dark:border-sage-800 text-sage-900 dark:text-sage-200 transition-colors"
                >
                  🌸 Cliente Camila: <strong className="text-sage-950 dark:text-white">1111</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handlePinSubmit("2222")}
                  className="px-2.5 py-1.5 rounded-lg bg-sage-50 dark:bg-sage-950 hover:bg-sage-200 border border-sage-200 dark:border-sage-800 text-sage-900 dark:text-sage-200 transition-colors"
                >
                  ✨ Cliente Daniela: <strong className="text-sage-950 dark:text-white">2222</strong>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
