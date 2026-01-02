'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

// URL de Calendly - cambiar por la URL real cuando esté configurada
const CALENDLY_URL = 'https://calendly.com/facturamisgastos/asesoria';

export function HeroSection() {
  const handleCalendlyClick = () => {
    window.open(CALENDLY_URL, '_blank');
  };

  return (
    <section
      id="inicio"
      aria-label="Factura Mis Gastos - Gestión de gastos empresariales en México"
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-primary mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Control de gastos empresariales en México
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Tus empleados envían el recibo.</span><br />
            <span className="text-blue-600">Nosotros lo facturamos.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            Olvídate de gastos sin facturar. Tu equipo manda el recibo por WhatsApp y tú recibes reportes claros por empleado.
          </p>

          {/* Verified metric */}
          <p className="text-sm text-primary font-medium mb-10">
            Mejora tu eficiencia de facturación hasta en un 30%
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/comenzar">
              <Button size="lg" className="gradient-bg hover:opacity-90 transition-opacity text-base px-8 py-6 h-auto">
                Comenzar ahora
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 h-auto border-2"
              onClick={handleCalendlyClick}
            >
              <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Hablar con un asesor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
