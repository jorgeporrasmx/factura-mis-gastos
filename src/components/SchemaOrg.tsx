export function SchemaOrg() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Factura Mis Gastos",
    "url": "https://facturamisgastos.com",
    "logo": "https://facturamisgastos.com/logo.png",
    "description": "Plataforma de gestión de gastos empresariales en México. Tus empleados envían el recibo por WhatsApp y nosotros gestionamos la factura CFDI.",
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "Factura Mis Gastos"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MX",
      "addressLocality": "México"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "hola@facturamisgastos.com",
      "availableLanguage": ["Spanish"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/facturamisgastos",
      "https://twitter.com/facturamisgastos",
      "https://www.facebook.com/facturamisgastos"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Factura Mis Gastos",
    "description": "Servicio de gestión de gastos empresariales y facturación CFDI en México",
    "url": "https://facturamisgastos.com",
    "telephone": "",
    "email": "hola@facturamisgastos.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MX"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "19.4326",
      "longitude": "-99.1332"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "$$"
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Factura Mis Gastos - Plataforma de Gestión de Gastos",
    "description": "Sistema de control de gastos empresariales donde tus empleados envían recibos por WhatsApp y nosotros gestionamos la factura CFDI. Incluye reportes por empleado, reglas de aprobación y dashboard de control.",
    "brand": {
      "@type": "Brand",
      "name": "Factura Mis Gastos"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Plan Equipos",
        "description": "Hasta 150 recibos y 3 usuarios. Para empresas con gastos recurrentes.",
        "price": "1299",
        "priceCurrency": "MXN",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "1299",
          "priceCurrency": "MXN",
          "unitText": "mes"
        },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Plan Empresa",
        "description": "Hasta 300 recibos y 8 usuarios. Incluye integración contable y reportes de impuestos.",
        "price": "2499",
        "priceCurrency": "MXN",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "2499",
          "priceCurrency": "MXN",
          "unitText": "mes"
        },
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Plan Corporativo",
        "description": "Solución a la medida para grandes operaciones. Usuarios y facturas ilimitadas, API disponible.",
        "availability": "https://schema.org/InStock"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "50",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué es Factura Mis Gastos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Factura Mis Gastos es una plataforma de gestión de gastos empresariales en México. Tus empleados envían el recibo por WhatsApp o correo, y nuestro equipo se encarga de solicitar y verificar la factura CFDI con el proveedor. Tú recibes reportes organizados por empleado."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo funciona el servicio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El proceso es simple: 1) Tu empleado envía el recibo por WhatsApp o correo, 2) Nosotros gestionamos la factura CFDI con el proveedor y la verificamos, 3) Tú recibes los reportes organizados por empleado, departamento o consolidados."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta el servicio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ofrecemos tres planes: Equipos a $1,299 MXN/mes (150 recibos, 3 usuarios), Empresa a $2,499 MXN/mes (300 recibos, 8 usuarios, integración contable), y Corporativo para grandes operaciones a la medida."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué tipo de empresas pueden usar Factura Mis Gastos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Factura Mis Gastos es ideal para empresas mexicanas con 3 a 15 empleados que generan gastos: logística y transporte, ventas en campo, construcción, consultoría, tecnología, y servicios profesionales. Es especialmente útil para empresas con empleados que viajan constantemente."
        }
      },
      {
        "@type": "Question",
        "name": "¿El proceso es automático o hay verificación humana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nuestro servicio incluye verificación humana. A diferencia de sistemas 100% automatizados, nuestro equipo se asegura de que cada factura CFDI sea correcta y válida antes de entregarla. Esto garantiza que ningún gasto se quede sin facturar."
        }
      },
      {
        "@type": "Question",
        "name": "¿Puedo establecer límites de gasto por empleado?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí. Puedes definir reglas de aprobación para que si un gasto excede cierto límite, te notifiquemos antes de solicitar la factura. También puedes establecer categorías permitidas y políticas internas personalizadas."
        }
      },
      {
        "@type": "Question",
        "name": "¿Se integra con sistemas contables?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, ofrecemos integración opcional con sistemas contables como Aspel, Contalink, Bind, Odoo y SAP. También puedes exportar a Excel o conectarte vía API."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo tarda en generarse una factura?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El tiempo depende del proveedor, pero generalmente las facturas se gestionan en 24-48 horas hábiles. Nuestro equipo se encarga de todo el seguimiento hasta obtener el CFDI válido."
        }
      }
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Gestión de Gastos Empresariales",
    "provider": {
      "@type": "Organization",
      "name": "Factura Mis Gastos"
    },
    "areaServed": {
      "@type": "Country",
      "name": "México"
    },
    "description": "Servicio de gestión de gastos empresariales donde gestionamos las facturas CFDI de los recibos que tus empleados envían por WhatsApp. Incluye verificación humana, reportes por empleado y reglas de aprobación personalizadas.",
    "offers": {
      "@type": "Offer",
      "price": "10",
      "priceCurrency": "MXN",
      "description": "Desde $10 MXN por factura"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Factura Mis Gastos",
    "url": "https://facturamisgastos.com",
    "description": "Plataforma de gestión de gastos empresariales en México",
    "inLanguage": "es-MX",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://facturamisgastos.com/buscar?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://facturamisgastos.com"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
