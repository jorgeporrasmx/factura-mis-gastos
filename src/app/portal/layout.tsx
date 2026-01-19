'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyProvider, useCompany } from '@/contexts/CompanyContext';
import { PortalNav } from '@/components/portal/PortalNav';

// Componente interno que verifica onboarding
function PortalContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userProfile, isLoading: companyLoading, error } = useCompany();

  // Redirigir a onboarding si no está completo (solo si no hay error)
  useEffect(() => {
    if (!companyLoading && !error && userProfile && !userProfile.onboardingCompleted) {
      router.push('/auth/onboarding');
    }
  }, [companyLoading, error, userProfile, router]);

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
  if (!error && userProfile && !userProfile.onboardingCompleted) {
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
      <PortalContent>{children}</PortalContent>
    </CompanyProvider>
  );
}
