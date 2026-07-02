import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogArticles } from '@/lib/seo-content';

const blogPosts = blogArticles.slice(0, 3);

const industries = [
  { name: "Logística y transporte", icon: "🚛" },
  { name: "Ventas en campo", icon: "💼" },
  { name: "Construcción", icon: "🏗️" },
  { name: "Consultoría", icon: "📊" },
  { name: "Tecnología", icon: "💻" },
  { name: "Servicios profesionales", icon: "⚖️" }
];

export function BlogSection() {
  return (
    <section
      id="recursos"
      aria-label="Recursos y artículos sobre gestión de gastos empresariales"
      className="py-20 lg:py-28 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Recursos para{' '}
            <span className="gradient-text">tu empresa.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprende cómo otras empresas están optimizando sus gastos y maximizando sus deducciones fiscales.
          </p>
        </div>

        {/* Industries badge section */}
        <div className="mb-12">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            Adaptable a cualquier industria
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((industry, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-foreground shadow-sm border border-border"
              >
                <span>{industry.icon}</span>
                {industry.name}
              </span>
            ))}
          </div>
        </div>

        {/* Featured callout for travel expenses */}
        <div className="mb-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                ¿Tus empleados viajan constantemente?
              </h3>
              <p className="text-blue-100 mb-0 md:mb-0">
                Hoteles, vuelos, taxis, comidas... Los gastos de viaje son los más difíciles de facturar.
                Con Factura Mis Gastos, tu equipo solo envía el recibo desde donde esté y nosotros conseguimos la factura.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button asChild variant="secondary" className="bg-white text-primary hover:bg-blue-50 font-semibold">
                <Link href="/control-de-viaticos">Ver cómo funciona</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Blog posts grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {blogPosts.map((post, index) => (
            <Link key={index} href={`/blog/${post.slug}`}>
              <Card
                className="bg-white border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden h-full"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-white text-foreground shadow-sm">
                    {post.category}
                  </Badge>
                </div>

                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {post.readTime} de lectura
                    </span>
                    <span className="text-sm font-medium text-primary group-hover:underline">
                      Leer más →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center">
          <Link href="/blog">
            <Button variant="outline" className="px-8">
              Ver todos los artículos
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
