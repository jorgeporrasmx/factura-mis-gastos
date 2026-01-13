'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isMagicLink } from '@/lib/firebase/auth';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyMagicLink, isAuthenticated } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'email-needed' | 'success' | 'error'>(
    'verifying'
  );
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  // Check if this is a magic link and verify
  useEffect(() => {
    const url = window.location.href;

    if (!isMagicLink(url)) {
      setStatus('error');
      setError('Este enlace no es válido o ha expirado.');
      return;
    }

    // Check if we have the email stored
    const storedEmail = window.localStorage.getItem('emailForSignIn');

    if (!storedEmail) {
      // Need to ask for email
      setStatus('email-needed');
      return;
    }

    // Verify the magic link
    verifyMagicLink(url).then((result) => {
      if (result.success) {
        setStatus('success');
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/portal');
        }, 2000);
      } else {
        setStatus('error');
        setError(result.error?.message || 'Error al verificar el enlace');
      }
    });
  }, [verifyMagicLink, router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && status !== 'success') {
      router.push('/portal');
    }
  }, [isAuthenticated, status, router]);

  // Handle email submission when needed
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setStatus('verifying');
    setError(null);

    const url = window.location.href;
    const result = await verifyMagicLink(url);

    if (result.success) {
      setStatus('success');
      setTimeout(() => {
        router.push('/portal');
      }, 2000);
    } else {
      setStatus('error');
      setError(result.error?.message || 'Error al verificar el enlace');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
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
          {/* Verifying */}
          {status === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Verificando tu enlace...
              </h2>
              <p className="text-gray-600">
                Por favor espera un momento.
              </p>
            </div>
          )}

          {/* Email needed */}
          {status === 'email-needed' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirma tu email
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Por seguridad, ingresa el email con el que solicitaste el enlace.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Verificar
                </Button>
              </form>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Verificación exitosa!
              </h2>
              <p className="text-gray-600 mb-4">
                Redirigiendo a tu portal...
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Error de verificación
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'El enlace no es válido o ha expirado.'}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Solicitar nuevo enlace
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
