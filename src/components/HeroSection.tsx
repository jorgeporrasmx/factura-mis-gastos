'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LeadFormModal } from './LeadFormModal';

const trustBadges = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    text: "Datos encriptados"
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    text: "Soporte en español"
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: "Sin contratos largos"
  }
];

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      id="inicio"
      aria-label="Factura Mis Gastos - Gestión de gastos empresariales en México"
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/30 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-primary mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Control de gastos empresariales en México
            </div>

            {/* Main headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up leading-tight">
              <span className="text-foreground">Tu equipo envía el recibo,</span>{' '}
              <span className="text-primary">nosotros lo facturamos,</span>{' '}
              <span className="gradient-text">tú tienes un reporte completo.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in-up delay-100">
              Olvídate de gastos sin facturar. Tu equipo manda el recibo por WhatsApp y tú recibes reportes claros.</p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8 animate-fade-in-up delay-200">
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="gradient-bg hover:opacity-90 transition-all text-base px-8 py-6 h-auto shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  Comenzar ahora
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="text-base px-8 py-6 h-auto border-2 border-slate-300 hover:border-primary hover:bg-blue-50 transition-all"
              >
                <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Solicitar demo
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 animate-fade-in-up delay-300">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-green-600">{badge.icon}</span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Illustration */}
          <div className="relative animate-fade-in-right delay-200 hidden lg:block">
            {/* Phone mockup with WhatsApp flow */}
            <div className="relative mx-auto w-80">
              {/* Main phone */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-3 border border-slate-200">
                <div className="bg-slate-100 rounded-[2rem] overflow-hidden">
                  {/* Phone header */}
                  <div className="bg-green-600 px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Factura Mis Gastos</p>
                      <p className="text-green-100 text-xs">En línea</p>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="p-4 space-y-3 bg-[#e5ddd5] min-h-[280px]">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-[#dcf8c6] rounded-lg px-3 py-2 max-w-[200px] shadow">
                        <p className="text-sm text-slate-800">📷 Recibo de Uber</p>
                        <p className="text-xs text-slate-500 text-right mt-1">10:30 ✓✓</p>
                      </div>
                    </div>

                    {/* Bot response */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[220px] shadow">
                        <p className="text-sm text-slate-800">✅ ¡Recibido! Procesando tu factura...</p>
                        <p className="text-xs text-slate-500 mt-1">10:30</p>
                      </div>
                    </div>

                    {/* Success message */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[220px] shadow">
                        <p className="text-sm text-slate-800">🎉 <strong>¡Factura lista!</strong></p>
                        <p className="text-sm text-slate-600 mt-1">RFC: XAXX010101000</p>
                        <p className="text-sm text-slate-600">Total: $152.00 MXN</p>
                        <p className="text-xs text-slate-500 mt-1">10:31</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card - Report preview */}
              <div className="absolute -right-4 top-20 bg-white rounded-xl shadow-xl p-4 w-48 animate-float border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Reporte</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Este mes</span>
                    <span className="font-semibold text-slate-800">47 facturas</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Deducible</span>
                    <span className="font-semibold text-green-600">$12,450</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formType="standard"
      />
    </section>
  );
}
