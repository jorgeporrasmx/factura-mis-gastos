'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyProvider, useCompany } from '@/contexts/CompanyContext';
import { PortalNav } from '@/components/portal/PortalNav';

// Componente interno que verifica onboarding
function PortalContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile, isLoading: companyLoading, error, refreshCompany } = useCompany();
  const [hasRefreshed, setHasRefreshed] = useState(false);

  // Usar ref para evitar que refreshCompany cause re-ejecución del useEffect
  const refreshCompanyRef = useRef(refreshCompany);
  useEffect(() => {
    refreshCompanyRef.current = refreshCompany;
  }, [refreshCompany]);

  // Detectar si viene del onboarding y forzar recarga
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    if (onboardingParam === 'completed' && !hasRefreshed) {
      setHasRefreshed(true);
      // Limpiar el parámetro de la URL
      router.replace('/portal');
      // Forzar recarga del contexto
      refreshCompanyRef.current();
    }
  }, [searchParams, hasRefreshed, router]); // Sin refreshCompany en deps

  // Redirigir a onboarding si no está completo (solo si no hay error y no viene del onboarding)
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    // No redirigir si acaba de completar el onboarding (esperar a que se recargue)
    if (onboardingParam === 'completed') return;

    if (!companyLoading && !error && userProfile && !userProfile.onboardingCompleted) {
      router.push('/auth/onboarding');
    }
  }, [companyLoading, error, userProfile, router, searchParams]);

  // Mostrar loading mientras verifica
  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // No redirigir si hay error - permitir acceso básico al portal
  // No renderizar si onboarding no completado (y no hay error)
  // Pero permitir si viene del onboarding completado (esperar recarga)
  const onboardingParam = searchParams.get('onboarding');
  if (!error && userProfile && !userProfile.onboardingCompleted && onboardingParam !== 'completed') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PortalNav />

      {/* Main content area */}
      <div className="md:pl-64">
        <main className="pb-20 md:pb-0">{children}</main>
      </div>
    </div>
  );
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/portal');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <CompanyProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        }
      >
        <PortalContent>{children}</PortalContent>
      </Suspense>
    </CompanyProvider>
  );
}
