const integrations = [
  { name: "Contalink", category: "Contabilidad" },
  { name: "Aspel", category: "Contabilidad" },
  { name: "Bind ERP", category: "Contabilidad" },
  { name: "Odoo MX", category: "ERP" },
  { name: "SAP B1", category: "ERP" },
  { name: "Google Sheets", category: "Productividad" },
  { name: "Zapier", category: "Automatización" },
  { name: "Make", category: "Automatización" },
  { name: "WhatsApp API", category: "Comunicación" }
];

export function IntegrationsSection() {
  return (
    <section id="integraciones" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Conecta con{' '}
            <span className="gradient-text">toda tu operación.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Integraciones nativas con los sistemas contables y de productividad más usados en México.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 lg:gap-6">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:shadow-md transition-shadow group"
            >
              {/* Placeholder for logo - using initials */}
              <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-3 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
                <span className="text-lg font-bold text-slate-500 group-hover:text-primary transition-colors">
                  {integration.name.split(' ').map(w => w[0]).join('')}
                </span>
              </div>
              <span className="text-xs font-medium text-foreground text-center">{integration.name}</span>
              <span className="text-xs text-muted-foreground">{integration.category}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            ¿No ves tu sistema? <span className="text-primary font-medium">Probablemente ya lo soportamos.</span>
          </p>
          <a href="#" className="inline-flex items-center text-primary font-medium hover:underline">
            Ver todas las integraciones
            <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
