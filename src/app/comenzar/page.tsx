'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadFormModal, type FormType } from '@/components/LeadFormModal';

const CALENDLY_URL = 'https://calendly.com/jorgeporras';

const offers = [
  {
    id: 'diagnostico',
    name: 'Diagnóstico de deducciones perdidas',
    price: '$999 MXN',
    description: 'Una revisión puntual para detectar dónde se están perdiendo comprobantes y cómo corregirlo.',
    bullets: [
      'Mapeo del flujo actual',
      'Detección de fugas documentales',
      'Checklist para equipo y contador',
      'Entregable accionable en 48 horas',
    ],
    formType: 'standard' as FormType,
    planInterest: 'Diagnóstico de deducciones perdidas',
    cta: 'Agendar diagnóstico',
  },
  {
    id: 'piloto',
    name: 'Control Mensual FMG',
    price: '$1,499 MXN/mes',
    description: 'La opción para empezar hoy con una operación pequeña y acompañada.',
    bullets: [
      'Hasta 3 usuarios',
      'Hasta 100 comprobantes al mes',
      'Onboarding asistido',
      'Reporte mensual listo para contador',
    ],
    formType: 'pilot' as FormType,
    planInterest: 'Control Mensual FMG',
    cta: 'Ordenar mis comprobantes',
    featured: true,
  },
  {
    id: 'empresa',
    name: 'FMG Empresa',
    price: '$2,499 MXN/mes',
    description: 'Para equipos con más movimiento y necesidad de control por persona.',
    bullets: [
      'Hasta 8 usuarios',
      'Hasta 300 comprobantes al mes',
      'Reporte por persona',
      'Carpeta documental ordenada',
    ],
    formType: 'corporate' as FormType,
    planInterest: 'FMG Empresa',
    cta: 'Solicitar plan empresa',
  },
];

export default function ComenzarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<FormType>('pilot');
  const [planInterest, setPlanInterest] = useState('Control Mensual FMG');

  const openLeadModal = (nextFormType: FormType, nextPlanInterest: string) => {
    setFormType(nextFormType);
    setPlanInterest(nextPlanInterest);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">Factura Mis Gastos</span>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Volver al inicio
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-12">
          <Badge className="mb-4 gradient-bg">Control mensual</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Empieza con una operación clara, no con otro sistema abandonado.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            FMG centraliza comprobantes, los ordena por persona y mes, y prepara un corte mensual listo para revisar con tu contador.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {offers.map((offer) => (
            <Card
              key={offer.id}
              className={`relative bg-white border shadow-sm ${offer.featured ? 'ring-2 ring-primary shadow-lg border-primary' : 'border-border'}`}
            >
              {offer.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg">
                  Recomendado para arrancar
                </Badge>
              )}
              <CardHeader>
                <h2 className="text-xl font-bold text-foreground">{offer.name}</h2>
                <p className="text-3xl font-bold text-foreground mt-3">{offer.price}</p>
                <p className="text-sm text-muted-foreground mt-2">{offer.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {offer.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${offer.featured ? 'gradient-bg hover:opacity-90' : 'bg-slate-800 hover:bg-slate-700'}`}
                  onClick={() => openLeadModal(offer.formType, offer.planInterest)}
                >
                  {offer.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white border-border">
            <CardHeader>
              <h2 className="text-xl font-bold text-foreground">Qué pasa después de solicitarlo</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Revisamos tu volumen, equipo y dolor principal.</p>
              <p>2. Definimos si conviene diagnóstico o control mensual.</p>
              <p>3. Acordamos onboarding y forma de pago manual.</p>
              <p>4. Activamos la empresa y hacemos la primera prueba de carga.</p>
              <p>5. Cerramos el primer corte mensual contigo.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-slate-900">
            <CardHeader>
              <h2 className="text-xl font-bold">¿Prefieres hablar primero?</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-200">
              <p>
                Si todavía no sabes qué plan aplica, agendamos un diagnóstico corto y te decimos si FMG vale la pena para tu operación hoy.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  onClick={() => openLeadModal('standard', 'Diagnóstico de deducciones perdidas')}
                >
                  Agendar diagnóstico
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent"
                  onClick={() => window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')}
                >
                  Ver agenda disponible
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formType={formType}
        planInterest={planInterest}
      />
    </div>
  );
}
