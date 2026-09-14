'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstaller, setShowInstaller] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (process.env.NODE_ENV === "development") {
            console.log("SW registered:", registration);
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("SW registration failed:", error);
          }
        });
    }

    const checkDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (checkDismissed === 'true') {
      return;
    }

    // Detect iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
    
    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      setShowInstaller(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstaller(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstaller(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstaller(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showInstaller) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-white/95 dark:bg-earth-950/95 backdrop-blur-md border border-earth-200 dark:border-earth-800 shadow-2xl rounded-2xl md:rounded-full px-5 py-3.5 flex items-center justify-between gap-3 animate-fade-in">
      {isIOS ? (
        <div className="flex-1 text-sm text-earth-800">
          📱 Toca Compartir ⎋ y luego <strong>&quot;Añadir a pantalla de inicio&quot;</strong> ➕
        </div>
      ) : (
        <div className="flex-1 text-sm font-medium text-earth-900">
          📱 Instalar app Salón Élite para acceso rápido
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-earth-600 hover:bg-earth-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
          >
            Instalar
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="w-8 h-8 flex items-center justify-center text-earth-400 hover:text-earth-600 hover:bg-earth-50 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
