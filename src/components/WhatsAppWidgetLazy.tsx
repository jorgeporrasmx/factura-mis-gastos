'use client';

import dynamic from 'next/dynamic';

// El widget de chat (~300 líneas + iconos) no es crítico para el primer render:
// cargarlo de forma diferida saca su JS del bundle inicial de la landing.
const WhatsAppWidgetInner = dynamic(
  () => import('@/components/WhatsAppWidget').then((mod) => ({ default: mod.WhatsAppWidget })),
  { ssr: false }
);

export function WhatsAppWidgetLazy() {
  return <WhatsAppWidgetInner />;
}
