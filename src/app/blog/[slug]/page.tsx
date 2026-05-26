import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogArticle, blogArticles } from '@/lib/seo-content';
import { getWhatsAppUrl } from '@/lib/whatsapp';

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    return { title: 'Artículo no encontrado' };
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `https://facturamisgastos.com/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      url: `https://facturamisgastos.com/blog/${article.slug}`,
      publishedTime: article.date,
    },
  };
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-4">
      {content
        .trim()
        .split('\n')
        .map((line, index) => {
          const trimmed = line.trim();

          if (!trimmed) return null;

          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={index} className="text-2xl font-bold text-gray-900 pt-6">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={index} className="text-xl font-semibold text-gray-900 pt-4">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }

          if (trimmed.startsWith('- ')) {
            return (
              <p key={index} className="text-gray-700 leading-relaxed pl-4">
                • {trimmed.replace('- ', '')}
              </p>
            );
          }

          if (/^\d+\. /.test(trimmed)) {
            return (
              <p key={index} className="text-gray-700 leading-relaxed pl-4">
                {trimmed}
              </p>
            );
          }

          return (
            <p key={index} className="text-gray-700 leading-relaxed">
              {trimmed}
            </p>
          );
        })}
    </div>
  );
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    notFound();
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'Factura Mis Gastos',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Factura Mis Gastos',
      logo: {
        '@type': 'ImageObject',
        url: 'https://facturamisgastos.com/logo.png',
      },
    },
    mainEntityOfPage: `https://facturamisgastos.com/blog/${article.slug}`,
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <Link href="/blog" className="text-blue-600 hover:underline">← Volver al blog</Link>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded">{article.category}</span>
              <span className="text-sm text-gray-500">{article.readTime} de lectura</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <p className="text-gray-500 mb-8">
              {new Date(article.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <MarkdownContent content={article.content} />

            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">¿Listo para ordenar tus recibos?</h2>
              <p className="text-gray-700 mb-4">Mándanos tu primer recibo y revisamos si el flujo aplica para tu negocio.</p>
              <a
                href={getWhatsAppUrl('Hola, leí un artículo de Factura Mis Gastos y quiero revisar mi caso.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </article>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    </>
  );
}
