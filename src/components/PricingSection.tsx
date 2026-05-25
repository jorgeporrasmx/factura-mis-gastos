import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { firstReceiptWhatsAppUrl, getWhatsAppUrl } from '@/lib/whatsapp';

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
  whatsappUrl: string;
}

const plans: PlanConfig[] = [
  {
    id: 'diagnostico',
    name: "Primer lote de recibos",
    tagline: "Para probar FMG con tus tickets reales.",
    price: "$999",
    unit: "MXN/mes",
    description: "Ideal para negocios chicos con hasta 30 recibos mensuales.",
    features: [
      "Recepción de fotos de recibos y tickets",
      "Facturación y orden del lote",
      "Orden en Drive por mes",
      "Control básico para tu contador",
      "Activación incluida para clientes fundadores"
    ],
    cta: "Enviar mi primer recibo",
    popular: false,
    isCustom: false,
    whatsappUrl: firstReceiptWhatsAppUrl
  },
  {
    id: 'piloto',
    name: "FMG Recibo a Factura",
    tagline: "Para dejar de perder deducciones por tickets olvidados.",
    price: "$1,499",
    unit: "MXN/mes",
    description: "Hasta 75 recibos/tickets al mes.",
    features: [
      "Manda foto de tus recibos",
      "Facturación y seguimiento mensual",
      "Hasta 75 comprobantes mensuales",
      "Orden en Drive por negocio y mes",
      "Control mensual para tu contador",
      "Acompañamiento inicial incluido"
    ],
    cta: "Quiero facturar mis recibos",
    popular: true,
    isCustom: false,
    whatsappUrl: getWhatsAppUrl('Hola, quiero contratar FMG Recibo a Factura. Te mando mi primer recibo.')
  },
  {
    id: 'empresa',
    name: "FMG Empresa",
    tagline: "Para equipos que ya generan gastos todos los meses.",
    price: "$2,499",
    unit: "MXN/mes",
    description: "Hasta 300 recibos/tickets al mes.",
    features: [
      "Hasta 8 usuarios",
      "Hasta 300 comprobantes mensuales",
      "Control por persona o sucursal",
      "Carpeta documental ordenada",
      "Seguimiento mensual de recibos por facturar",
      "Preparación del paquete mensual para contador"
    ],
    cta: "Solicitar plan empresa",
    popular: false,
    isCustom: false,
    whatsappUrl: getWhatsAppUrl('Hola, quiero contratar FMG Empresa para mi equipo.')
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
            Empieza con un servicio acompañado. Validamos el flujo con tu equipo antes de automatizar de más.
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

                <Button
                  asChild
                  className={`w-full transition-all ${
                    plan.popular
                      ? 'gradient-bg hover:opacity-90 shadow-lg shadow-blue-500/25 hover:shadow-xl'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <a href={plan.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    {plan.cta}
                    {plan.popular && (
                      <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            ¿Necesitas algo diferente?{' '}
            <a href={getWhatsAppUrl('Hola, quiero revisar si Factura Mis Gastos aplica para mi negocio.')} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
              Platiquemos sobre tu caso.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
