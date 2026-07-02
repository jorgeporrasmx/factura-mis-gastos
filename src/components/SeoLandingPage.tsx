import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppWidgetLazy } from '@/components/WhatsAppWidgetLazy';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { landingPages, type LandingPage } from '@/lib/seo-content';

export function SeoLandingPage({ page }: { page: LandingPage }) {
  const whatsappUrl = getWhatsAppUrl(page.whatsappMessage);
  const relatedPages = landingPages
    .filter((candidate) => candidate.slug !== page.slug && candidate.type === page.type)
    .slice(0, 3);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://facturamisgastos.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: `https://facturamisgastos.com/${page.slug}`,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: page.h1,
    description: page.description,
    step: [
      {
        '@type': 'HowToStep',
        name: 'Enviar recibo',
        text: 'El empleado manda una foto del ticket o recibo por WhatsApp.',
      },
      {
        '@type': 'HowToStep',
        name: 'Gestionar CFDI',
        text: 'Factura Mis Gastos da seguimiento a la factura cuando aplica y marca el estatus del comprobante.',
      },
      {
        '@type': 'HowToStep',
        name: 'Ordenar cierre mensual',
        text: 'Los comprobantes quedan organizados para dirección y contador.',
      },
    ],
  };

  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="pt-28 pb-16 bg-gradient-to-br from-blue-50 via-white to-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-blue-100 text-primary px-4 py-2 text-sm font-medium mb-6">
                {page.eyebrow}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
                {page.h1}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {page.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="gradient-bg h-auto px-8 py-5 text-base">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    {page.ctaText}
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-auto px-8 py-5 text-base">
                  <Link href="/comenzar">Ver planes</Link>
                </Button>
              </div>
            </div>

            <Card className="border-blue-100 shadow-lg">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">El problema</h2>
                  <p className="text-muted-foreground leading-relaxed">{page.problem}</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Cómo lo resuelve FMG</h2>
                  <p className="text-muted-foreground leading-relaxed">{page.solution}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Ejemplo práctico</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{page.example}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {page.bullets.map((bullet) => (
                <div key={bullet} className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                  <span className="text-green-600 font-bold">✓</span>
                  <p className="mt-2 text-sm text-muted-foreground">{bullet}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {page.faqs.map((faq) => (
                <article key={faq.question} className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {relatedPages.length > 0 && (
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">Páginas relacionadas</h2>
                  <p className="text-muted-foreground">
                    Más recursos para comparar, ordenar gastos y reducir comprobantes perdidos.
                  </p>
                </div>
                <Link href="/soluciones" className="text-sm font-medium text-primary hover:underline">
                  Ver todas las soluciones
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedPages.map((relatedPage) => (
                  <Link
                    key={relatedPage.slug}
                    href={'/' + relatedPage.slug}
                    className="rounded-lg border border-slate-200 p-5 hover:border-primary hover:shadow-sm transition bg-white"
                  >
                    <p className="text-sm font-semibold text-foreground mb-2">{relatedPage.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{relatedPage.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 gradient-bg text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">Empieza con un recibo real</h2>
            <p className="text-blue-100 mb-8">
              Mándanos tu primer ticket y revisamos si el flujo aplica para tu operación.
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-blue-50 h-auto px-8 py-5 text-base">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Hablar por WhatsApp
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidgetLazy />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
    </>
  );
}
