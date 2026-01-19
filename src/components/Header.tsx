'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

// Ya no se usa Monday form para el inicio, los usuarios van directo a login

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border"
    >
      <nav
        role="navigation"
        aria-label="Navegación principal"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Cómo Funciona
            </button>
            <button
              onClick={() => scrollToSection('precios')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Precios
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Link href="/portal">
                  <Button className="text-sm gradient-bg hover:opacity-90">
                    Mi Portal
                  </Button>
                </Link>
                <Link href="/portal/recibos">
                  <Button variant="outline" className="text-sm">
                    Subir Recibos
                  </Button>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="text-sm gradient-bg hover:opacity-90 transition-opacity">
                    Comenzar ahora
                  </Button>
                </Link>
              </>
            )}
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
              <button
                onClick={() => scrollToSection('como-funciona')}
                className="text-sm font-medium text-muted-foreground hover:text-primary text-left"
              >
                Cómo Funciona
              </button>
              <button
                onClick={() => scrollToSection('precios')}
                className="text-sm font-medium text-muted-foreground hover:text-primary text-left"
              >
                Precios
              </button>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-2 py-2">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'Usuario'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.displayName
                            ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : user.email.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.displayName || 'Usuario'}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/portal" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center">
                        Mi Portal
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-center" onClick={handleLogout}>
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-center">
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link href="/auth/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full gradient-bg">
                        Comenzar ahora
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
