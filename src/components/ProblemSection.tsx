import { Card, CardContent } from '@/components/ui/card';

const problems = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Gastos que nunca se facturan",
    description: "Recibos que se pierden o llegan tarde y ya no se pueden deducir."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Sin visibilidad de quién gasta qué",
    description: "No sabes cuánto gasta cada empleado hasta que es demasiado tarde."
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Dependes de tu área contable",
    description: "Y cuando fallan, tú pierdes dinero en deducciones no aprovechadas."
  }
];

export function ProblemSection() {
  return (
    <section
      id="problema"
      aria-label="Problemas comunes de gastos empresariales que resolvemos"
      className="py-20 lg:py-28 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            ¿Cuánto dinero pierdes cada mes<br />
            <span className="text-red-500">por gastos sin facturar?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Si dependes de tu equipo interno para solicitar facturas, probablemente estás dejando deducciones sobre la mesa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-500 mb-4 mx-auto">
                  {problem.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
                <p className="text-muted-foreground text-sm">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl font-medium text-foreground">
            Con nosotros, <span className="gradient-text font-bold">ningún gasto se queda sin facturar.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
