'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Factura Mis Gastos</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Cómo Funciona
            </Link>
            <Link href="#precios" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Precios
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-sm">
              Iniciar Sesión
            </Button>
            <Button className="text-sm gradient-bg hover:opacity-90 transition-opacity">
              Comenzar ahora
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Cómo Funciona
              </Link>
              <Link href="#precios" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Precios
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-center">
                  Iniciar Sesión
                </Button>
                <Button className="w-full gradient-bg">
                  Comenzar ahora
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
