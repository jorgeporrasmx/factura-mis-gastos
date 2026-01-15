'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Building2, User, Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { extractDomainFromEmail, isPublicEmailDomain } from '@/types/company';

type AccountType = 'empresa' | 'empleado' | null;

interface CompanyCheckResult {
  checking: boolean;
  found: boolean;
  companyName?: string;
  isPublicEmail: boolean;
  domain?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<AccountType>(null);
  const [companyCheck, setCompanyCheck] = useState<CompanyCheckResult>({
    checking: false,
    found: false,
    isPublicEmail: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar empresa por dominio cuando el usuario selecciona "empleado"
  useEffect(() => {
    if (selectedType === 'empleado' && user?.email) {
      checkCompanyByEmail(user.email);
    }
  }, [selectedType, user?.email]);

  async function checkCompanyByEmail(email: string) {
    setCompanyCheck({ checking: true, found: false, isPublicEmail: false });

    try {
      const domain = extractDomainFromEmail(email);

      if (isPublicEmailDomain(domain)) {
        setCompanyCheck({
          checking: false,
          found: false,
          isPublicEmail: true,
          domain,
        });
        return;
      }

      const response = await fetch(`/api/companies/join?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success && data.companyFound) {
        setCompanyCheck({
          checking: false,
          found: true,
          companyName: data.company.name,
          isPublicEmail: false,
          domain,
        });
      } else {
        setCompanyCheck({
          checking: false,
          found: false,
          isPublicEmail: false,
          domain,
        });
      }
    } catch {
      setCompanyCheck({
        checking: false,
        found: false,
        isPublicEmail: false,
      });
    }
  }

  async function handleJoinCompany() {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/companies/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirigir al portal
        router.push('/portal');
      } else {
        setError(data.error || 'Error al unirse a la empresa');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido a Factura Mis Gastos
          </h1>
          <p className="text-gray-600">
            {user?.displayName && `Hola ${user.displayName.split(' ')[0]}, `}
            ¿cómo deseas usar la plataforma?
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Empresa */}
          <button
            onClick={() => setSelectedType('empresa')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              selectedType === 'empresa'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedType === 'empresa' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Soy una empresa</h3>
                <p className="text-sm text-gray-500">Administrador</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Registra tu empresa y administra los gastos de tu equipo. Podrás invitar empleados
              y ver reportes consolidados.
            </p>
          </button>

          {/* Empleado */}
          <button
            onClick={() => setSelectedType('empleado')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              selectedType === 'empleado'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedType === 'empleado' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Soy empleado</h3>
                <p className="text-sm text-gray-500">Usuario</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Únete a tu empresa usando tu email corporativo. Podrás subir recibos y ver tus
              propios gastos.
            </p>
          </button>
        </div>

        {/* Estado de verificación para empleados */}
        {selectedType === 'empleado' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Verificando tu empresa...</h3>

            {companyCheck.checking ? (
              <div className="flex items-center gap-3 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Buscando empresa para {user?.email}...</span>
              </div>
            ) : companyCheck.isPublicEmail ? (
              <div className="flex items-start gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email público detectado</p>
                  <p className="text-sm mt-1">
                    Estás usando un email público ({companyCheck.domain}). Para unirte a una
                    empresa, necesitas usar tu email corporativo.
                  </p>
                </div>
              </div>
            ) : companyCheck.found ? (
              <div className="flex items-start gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Empresa encontrada: {companyCheck.companyName}</p>
                  <p className="text-sm mt-1">
                    Tu email @{companyCheck.domain} está asociado a esta empresa. Puedes unirte
                    automáticamente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Empresa no encontrada</p>
                  <p className="text-sm mt-1">
                    No hay ninguna empresa registrada con el dominio @{companyCheck.domain}. Tu
                    empresa debe registrarse primero.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          {selectedType === 'empresa' && (
            <Button
              size="lg"
              onClick={() => router.push('/auth/onboarding/empresa')}
              className="min-w-[200px]"
            >
              Registrar mi empresa
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {selectedType === 'empleado' && companyCheck.found && (
            <Button
              size="lg"
              onClick={handleJoinCompany}
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uniéndose...
                </>
              ) : (
                <>
                  Unirme a {companyCheck.companyName}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
