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
    id: 'primer-lote',
    name: 'Primer lote de recibos',
    price: '$999 MXN/mes',
    description: 'Para negocios chicos que quieren probar FMG con tickets reales.',
    bullets: [
      'Hasta 30 recibos al mes',
      'Facturación y orden del lote',
      'Orden mensual en Drive',
      'Control básico para contador',
    ],
    formType: 'standard' as FormType,
    planInterest: 'Primer lote de recibos',
    cta: 'Enviar mi primer recibo',
  },
  {
    id: 'recibo-factura',
    name: 'FMG Recibo a Factura',
    price: '$1,499 MXN/mes',
    description: 'La opción recomendada para cerrar el mes sin tickets perdidos.',
    bullets: [
      'Hasta 75 recibos/tickets al mes',
      'Seguimiento mensual de facturación',
      'Drive ordenado por negocio y mes',
      'Corte mensual para tu contador',
    ],
    formType: 'pilot' as FormType,
    planInterest: 'FMG Recibo a Factura',
    cta: 'Quiero facturar mis recibos',
    featured: true,
  },
  {
    id: 'empresa',
    name: 'FMG Empresa',
    price: '$2,499 MXN/mes',
    description: 'Para equipos con más movimiento y necesidad de control por persona o sucursal.',
    bullets: [
      'Hasta 8 usuarios',
      'Hasta 300 comprobantes al mes',
      'Control por persona o sucursal',
      'Paquete mensual para contador',
    ],
    formType: 'corporate' as FormType,
    planInterest: 'FMG Empresa',
    cta: 'Solicitar plan empresa',
  },
];

export default function ComenzarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<FormType>('pilot');
  const [planInterest, setPlanInterest] = useState('FMG Recibo a Factura');

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
          <Badge className="mb-4 gradient-bg">Recibo → factura → contador</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Mándanos foto de tus recibos. Nosotros los facturamos y ordenamos tus gastos.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            FMG evita que tus tickets se pierdan en WhatsApp, cajones o fotos. Cerramos el mes ordenado para tu contador.
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
              <h2 className="text-xl font-bold text-foreground">Qué pasa después</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Mandas tus datos y tu primer recibo por WhatsApp.</p>
              <p>2. Lo facturamos o te decimos qué dato falta.</p>
              <p>3. Lo guardamos en Drive y queda registrado en control mensual.</p>
              <p>4. Repetimos el flujo durante el mes con tus nuevos recibos.</p>
              <p>5. Tu contador recibe el paquete ordenado para el cierre.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-slate-900">
            <CardHeader>
              <h2 className="text-xl font-bold">¿No sabes si tus tickets aplican?</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-200">
              <p>
                Si a un recibo le falta algún dato fiscal, lo marcamos y lo dejamos en seguimiento antes de cerrar el mes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  onClick={() => openLeadModal('standard', 'Revisión de recibos')}
                >
                  Revisar mi caso
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
