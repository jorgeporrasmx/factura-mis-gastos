import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoLandingPage } from '@/components/SeoLandingPage';
import { getLandingPage, landingPages } from '@/lib/seo-content';

export function generateStaticParams() {
  return landingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);

  if (!page) {
    return {
      title: 'Página no encontrada',
    };
  }

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: {
      canonical: `https://facturamisgastos.com/${page.slug}`,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: `https://facturamisgastos.com/${page.slug}`,
      type: 'website',
    },
    twitter: {
      title: page.metaTitle,
      description: page.description,
      card: 'summary_large_image',
    },
  };
}

export default async function LandingRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLandingPage(slug);

  if (!page) {
    notFound();
  }

  return <SeoLandingPage page={page} />;
}
