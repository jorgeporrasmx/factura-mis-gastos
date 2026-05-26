import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Empieza a facturar recibos por WhatsApp',
  description:
    'Elige un plan de Factura Mis Gastos y manda tu primer recibo por WhatsApp para ordenar tickets, CFDI y cierre mensual.',
  alternates: {
    canonical: 'https://facturamisgastos.com/comenzar',
  },
  openGraph: {
    title: 'Empieza a facturar recibos por WhatsApp',
    description:
      'Elige un plan de Factura Mis Gastos y manda tu primer recibo por WhatsApp.',
    url: 'https://facturamisgastos.com/comenzar',
  },
};

export default function ComenzarLayout({ children }: { children: React.ReactNode }) {
  return children;
}

