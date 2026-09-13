"use client";

import React, { useState, useEffect } from "react";
import { Delete, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

interface PinPadProps {
  onComplete: (pin: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export function PinPad({ onComplete, isLoading = false, error = null, onClearError }: PinPadProps) {
  const [pin, setPin] = useState("");

  const handleDigit = (digit: string) => {
    if (isLoading) return;
    if (error && onClearError) onClearError();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        onComplete(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (isLoading) return;
    if (error && onClearError) onClearError();
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (isLoading) return;
    setPin("");
    if (error && onClearError) onClearError();
  };

  // Soporte para teclado físico (escritorio / laptop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, isLoading, error]);

  // Si hay error, limpiar después de un momento
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setPin("");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"];

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center">
      {/* Indicadores de dígitos (Dots) */}
      <div className="flex items-center justify-center gap-4 my-6">
        {[0, 1, 2, 3].map((index) => {
          const filled = pin.length > index;
          return (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                error
                  ? "bg-red-500 scale-110 animate-bounce"
                  : filled
                  ? "bg-earth-500 scale-125 shadow-md shadow-earth-500/30"
                  : "bg-earth-200 dark:bg-earth-800"
              }`}
            />
          );
        })}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg mb-4 text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Teclado numérico */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {digits.map((item) => {
          if (item === "C") {
            return (
              <button
                key="clear"
                type="button"
                onClick={handleClear}
                disabled={isLoading || pin.length === 0}
                className="h-16 rounded-2xl flex items-center justify-center font-medium text-earth-700 dark:text-earth-300 text-sm hover:bg-earth-100 dark:hover:bg-earth-900/60 active:scale-95 transition-all disabled:opacity-40"
              >
                Limpiar
              </button>
            );
          }

          if (item === "DEL") {
            return (
              <button
                key="delete"
                type="button"
                onClick={handleDelete}
                disabled={isLoading || pin.length === 0}
                className="h-16 rounded-2xl flex items-center justify-center text-earth-700 dark:text-earth-300 hover:bg-earth-100 dark:hover:bg-earth-900/60 active:scale-95 transition-all disabled:opacity-40"
                aria-label="Borrar dígito"
              >
                <Delete className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleDigit(item)}
              disabled={isLoading || pin.length >= 4}
              className="h-16 rounded-2xl bg-white dark:bg-earth-900/70 border border-earth-200 dark:border-earth-800 flex items-center justify-center text-2xl font-semibold text-earth-900 dark:text-cream-100 shadow-sm hover:bg-earth-50 dark:hover:bg-earth-800 active:scale-95 active:bg-earth-100 transition-all disabled:opacity-50"
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
