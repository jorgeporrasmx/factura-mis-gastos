export function SchemaOrg() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Factura Mis Gastos',
    url: 'https://facturamisgastos.com',
    logo: 'https://facturamisgastos.com/logo.png',
    description:
      'Servicio asistido para convertir recibos y tickets en gastos ordenados, con seguimiento de facturación cuando aplica y corte mensual para contador.',
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
      'Recibimos fotos de tickets y recibos, revisamos si pueden facturarse, los ordenamos en Drive y entregamos un control mensual listo para revisar con el contador.',
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
          text: 'Es un servicio asistido para negocios mexicanos que quieren convertir recibos y tickets en gastos ordenados para su contador.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo funciona el servicio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mandas foto de tus recibos, FMG revisa si pueden facturarse, los ordena en Drive y deja un corte mensual listo para tu contador.',
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
