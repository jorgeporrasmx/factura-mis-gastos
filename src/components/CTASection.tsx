'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

// URL de Calendly - cambiar por la URL real cuando esté configurada
const CALENDLY_URL = 'https://calendly.com/facturamisgastos/asesoria';

export function CTASection() {
  return (
    <section
      id="contacto"
      aria-label="Comienza a usar Factura Mis Gastos hoy"
      className="py-20 lg:py-28 gradient-bg relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Deja de perder deducciones.<br />
          <span className="text-blue-200">Empieza hoy.</span>
        </h2>

        <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Tu equipo solo envía el recibo. Nosotros nos encargamos del resto.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/comenzar">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-blue-50 text-base px-8 py-6 h-auto font-semibold"
            >
              Comenzar ahora
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white/10 text-base px-8 py-6 h-auto bg-transparent"
            onClick={() => window.open(CALENDLY_URL, '_blank')}
          >
            <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Hablar con un asesor
          </Button>
        </div>
      </div>
    </section>
  );
}
