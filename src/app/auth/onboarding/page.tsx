'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, User, UserCircle, Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { extractDomainFromEmail } from '@/types/company';

type AccountType = 'empresa' | 'empleado' | 'personal' | null;

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
  const [personalEmail, setPersonalEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentEmail = user?.email?.trim() || '';
  const personalAccountEmail = (currentEmail || personalEmail).trim().toLowerCase();
  const needsPersonalEmail = selectedType === 'personal' && !currentEmail;
  const isPersonalEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalAccountEmail);

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
        // Redirigir al portal con parámetro para forzar recarga del contexto
        router.push('/portal?onboarding=completed');
      } else {
        setError(data.error || 'Error al unirse a la empresa');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePersonalAccount() {
    if (!user) return;

    if (!personalAccountEmail || !isPersonalEmailValid) {
      setError('Ingresa un email válido para crear tu cuenta personal.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/users/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: personalAccountEmail,
          displayName: user.displayName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/portal?onboarding=completed');
      } else {
        setError(data.error || 'Error al crear cuenta personal');
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
        <div className="grid md:grid-cols-3 gap-4 mb-8">
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
                <p className="text-sm text-gray-500">Usuario corporativo</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Únete a tu empresa usando tu email corporativo. Podrás subir recibos y ver tus
              propios gastos.
            </p>
          </button>

          {/* Uso Personal */}
          <button
            onClick={() => setSelectedType('personal')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              selectedType === 'personal'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedType === 'personal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <UserCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Uso personal</h3>
                <p className="text-sm text-gray-500">Individual</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Organiza tus gastos personales sin necesidad de una empresa. Ideal para
              freelancers y profesionistas independientes.
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
              <div className="flex items-start gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">No hay empresa registrada</p>
                  <p className="text-sm mt-1">
                    No encontramos una empresa con el dominio @{companyCheck.domain}.
                    Si eres el administrador, puedes <button
                      onClick={() => setSelectedType('empresa')}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      registrar tu empresa
                    </button>, o selecciona <button
                      onClick={() => setSelectedType('personal')}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      uso personal
                    </button>.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>
            )}
          </div>
        )}

        {/* Confirmación para uso personal */}
        {selectedType === 'personal' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-3 text-blue-600 bg-blue-50 p-4 rounded-lg">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Cuenta personal</p>
                <p className="text-sm mt-1 text-gray-600">
                  Podrás subir tus recibos y organizar tus gastos personales. En cualquier momento
                  puedes crear o unirte a una empresa desde la configuración.
                </p>
              </div>
            </div>

            {needsPersonalEmail && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="personal-email">Email para tu cuenta</Label>
                <Input
                  id="personal-email"
                  type="email"
                  value={personalEmail}
                  onChange={(event) => setPersonalEmail(event.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Lo necesitamos para guardar tu perfil y enviarte notificaciones de tus recibos.
                </p>
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

          {selectedType === 'personal' && (
            <Button
              size="lg"
              onClick={handlePersonalAccount}
              disabled={isSubmitting || (needsPersonalEmail && !isPersonalEmailValid)}
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Continuar como personal
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
