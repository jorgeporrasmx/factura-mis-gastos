import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
  title: "Factura Mis Gastos | Automatización de Gastos Empresariales en México",
  description: "Plataforma líder para automatizar gastos por empleado, generar CFDIs y conectar con contabilidad. Control total de gastos empresariales.",
  keywords: [
    "automatización de gastos empresariales",
    "control de gastos México",
    "facturación automática",
    "CFDI automático",
    "gestión de gastos por empleado",
    "software contable México",
    "deducciones fiscales",
    "tickets a facturas",
  ],
  authors: [{ name: "Factura Mis Gastos" }],
  creator: "Factura Mis Gastos",
  publisher: "Factura Mis Gastos",
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
    title: "Factura Mis Gastos | Automatización de Gastos Empresariales en México",
    description: "Plataforma líder para automatizar gastos por empleado, generar CFDIs y conectar con contabilidad.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Factura Mis Gastos - Control total de gastos empresariales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Factura Mis Gastos | Automatización de Gastos Empresariales",
    description: "Plataforma líder para automatizar gastos por empleado y generar CFDIs automáticamente.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://facturamisgastos.com",
  },
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
