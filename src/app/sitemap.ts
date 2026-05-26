import { MetadataRoute } from 'next';
import { blogArticles, landingPages } from '@/lib/seo-content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://facturamisgastos.com';
  const currentDate = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/comenzar`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soluciones`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/feed.xml`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/guia-empleado`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const landingRoutes: MetadataRoute.Sitemap = landingPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: currentDate,
    changeFrequency: page.type === 'commercial' ? 'monthly' : 'weekly',
    priority: page.priority,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogArticles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly',
    priority: 0.58,
  }));

  return [...coreRoutes, ...landingRoutes, ...blogRoutes];
}
