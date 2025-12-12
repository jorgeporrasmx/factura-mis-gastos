import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: "Básico",
    tagline: "Paga solo lo que facturas.",
    price: "$10",
    unit: "MXN por factura",
    description: "Ideal para equipos pequeños o flujo variable.",
    features: [
      "Sin costo mensual fijo",
      "Reporte mensual incluido",
      "Envío por WhatsApp o correo",
      "Soporte por correo"
    ],
    cta: "Comenzar ahora",
    popular: false
  },
  {
    name: "Equipos",
    tagline: "Para empresas con gastos recurrentes.",
    price: "$990",
    unit: "MXN/mes",
    description: "Hasta 150 tickets y 5 empleados.",
    features: [
      "150 tickets mensuales",
      "Hasta 5 empleados",
      "Reportes por empleado",
      "Reglas de aprobación",
      "Dashboard de control",
      "Soporte prioritario"
    ],
    cta: "Comenzar ahora",
    popular: true
  },
  {
    name: "Empresa",
    tagline: "Control total para operaciones más grandes.",
    price: "$1,990",
    unit: "MXN/mes",
    description: "1,000 tickets, 15 empleados, múltiples RFCs.",
    features: [
      "1,000 tickets mensuales",
      "Hasta 15 empleados",
      "3 RFCs incluidos",
      "Integración contable opcional",
      "Reportes por departamento",
      "API disponible",
      "Soporte dedicado"
    ],
    cta: "Hablar con un asesor",
    popular: false
  }
];

export function PricingSection() {
  return (
    <section id="precios" className="py-20 lg:py-28 bg-white">
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

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white border shadow-sm hover:shadow-lg transition-shadow ${
                plan.popular ? 'ring-2 ring-primary shadow-lg border-0' : 'border-border'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg">
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

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'gradient-bg hover:opacity-90'
                      : 'bg-foreground hover:bg-foreground/90'
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            ¿Necesitas algo diferente?{' '}
            <a href="#" className="text-primary font-medium hover:underline">
              Platiquemos sobre tu caso.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
