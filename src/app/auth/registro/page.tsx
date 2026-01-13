'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { ArrowLeft, CheckCircle } from 'lucide-react';

function RegistroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const email = searchParams.get('email') || '';
  const transactionId = searchParams.get('txn') || '';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/portal');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = () => {
    router.push('/portal');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-blue-600">
                Factura Mis Gastos
              </h1>
            </Link>
          </div>

          {/* Success banner if coming from payment */}
          {transactionId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">
                  ¡Pago completado con éxito!
                </p>
                <p className="text-green-700 text-sm">
                  Crea tu cuenta para comenzar a usar el servicio.
                </p>
              </div>
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Crea tu cuenta
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Solo toma unos segundos comenzar
            </p>

            {/* Google Sign In */}
            <GoogleSignInButton onSuccess={handleSuccess} className="mb-6" />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  o usa tu email
                </span>
              </div>
            </div>

            {/* Magic Link Form with pre-filled email */}
            <MagicLinkForm defaultEmail={email} onSuccess={() => {}} />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <RegistroContent />
    </Suspense>
  );
}
