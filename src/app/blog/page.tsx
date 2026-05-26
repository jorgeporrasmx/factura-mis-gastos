import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { blogArticles } from '@/lib/seo-content';

export const metadata = {
  title: 'Blog | Factura Mis Gastos',
  description: 'Artículos sobre gestión de gastos empresariales, viáticos y deducciones fiscales en México',
  alternates: {
    canonical: 'https://facturamisgastos.com/blog',
  },
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600">Recursos para optimizar la gestión de gastos de tu empresa</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogArticles.map((article) => (
              <article key={article.slug} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">{article.category}</span>
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 min-h-[3.5rem]">
                    <Link href={`/blog/${article.slug}`} className="hover:text-blue-600 line-clamp-3">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3 flex-grow">{article.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{new Date(article.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <Link href={`/blog/${article.slug}`} className="text-blue-600 font-medium hover:underline text-sm">
                      Leer más →
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
