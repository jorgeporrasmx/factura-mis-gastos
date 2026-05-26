import { blogArticles } from '@/lib/seo-content';

export const dynamic = 'force-static';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const baseUrl = 'https://facturamisgastos.com';
  const items = blogArticles
    .map((article) => {
      const url = baseUrl + '/blog/' + article.slug;

      return [
        '<item>',
        '<title>' + escapeXml(article.title) + '</title>',
        '<link>' + url + '</link>',
        '<guid>' + url + '</guid>',
        '<description>' + escapeXml(article.description) + '</description>',
        '<pubDate>' + new Date(article.date).toUTCString() + '</pubDate>',
        '</item>',
      ].join('');
    })
    .join('');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    '<title>Factura Mis Gastos Blog</title>',
    '<link>' + baseUrl + '/blog</link>',
    '<description>Recursos sobre recibos, CFDI, viáticos y control de gastos empresariales en México.</description>',
    '<language>es-MX</language>',
    '<lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>',
    items,
    '</channel>',
    '</rss>',
  ].join('');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}

