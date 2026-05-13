'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadFormModal, FormType } from './LeadFormModal';

type PlanId = 'diagnostico' | 'piloto' | 'empresa';

interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  isCustom: boolean;
}

const plans: PlanConfig[] = [
  {
    id: 'diagnostico',
    name: "Diagnóstico de deducciones perdidas",
    tagline: "Para saber cuánto control estás dejando sobre la mesa.",
    price: "$999",
    unit: "MXN una vez",
    description: "Revisión inicial de tu flujo de comprobantes y gastos.",
    features: [
      "Mapeo de cómo hoy recibes tickets y facturas",
      "Estimación de fugas por comprobantes perdidos",
      "Recomendación concreta de implementación",
      "Checklist para tu equipo y contador",
      "Entregable accionable en máximo 48 horas"
    ],
    cta: "Agendar diagnóstico",
    popular: false,
    isCustom: false
  },
  {
    id: 'piloto',
    name: "Piloto FMG",
    tagline: "MVP asistido para validar con tu operación real.",
    price: "$1,499",
    unit: "MXN/mes",
    description: "Hasta 3 usuarios y 100 comprobantes al mes.",
    features: [
      "Onboarding asistido para tu empresa",
      "Hasta 3 usuarios",
      "Hasta 100 comprobantes mensuales",
      "Orden por persona, empresa y mes",
      "Reporte mensual listo para revisar con tu contador",
      "Soporte operativo durante el piloto"
    ],
    cta: "Solicitar piloto",
    popular: true,
    isCustom: false
  },
  {
    id: 'empresa',
    name: "FMG Empresa",
    tagline: "Para equipos que ya generan gastos todos los meses.",
    price: "$2,499",
    unit: "MXN/mes",
    description: "Hasta 8 usuarios y 300 comprobantes al mes.",
    features: [
      "Hasta 8 usuarios",
      "Hasta 300 comprobantes mensuales",
      "Reporte por persona",
      "Carpeta documental ordenada",
      "Seguimiento mensual de comprobantes faltantes",
      "Preparación del paquete mensual para contador"
    ],
    cta: "Solicitar piloto empresa",
    popular: false,
    isCustom: false
  }
];

export function PricingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<FormType>('corporate');

  const openModal = (type: FormType) => {
    setFormType(type);
    setIsModalOpen(true);
  };

  return (
    <section
      id="precios"
      aria-label="Planes y precios de Factura Mis Gastos"
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Precios{' '}
            <span className="gradient-text">claros y simples.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empieza con un piloto acompañado. Validamos el flujo con tu equipo antes de automatizar de más.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 ring-2 ring-primary shadow-2xl shadow-blue-500/20 border-0 z-10'
                  : 'bg-white border border-border shadow-sm hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-bg px-4 py-1 text-sm shadow-lg">
                  Recomendado
                </Badge>
              )}

              <CardHeader className="pb-4">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-primary font-medium">{plan.tagline}</p>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.unit}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.isCustom ? (
                  <Button
                    onClick={() => openModal('corporate')}
                    className={`w-full transition-all ${
                      plan.popular
                        ? 'gradient-bg hover:opacity-90 shadow-lg shadow-blue-500/25 hover:shadow-xl'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Button
                    onClick={() => openModal(plan.id === 'empresa' ? 'corporate' : plan.id === 'diagnostico' ? 'standard' : 'pilot')}
                    className={`w-full transition-all ${
                      plan.popular
                        ? 'gradient-bg hover:opacity-90 shadow-lg shadow-blue-500/25 hover:shadow-xl'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {plan.cta}
                    {plan.popular && (
                      <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            ¿Necesitas algo diferente?{' '}
            <button
              onClick={() => openModal('standard')}
              className="text-primary font-medium hover:underline"
            >
              Platiquemos sobre tu caso.
            </button>
          </p>
        </div>
      </div>

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formType={formType}
        planInterest={
          formType === 'corporate'
            ? 'FMG Empresa'
            : formType === 'pilot'
              ? 'Piloto FMG'
              : 'Diagnóstico de deducciones perdidas'
        }
      />
    </section>
  );
}
