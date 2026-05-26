export function SchemaOrg() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Factura Mis Gastos',
    legalName: 'Sutilde SAPI de CV',
    url: 'https://facturamisgastos.com',
    logo: 'https://facturamisgastos.com/logo.png',
    description:
      'Servicio mexicano para recibir tickets por WhatsApp, gestionar CFDI de gastos y entregar un corte mensual ordenado al contador.',
    foundingDate: '2024',
    areaServed: {
      '@type': 'Country',
      name: 'México',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MX',
    },
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
    name: 'Factura Mis Gastos',
    serviceType: 'Facturación y orden mensual de recibos empresariales',
    provider: {
      '@type': 'ProfessionalService',
      name: 'Factura Mis Gastos',
      url: 'https://facturamisgastos.com',
    },
    areaServed: {
      '@type': 'Country',
      name: 'México',
    },
    description:
      'Recibimos fotos de tickets y recibos, los facturamos, los ordenamos en Drive y entregamos un corte mensual al contador.',
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'PyMEs mexicanas con empleados que generan gastos operativos',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Primer lote de recibos',
        price: '999',
        priceCurrency: 'MXN',
        url: 'https://facturamisgastos.com/comenzar',
      },
      {
        '@type': 'Offer',
        name: 'FMG Recibo a Factura',
        price: '1499',
        priceCurrency: 'MXN',
        url: 'https://facturamisgastos.com/comenzar',
      },
      {
        '@type': 'Offer',
        name: 'FMG Empresa',
        price: '2499',
        priceCurrency: 'MXN',
        url: 'https://facturamisgastos.com/comenzar',
      },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Factura Mis Gastos',
    brand: {
      '@type': 'Brand',
      name: 'Factura Mis Gastos',
    },
    category: 'Gestión de gastos empresariales',
    description:
      'Servicio para capturar recibos por WhatsApp, dar seguimiento a CFDI y ordenar gastos mensuales para contador.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'MXN',
      lowPrice: '999',
      highPrice: '2499',
      offerCount: '3',
      url: 'https://facturamisgastos.com/comenzar',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo convertir recibos en gastos ordenados con Factura Mis Gastos',
    description:
      'Proceso para capturar recibos por WhatsApp, gestionar CFDI y preparar un corte mensual para contador.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Enviar el recibo',
        text: 'El empleado toma foto del ticket o recibo y lo envía por WhatsApp.',
      },
      {
        '@type': 'HowToStep',
        name: 'Gestionar la factura',
        text: 'Factura Mis Gastos da seguimiento al CFDI cuando aplica y marca el estatus del comprobante.',
      },
      {
        '@type': 'HowToStep',
        name: 'Recibir el reporte',
        text: 'La empresa recibe comprobantes organizados por mes para revisión de dirección y contador.',
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
      {
        '@type': 'Question',
        name: '¿Factura Mis Gastos sustituye a mi contador?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Factura Mis Gastos ayuda a ordenar recibos, CFDI y reportes para que tu contador revise con mejor información.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué pasa si un ticket no se puede facturar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El comprobante se marca como pendiente o no facturable según el caso, para que no se pierda en el cierre mensual.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
