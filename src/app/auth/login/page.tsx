'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PhoneAuthForm } from '@/components/auth/PhoneAuthForm';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, error } = useAuth();
  const [activeTab, setActiveTab] = useState('sms');

  const redirectTo = searchParams.get('redirect') || '/portal';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  const handleSuccess = () => {
    router.push(redirectTo);
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

          {/* Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Iniciar sesión
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Accede a tu portal para gestionar tus recibos
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Google Sign In */}
            <GoogleSignInButton onSuccess={handleSuccess} className="mb-6" />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Tabs for other auth methods */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="password">Contraseña</TabsTrigger>
                <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              </TabsList>

              <TabsContent value="sms">
                <PhoneAuthForm onSuccess={handleSuccess} />
              </TabsContent>

              <TabsContent value="password">
                <EmailPasswordForm mode="login" onSuccess={handleSuccess} />
              </TabsContent>

              <TabsContent value="magic-link">
                <MagicLinkForm onSuccess={() => {}} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link
              href="/comenzar"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Comienza aquí
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
