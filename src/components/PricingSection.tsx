'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadFormModal, FormType } from './LeadFormModal';

type PlanId = 'freelancer' | 'personal' | 'equipos' | 'empresa' | 'corporativo';

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
    id: 'freelancer',
    name: "Freelancer Founder",
    tagline: "Lanzamiento para independientes.",
    price: "$150",
    unit: "MXN/mes",
    description: "Hasta 30 facturas al mes con Contador IA.",
    features: [
      "30 facturas mensuales incluidas",
      "Portal personal para recibos y comprobantes",
      "Contador IA con contexto de tu CSF",
      "Guia de deducciones segun tu regimen",
      "Checklist mensual para preparar declaraciones",
      "Soporte inicial por WhatsApp"
    ],
    cta: "Contratar lanzamiento",
    popular: true,
    isCustom: false
  },
  {
    id: 'personal',
    name: "Personal",
    tagline: "Ideal para freelancers y negocios pequenos.",
    price: "$10",
    unit: "MXN/recibo",
    description: "Hasta 50 recibos al mes.",
    features: [
      "Hasta 50 recibos mensuales",
      "1 usuario",
      "Reporte mensual incluido",
      "Envio por WhatsApp o correo",
      "Soporte por correo"
    ],
    cta: "Comenzar ahora",
    popular: false,
    isCustom: false
  },
  {
    id: 'equipos',
    name: "Equipos",
    tagline: "Para empresas con gastos recurrentes.",
    price: "$1,299",
    unit: "MXN/mes",
    description: "Hasta 150 recibos y 3 usuarios.",
    features: [
      "150 recibos mensuales",
      "Hasta 3 usuarios",
      "Reportes por persona",
      "Reglas de aprobacion",
      "Dashboard de control",
      "Soporte prioritario"
    ],
    cta: "Comenzar ahora",
    popular: false,
    isCustom: false
  },
  {
    id: 'empresa',
    name: "Empresa",
    tagline: "Control total para operaciones continuas.",
    price: "$2,499",
    unit: "MXN/mes",
    description: "Hasta 300 recibos y 8 usuarios.",
    features: [
      "300 recibos mensuales",
      "Hasta 8 usuarios",
      "Reportes por departamento",
      "Reportes de impuestos",
      "Integracion contable",
      "Soporte dedicado"
    ],
    cta: "Comenzar ahora",
    popular: true,
    isCustom: false
  },
  {
    id: 'corporativo',
    name: "Corporativo",
    tagline: "Solucion a la medida de tu operacion.",
    price: "A tu medida",
    unit: "",
    description: "Para grandes operaciones.",
    features: [
      "Usuarios ilimitados",
      "Facturas ilimitadas",
      "API disponible",
      "Soporte dedicado",
      "Configuracion a la medida"
    ],
    cta: "Solicitar cotizacion",
    popular: false,
    isCustom: true
  }
];

export function PricingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<FormType>('corporate');
  const freelancerPlan = plans.find((plan) => plan.id === 'freelancer')!;
  const companyPlans = plans.filter((plan) => plan.id !== 'freelancer');

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
            Elige el plan que se ajuste al tamaño de tu equipo. Sin sorpresas.
          </p>
        </div>

        <Tabs defaultValue="freelancers" className="max-w-6xl mx-auto">
          <TabsList className="max-w-md mx-auto">
            <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
          </TabsList>

          <TabsContent value="freelancers" className="mt-8">
            <Card className="relative overflow-hidden border-primary/30 shadow-xl shadow-blue-500/10">
              <Badge className="absolute top-4 right-4 gradient-bg px-4 py-1 text-sm">
                Precio Founder
              </Badge>
              <CardContent className="p-6 md:p-8">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
                  <div>
                    <p className="text-sm font-semibold text-primary mb-2">{freelancerPlan.tagline}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                      Facturas y guia fiscal para trabajar por tu cuenta.
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-xl">
                      Pensado para freelancers, RESICO y profesionistas que necesitan facturar, ordenar gastos
                      y entender que pueden deducir sin contratar una contabilidad completa desde el primer mes.
                    </p>

                    <div className="flex flex-wrap gap-3 mb-6 text-sm">
                      <span className="rounded-full bg-blue-50 text-blue-800 px-3 py-1">30 facturas/mes</span>
                      <span className="rounded-full bg-green-50 text-green-800 px-3 py-1">Contador IA</span>
                      <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">CSF personalizada</span>
                    </div>

                    <Link href={`/checkout/${freelancerPlan.id}`}>
                      <Button className="gradient-bg hover:opacity-90 shadow-lg shadow-blue-500/25">
                        {freelancerPlan.cta}
                        <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-3">
                      Lanzamiento por tiempo limitado. No incluye presentacion formal de declaraciones.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 md:p-6 border border-slate-200">
                    <div className="mb-5">
                      <span className="text-5xl font-bold text-foreground">{freelancerPlan.price}</span>
                      <span className="text-muted-foreground ml-1">{freelancerPlan.unit}</span>
                      <p className="text-sm text-muted-foreground mt-2">{freelancerPlan.description}</p>
                    </div>
                    <ul className="space-y-3">
                      {freelancerPlan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="empresas" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
              {companyPlans.map((plan, index) => (
                <PlanCard key={index} plan={plan} onCustomPlan={() => openModal('corporate')} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

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
      />
    </section>
  );
}

function PlanCard({ plan, onCustomPlan }: { plan: PlanConfig; onCustomPlan: () => void }) {
  return (
    <Card
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
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {plan.isCustom ? (
          <Button onClick={onCustomPlan} className="w-full transition-all bg-slate-800 hover:bg-slate-700">
            {plan.cta}
          </Button>
        ) : (
          <Link href={`/checkout/${plan.id}`}>
            <Button
              className={`w-full transition-all ${
                plan.popular
                  ? 'gradient-bg hover:opacity-90 shadow-lg shadow-blue-500/25 hover:shadow-xl'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {plan.cta}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
