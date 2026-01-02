'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// URL de Calendly - cambiar por la URL real cuando esté configurada
const CALENDLY_URL = 'https://calendly.com/facturamisgastos/asesoria';

const plans = [
  {
    name: "Personal",
    tagline: "Ideal para freelancers y negocios pequeños.",
    price: "$10",
    unit: "MXN/recibo",
    description: "Hasta 50 recibos al mes.",
    features: [
      "Hasta 50 recibos mensuales",
      "1 usuario",
      "Reporte mensual incluido",
      "Envío por WhatsApp o correo",
      "Soporte por correo"
    ],
    cta: "Comenzar ahora",
    popular: false,
    calendly: false
  },
  {
    name: "Equipos",
    tagline: "Para empresas con gastos recurrentes.",
    price: "$1,299",
    unit: "MXN/mes",
    description: "Hasta 150 recibos y 3 usuarios.",
    features: [
      "150 recibos mensuales",
      "Hasta 3 usuarios",
      "Reportes por persona",
      "Reglas de aprobación",
      "Dashboard de control",
      "Soporte prioritario"
    ],
    cta: "Comenzar ahora",
    popular: false,
    calendly: false
  },
  {
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
      "Integración contable",
      "Soporte dedicado"
    ],
    cta: "Comenzar ahora",
    popular: true,
    calendly: false
  },
  {
    name: "Corporativo",
    tagline: "Solución a la medida de tu operación.",
    price: "A tu medida",
    unit: "",
    description: "Para grandes operaciones.",
    features: [
      "Usuarios ilimitados",
      "Facturas ilimitadas",
      "API disponible",
      "Soporte dedicado",
      "Configuración a la medida"
    ],
    cta: "Hablar con un asesor",
    popular: false,
    calendly: true
  }
];

export function PricingSection() {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-start">
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

                {plan.calendly ? (
                  <>
                    <Button
                      className="w-full bg-slate-800 hover:bg-slate-700 transition-all"
                      onClick={() => window.open(CALENDLY_URL, '_blank')}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {plan.cta}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      O habla ahora con nuestro{' '}
                      <button
                        className="text-primary hover:underline font-medium"
                        onClick={() => {
                          const popup = document.querySelector('[aria-label="Abrir chat de ayuda"]') as HTMLButtonElement;
                          if (popup) popup.click();
                        }}
                      >
                        asesor virtual
                      </button>
                    </p>
                  </>
                ) : (
                  <Link href="/comenzar">
                    <Button
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
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            ¿Necesitas algo diferente?{' '}
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              Platiquemos sobre tu caso.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
