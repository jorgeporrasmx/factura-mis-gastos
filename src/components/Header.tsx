'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/LoginModal';
import { LeadFormModal } from '@/components/LeadFormModal';
import { Logo } from '@/components/Logo';

interface User {
  name: string;
  email: string;
  avatar: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showExpressForm, setShowExpressForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
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
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-sm" onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" className="text-sm" onClick={() => setIsLoginModalOpen(true)}>
                    Iniciar Sesión
                  </Button>
                  <Button
                    className="text-sm gradient-bg hover:opacity-90 transition-opacity"
                    onClick={() => setShowExpressForm(true)}
                  >
                    Comenzar ahora
                  </Button>
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
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 py-2">
                        <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="w-full justify-center" onClick={handleLogout}>
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="w-full justify-center" onClick={() => setIsLoginModalOpen(true)}>
                        Iniciar Sesión
                      </Button>
                      <Button
                        className="w-full gradient-bg"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowExpressForm(true);
                        }}
                      >
                        Comenzar ahora
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <LeadFormModal
        isOpen={showExpressForm}
        onClose={() => setShowExpressForm(false)}
        formType="express"
        redirectTo="/comenzar"
      />
    </>
  );
}
