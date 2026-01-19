'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { TermsModal } from '@/components/TermsModal';

const footerLinks = {
  producto: [
    { label: "Características", href: "#" },
    { label: "Precios", href: "#precios" },
    { label: "Integraciones", href: "#integraciones" },
    { label: "API", href: "#" },
  ],
  empresa: [
    { label: "Acerca de", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Casos de éxito", href: "#" },
    { label: "Contacto", href: "#" },
  ],
  recursos: [
    { label: "Centro de ayuda", href: "#" },
    { label: "Documentación", href: "#" },
    { label: "Webinars", href: "#" },
    { label: "Status", href: "#" },
  ],
  legal: [
    { label: "Privacidad", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export function Footer() {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  return (
    <>
      <footer
        role="contentinfo"
        aria-label="Pie de página de Factura Mis Gastos"
        className="bg-slate-900 text-slate-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Logo size="sm" className="[&_span]:text-white" />
              </div>
              <p className="text-sm text-slate-400 mb-4 max-w-xs">
                Automatiza los gastos de tu empresa. Tu equipo envía el recibo, nosotros lo facturamos.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Producto</h3>
              <ul className="space-y-2">
                {footerLinks.producto.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Empresa</h3>
              <ul className="space-y-2">
                {footerLinks.empresa.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Recursos</h3>
              <ul className="space-y-2">
                {footerLinks.recursos.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-sm hover:text-white transition-colors text-left"
                  >
                    Términos y Condiciones
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Factura Mis Gastos. Todos los derechos reservados.
              </p>
              <p className="text-sm text-slate-400">
                Hecho con orgullo en México
              </p>
            </div>
          </div>
        </div>
      </footer>

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
}
