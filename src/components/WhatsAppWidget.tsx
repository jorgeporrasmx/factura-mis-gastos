'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, ChevronDown } from 'lucide-react';

const WHATSAPP_NUMBER = '5216143977690';
const MONDAY_FORM_URL = 'https://forms.monday.com/forms/833e567b6bdfd15c2aeced0aaaecb12f?r=use1';

export function WhatsAppWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted) return;

    const timer = setTimeout(() => {
      setIsExpanded(true);
      setTimeout(() => {
        setIsExpanded(false);
      }, 8000);
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleWhatsAppClick = () => {
    setHasInteracted(true);
    const message = encodeURIComponent('Hola, me interesa Factura Mis Gastos. ¿Podrían darme más información?');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleFormClick = () => {
    setHasInteracted(true);
    setIsExpanded(false);
    window.open(MONDAY_FORM_URL, '_blank');
  };

  const handleToggle = () => {
    setHasInteracted(true);
    setIsExpanded(!isExpanded);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Abrir opciones de contacto"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-green-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">¿Tienes dudas?</p>
            <p className="text-green-100 text-xs">Te respondemos al instante</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className="text-white/80 hover:text-white transition-colors p-1"
          aria-label="Minimizar"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <Button
          onClick={handleWhatsAppClick}
          className="w-full bg-green-500 hover:bg-green-600 h-12 text-base font-medium"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Escríbenos ahora
        </Button>

        <Button
          onClick={handleFormClick}
          variant="outline"
          className="w-full h-11 text-sm"
        >
          <Phone className="w-4 h-4 mr-2" />
          Déjanos tus datos
        </Button>
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">En línea</span>
        </div>
        <span className="text-xs text-gray-400">Respuesta inmediata</span>
      </div>
    </div>
  );
}
