import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SchemaOrg } from "@/components/SchemaOrg";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://facturamisgastos.com"),
  title: {
    default: "Factura Mis Gastos | Gestión de Gastos Empresariales en México",
    template: "%s | Factura Mis Gastos",
  },
  description: "Tus empleados envían el recibo por WhatsApp, nosotros gestionamos la factura CFDI. Plataforma de control de gastos empresariales en México con verificación humana. Desde $10 MXN por factura.",
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
    title: "Factura Mis Gastos | Gestión de Gastos Empresariales en México",
    description: "Tus empleados envían el recibo por WhatsApp, nosotros gestionamos la factura CFDI. Control total de gastos con verificación humana.",
    url: "https://facturamisgastos.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Factura Mis Gastos - Tus empleados envían el recibo, nosotros lo facturamos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Factura Mis Gastos | Gestión de Gastos Empresariales",
    description: "Tus empleados envían el recibo por WhatsApp, nosotros gestionamos la factura CFDI.",
    images: ["/og-image.png"],
    creator: "@facturamisgastos",
  },
  alternates: {
    canonical: "https://facturamisgastos.com",
    languages: {
      "es-MX": "https://facturamisgastos.com",
      "es": "https://facturamisgastos.com",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
