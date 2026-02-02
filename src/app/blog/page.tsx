import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Recursos para Gestión de Gastos Empresariales',
  description: 'Artículos, guías y casos de éxito sobre gestión de gastos empresariales, facturación CFDI y deducciones fiscales en México.',
};

const blogPosts = [
  {
    category: "Casos de éxito",
    title: "Cómo una empresa de logística recuperó $180,000 MXN en deducciones anuales",
    excerpt: "Descubre cómo esta empresa con 8 choferes logró facturar el 95% de sus gastos de combustible y casetas que antes se perdían.",
    image: "/blog/logistics.jpg",
    readTime: "5 min",
    slug: "caso-exito-logistica",
    date: "2024-01-15",
    featured: true,
  },
  {
    category: "Gastos de viaje",
    title: "Guía completa: Cómo gestionar viáticos de empleados sin perder deducciones",
    excerpt: "Los gastos de viaje son los más difíciles de facturar. Te explicamos cómo automatizar el proceso desde el hotel hasta el taxi.",
    image: "/blog/travel.jpg",
    readTime: "7 min",
    slug: "guia-viaticos-empleados",
    date: "2024-01-10",
    featured: true,
  },
  {
    category: "Para tu negocio",
    title: "5 señales de que tu empresa necesita un sistema de control de gastos",
    excerpt: "¿Tus empleados pierden recibos? ¿No sabes cuánto gasta cada departamento? Estas son las señales de alerta.",
    image: "/blog/business.jpg",
    readTime: "4 min",
    slug: "senales-sistema-control-gastos",
    date: "2024-01-05",
    featured: false,
  },
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Blog de{' '}
                <span className="text-primary">Factura Mis Gastos</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Aprende cómo optimizar los gastos de tu empresa, maximizar deducciones fiscales y mantener un control eficiente de viáticos.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">Artículos destacados</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <Card className="h-full bg-white border-0 shadow-sm hover:shadow-lg transition-all group overflow-hidden">
                      <div className="h-56 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-20 h-20 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                        <Badge className="absolute top-4 left-4 bg-white text-foreground shadow-sm">
                          {post.category}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime} de lectura
                          </span>
                          <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1">
                            Leer artículo
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Todos los artículos</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="h-full bg-white border shadow-sm hover:shadow-lg transition-all group overflow-hidden">
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
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              ¿Listo para optimizar los gastos de tu empresa?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Empieza hoy y recupera las deducciones que estás perdiendo. Sin contratos, sin complicaciones.
            </p>
            <Link
              href="/comenzar"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Comenzar gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
