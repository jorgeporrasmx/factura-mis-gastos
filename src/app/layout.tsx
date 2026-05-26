import type { Metadata, Viewport } from "next";
import { SchemaOrg } from "@/components/SchemaOrg";
import { Providers } from "@/components/Providers";
import { WhatsAppClickTracker } from "@/components/WhatsAppClickTracker";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://facturamisgastos.com"),
  title: {
    default: "Factura Mis Gastos | Convierte recibos en facturas ordenadas",
    template: "%s | Factura Mis Gastos",
  },
  description: "Manda foto de tus recibos. Los facturamos, los ordenamos en Drive y cerramos el mes para tu contador.",
  keywords: [
    "gestión de gastos empresariales México",
    "control de gastos por empleado",
    "facturación CFDI",
    "recibos a facturas México",
    "gastos de viaje empresariales",
    "viáticos empleados México",
    "deducciones fiscales empresas",
    "software gastos empresariales",
    "facturar gastos WhatsApp",
    "control gastos pymes México",
    "reportes gastos empleados",
    "sistema control viáticos",
  ],
  authors: [{ name: "Factura Mis Gastos", url: "https://facturamisgastos.com" }],
  creator: "Factura Mis Gastos",
  publisher: "Factura Mis Gastos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Factura Mis Gastos",
    title: "Factura Mis Gastos | Recibos, facturas y deducciones",
    description: "Facturamos recibos, los ordenamos en Drive y entregamos un corte mensual para contador.",
    url: "https://facturamisgastos.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Factura Mis Gastos - Recibos, facturas y deducciones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Factura Mis Gastos | Convierte recibos en facturas ordenadas",
    description: "Manda foto de tus recibos; FMG los factura, los ordena y prepara el corte para tu contador.",
    images: ["/og-image.png"],
    creator: "@FactMisGastos",
  },
  alternates: {
    canonical: "https://facturamisgastos.com",
    languages: {
      "es-MX": "https://facturamisgastos.com",
      "es": "https://facturamisgastos.com",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
    },
  },
  category: "business",
  classification: "Business Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://calendly.com" />
        <link rel="preconnect" href="https://cal.com" />
        <link rel="dns-prefetch" href="https://calendly.com" />
        <link rel="dns-prefetch" href="https://cal.com" />

        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="MX" />
        <meta name="geo.placename" content="México" />
        <meta name="language" content="Spanish" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />

        <SchemaOrg />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <WhatsAppClickTracker />
        {/* Metricool tracking pixel */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://tracker.metricool.com/c3po.jpg?hash=ba09c37d496414ea7995eae7eae89d95" alt="" width={1} height={1} style={{ position: "absolute", visibility: "hidden" }} />
      </body>
    </html>
  );
}
