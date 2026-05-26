import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { landingPages } from '@/lib/seo-content';

export const metadata: Metadata = {
  title: 'Soluciones para control de gastos, viáticos y recibos',
  description:
    'Explora soluciones de Factura Mis Gastos para facturar recibos por WhatsApp, controlar viáticos, ordenar gastos por empleado e industrias específicas.',
  alternates: {
    canonical: 'https://facturamisgastos.com/soluciones',
  },
};

const sectionLabels = {
  commercial: 'Por problema',
  industry: 'Por industria',
  comparison: 'Comparativas',
  faq: 'Preguntas',
};

export default function SolucionesPage() {
  const grouped = landingPages.reduce<Record<string, typeof landingPages>>((acc, page) => {
    acc[page.type] = acc[page.type] || [];
    acc[page.type].push(page);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <main className="bg-slate-50 pt-28 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="inline-flex rounded-full bg-blue-100 text-primary px-4 py-2 text-sm font-medium mb-5">
              Soluciones FMG
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5">
              Control de recibos, CFDI y gastos empresariales por caso de uso
            </h1>
            <p className="text-lg text-muted-foreground">
              Encuentra el flujo más cercano a tu operación: viáticos, gastos por empleado, sucursales,
              logística, construcción, ventas en campo o servicios profesionales.
            </p>
          </div>

          <div className="space-y-12">
            {Object.entries(sectionLabels).map(([type, label]) => (
              <section key={type}>
                <h2 className="text-2xl font-bold text-foreground mb-5">{label}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(grouped[type] || []).map((page) => (
                    <Link key={page.slug} href={'/' + page.slug} className="block h-full">
                      <Card className="h-full bg-white border-slate-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <p className="text-xs font-medium text-primary mb-2">{page.eyebrow}</p>
                          <h3 className="text-lg font-semibold text-foreground mb-2">{page.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">{page.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

