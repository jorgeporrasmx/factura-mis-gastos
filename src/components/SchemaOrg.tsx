export function SchemaOrg() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Factura Mis Gastos',
    url: 'https://facturamisgastos.com',
    logo: 'https://facturamisgastos.com/logo.png',
    description:
      'Facturamos recibos, ordenamos gastos y entregamos un corte mensual al contador.',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'hola@facturamisgastos.com',
      availableLanguage: ['Spanish'],
    },
    sameAs: [
      'https://www.facebook.com/people/Factura-Mis-Gastos/61588321863853/',
      'https://www.instagram.com/facturamisgastos/',
      'https://x.com/FactMisGastos',
      'https://www.linkedin.com/company/factura-mis-gastos/about/?viewAsMember=true',
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Facturación y orden mensual de recibos empresariales',
    provider: {
      '@type': 'Organization',
      name: 'Factura Mis Gastos',
    },
    areaServed: {
      '@type': 'Country',
      name: 'México',
    },
    description:
      'Recibimos fotos de tickets y recibos, los facturamos, los ordenamos en Drive y entregamos un corte mensual al contador.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Primer lote de recibos',
        price: '999',
        priceCurrency: 'MXN',
      },
      {
        '@type': 'Offer',
        name: 'FMG Recibo a Factura',
        price: '1499',
        priceCurrency: 'MXN',
      },
      {
        '@type': 'Offer',
        name: 'FMG Empresa',
        price: '2499',
        priceCurrency: 'MXN',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es Factura Mis Gastos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Facturamos recibos y tickets, los ordenamos y preparamos el corte mensual para tu contador.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo funciona el servicio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mandas foto de tus recibos; FMG los factura, los ordena en Drive y deja un corte mensual para tu contador.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta el servicio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hoy ofrecemos Primer lote de recibos por $999 MXN al mes, FMG Recibo a Factura por $1,499 MXN al mes y FMG Empresa por $2,499 MXN al mes.'
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
