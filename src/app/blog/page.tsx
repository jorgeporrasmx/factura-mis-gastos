import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Blog | Factura Mis Gastos',
  description: 'Artículos sobre gestión de gastos empresariales, viáticos y deducciones fiscales en México',
};

const articles = [
  {
    slug: 'caso-exito-logistica',
    title: 'Caso de Éxito: Empresa de Logística Recupera $180,000 en Deducciones',
    excerpt: 'Descubre cómo una empresa de logística con 25 empleados optimizó su gestión de gastos y maximizó sus deducciones fiscales.',
    date: '2026-01-28',
    readTime: '5 min',
    category: 'Casos de Éxito',
  },
  {
    slug: 'guia-viaticos-empleados',
    title: 'Cómo Gestionar Viáticos de Empleados sin Perder Deducciones',
    excerpt: 'Guía completa para empresas mexicanas: errores comunes, proceso ideal y cómo automatizar la gestión de viáticos.',
    date: '2026-01-25',
    readTime: '7 min',
    category: 'Guías Prácticas',
  },
  {
    slug: '5-senales-control-gastos',
    title: '5 Señales de que tu Empresa Necesita un Sistema de Control de Gastos',
    excerpt: 'Identifica si tu empresa está perdiendo dinero por mala gestión de comprobantes y qué buscar en una solución.',
    date: '2026-01-20',
    readTime: '4 min',
    category: 'Diagnóstico',
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />

      <div aria-hidden="true" className="blog-fixed-bg">
        <div className="blog-fixed-bg__gradient" />
        <div className="blog-fixed-bg__blob blog-fixed-bg__blob--1" />
        <div className="blog-fixed-bg__blob blog-fixed-bg__blob--2" />
        <div className="blog-fixed-bg__blob blog-fixed-bg__blob--3" />
      </div>

      <main className="relative min-h-screen pt-24 pb-20 sm:pt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">Blog</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Recursos para optimizar la gestión de gastos de tu empresa
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-md ring-1 ring-slate-900/5 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col"
              >
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-500">{article.readTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3 leading-snug min-h-[3.5rem]">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="hover:text-blue-700 transition-colors line-clamp-3"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed line-clamp-3 flex-grow">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-500">
                      {new Date(article.date).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1 text-blue-700 font-medium hover:text-blue-900 text-sm"
                    >
                      Leer más <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
