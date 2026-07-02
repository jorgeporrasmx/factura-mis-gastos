'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders } from '@/lib/api-client';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { EmployeeFAQ } from '@/components/employee/EmployeeFAQ';
import { EmployeeGuide } from '@/components/employee/EmployeeGuide';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Phone,
  BookOpen,
  HelpCircle,
  UserPlus,
} from 'lucide-react';

type ActiveTab = 'registro' | 'guia' | 'faq';

interface CompanyInfo {
  id: string;
  name: string;
}

export default function UnirseByCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('registro');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyNotFound, setCompanyNotFound] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Fetch company info by invite code
  useEffect(() => {
    async function fetchCompany() {
      try {
        const response = await fetch(`/api/companies/join-by-invite?code=${encodeURIComponent(code)}`);
        const data = await response.json();

        if (data.success && data.companyFound) {
          setCompanyInfo(data.company);
        } else {
          setCompanyNotFound(true);
        }
      } catch {
        setCompanyNotFound(true);
      } finally {
        setCompanyLoading(false);
      }
    }

    fetchCompany();
  }, [code]);

  const validatePhone = (phone: string): boolean => {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    // Accept 10 digit Mexican numbers, with or without +52 prefix
    if (/^\+52\d{10}$/.test(cleaned)) return true;
    if (/^\d{10}$/.test(cleaned)) return true;
    return false;
  };

  const formatPhoneForStorage = (phone: string): string => {
    const cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.startsWith('+52')) return cleaned;
    return `+52${cleaned}`;
  };

  const handleJoinCompany = useCallback(async () => {
    if (!user || !companyInfo) return;

    // Validate phone
    if (!whatsappPhone.trim()) {
      setPhoneError('Ingresa tu número de WhatsApp');
      return;
    }
    if (!validatePhone(whatsappPhone)) {
      setPhoneError('Ingresa un número válido de 10 dígitos');
      return;
    }

    setPhoneError(null);
    setJoinError(null);
    setIsJoining(true);

    try {
      const response = await fetch('/api/companies/join-by-invite', {
        method: 'POST',
        headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          whatsappPhone: formatPhoneForStorage(whatsappPhone),
          inviteCode: code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setJoinSuccess(true);
        setTimeout(() => {
          router.push('/portal?onboarding=completed');
        }, 2000);
      } else {
        setJoinError(data.error || 'Error al unirse a la empresa');
      }
    } catch {
      setJoinError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsJoining(false);
    }
  }, [user, companyInfo, whatsappPhone, code, router]);

  // Loading state
  if (companyLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500">Cargando información...</p>
        </div>
      </div>
    );
  }

  // Company not found
  if (companyNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace no válido</h1>
            <p className="text-gray-600 mb-6">
              No encontramos una empresa con este enlace de invitación. Verifica que el enlace sea correcto o contacta a tu administrador.
            </p>
            <Link href="/">
              <Button variant="outline">Ir al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (joinSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Te has unido a {companyInfo?.name}
            </h1>
            <p className="text-gray-600 mb-4">
              Tu perfil está listo. Redirigiendo al portal...
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'registro', label: 'Registro', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'guia', label: 'Guía', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'faq', label: 'Preguntas', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-blue-600">
            Factura Mis Gastos
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Company welcome banner */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {companyInfo?.name}
          </h1>
          <p className="text-gray-600 text-sm">
            Te invita a unirte a Factura Mis Gastos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'registro' && (
          <div className="space-y-6">
            {!isAuthenticated ? (
              <>
                {/* Auth options */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 text-center">
                    Crea tu cuenta
                  </h2>

                  <GoogleSignInButton
                    onSuccess={() => {}}
                  />

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-gray-400">o con correo</span>
                    </div>
                  </div>

                  <EmailPasswordForm mode="register" />
                </div>

                <p className="text-center text-sm text-gray-500">
                  ¿Ya tienes cuenta?{' '}
                  <Link href={`/auth/login?redirect=/unirse/${code}`} className="text-blue-600 hover:text-blue-700 font-medium">
                    Inicia sesión
                  </Link>
                </p>
              </>
            ) : (
              <>
                {/* Authenticated - show WhatsApp form */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.displayName || user?.email}
                      </p>
                      <p className="text-sm text-gray-500">Sesión iniciada</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Número de WhatsApp
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Este número se usará para que puedas enviar tus recibos por WhatsApp.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-600 border border-gray-200">
                        <Phone className="w-4 h-4" />
                        +52
                      </div>
                      <input
                        id="whatsapp"
                        type="tel"
                        placeholder="10 dígitos (ej: 6141234567)"
                        value={whatsappPhone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setWhatsappPhone(e.target.value);
                          setPhoneError(null);
                        }}
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={10}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-sm text-red-600 mt-1.5">{phoneError}</p>
                    )}
                  </div>

                  {joinError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {joinError}
                    </div>
                  )}

                  <Button
                    onClick={handleJoinCompany}
                    disabled={isJoining}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uniéndose...
                      </>
                    ) : (
                      <>
                        Unirme a {companyInfo?.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'guia' && <EmployeeGuide />}
        {activeTab === 'faq' && <EmployeeFAQ />}
      </main>
    </div>
  );
}
