'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function WhatsAppClickTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href*="wa.me"]') as HTMLAnchorElement | null;

      if (!link) return;

      const payload = {
        event: 'whatsapp_cta_click',
        cta_text: link.textContent?.trim().replace(/\s+/g, ' ') || 'WhatsApp CTA',
        cta_href: link.href,
        page_path: window.location.pathname,
      };

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
      window.gtag?.('event', 'whatsapp_cta_click', payload);
    };

    document.addEventListener('click', handleClick);

    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

