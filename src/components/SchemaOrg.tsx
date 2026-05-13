export function SchemaOrg() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Factura Mis Gastos',
    url: 'https://facturamisgastos.com',
    logo: 'https://facturamisgastos.com/logo.png',
    description:
      'Piloto asistido para empresas mexicanas que necesitan ordenar comprobantes y cerrar cada mes con mejor control documental.',
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
    serviceType: 'Orden documental de comprobantes empresariales',
    provider: {
      '@type': 'Organization',
      name: 'Factura Mis Gastos',
    },
    areaServed: {
      '@type': 'Country',
      name: 'México',
    },
    description:
      'Centralizamos comprobantes de empleados, los ordenamos por persona, empresa y mes, y entregamos un reporte mensual listo para revisar con el contador.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Diagnóstico de deducciones perdidas',
        price: '999',
        priceCurrency: 'MXN',
      },
      {
        '@type': 'Offer',
        name: 'Piloto FMG',
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
          text: 'Es un piloto asistido para empresas mexicanas que quieren dejar de perder deducciones por comprobantes desordenados.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo funciona el servicio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tu equipo sube comprobantes, FMG los ordena por persona y mes, y te entregamos un corte mensual listo para revisar con tu contador.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto cuesta el servicio?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hoy ofrecemos Diagnóstico por $999 MXN, Piloto FMG por $1,499 MXN al mes y FMG Empresa por $2,499 MXN al mes.',
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
