'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function CallPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Mostrar el popup después de 3 segundos
    const showTimer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    // Minimizar el popup después de 10 segundos de estar visible
    if (isOpen && !isMinimized) {
      const hideTimer = setTimeout(() => {
        setIsMinimized(true);
      }, 10000);

      return () => clearTimeout(hideTimer);
    }
  }, [isOpen, isMinimized]);

  const handleCall = () => {
    window.open('https://calendly.com/jorgeporras', '_blank');
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 gradient-bg rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Abrir chat de ayuda"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="gradient-bg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">¿Tienes dudas?</p>
            <p className="text-blue-100 text-xs">Estamos para ayudarte</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Minimizar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3">
            <p className="text-sm text-foreground">
              ¡Hola! Soy tu asistente de Factura Mis Gastos. ¿Te gustaría hablar con alguien de nuestro equipo para resolver tus dudas?
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleCall}
            className="w-full gradient-bg hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Agendar llamada
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Respuesta inmediata con nuestro asistente virtual
          </p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="px-4 py-2 bg-slate-50 border-t border-border flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground">Disponible ahora</span>
      </div>
    </div>
  );
}
