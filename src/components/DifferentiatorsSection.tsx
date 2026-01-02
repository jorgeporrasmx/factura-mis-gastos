import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Aprobación antes de facturar",
    description: "Si un gasto excede el límite que defines, te notificamos para que lo apruebes antes de solicitar la factura."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Control por persona",
    description: "Cada integrante de tu equipo tiene su historial de gastos. Sabes exactamente quién gasta, cuánto y en qué."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: "Reglas personalizadas",
    description: "Define límites de gasto, categorías permitidas o cualquier política interna que necesites."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: "Dashboard para tu equipo",
    description: "Opcional: cada persona puede ver el estatus de sus recibos (pendiente, aprobado, facturado)."
  }
];

const optionalFeatures = [
  "Integración con tu sistema contable (Aspel, Contalink, Bind, Odoo, SAP)",
  "Reportes por departamento o centro de costo",
  "Exportación a Excel o conexión vía API"
];

export function DifferentiatorsSection() {
  return (
    <section
      id="caracteristicas"
      aria-label="Características y diferenciadores de Factura Mis Gastos"
      className="py-20 lg:py-28 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tú pones las reglas{' '}
            <span className="gradient-text">para los gastos de tu equipo.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No solo facturamos. Te damos el control que necesitas sobre los gastos de tu empresa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((item, index) => (
            <Card key={index} className="bg-white border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Optional features */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 text-center">
              Opcionales según tu operación
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {optionalFeatures.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-muted-foreground"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
