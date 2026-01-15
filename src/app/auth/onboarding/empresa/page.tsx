'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Building2, Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { extractDomainFromEmail, isPublicEmailDomain } from '@/types/company';

interface FormData {
  companyName: string;
  rfc: string;
}

interface FormErrors {
  companyName?: string;
  rfc?: string;
  general?: string;
}

export default function CreateCompanyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    rfc: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [detectedDomain, setDetectedDomain] = useState<string>('');

  // Detectar dominio del email
  useEffect(() => {
    if (user?.email) {
      try {
        const domain = extractDomainFromEmail(user.email);
        setDetectedDomain(domain);

        if (isPublicEmailDomain(domain)) {
          setErrors({
            general:
              'Estás usando un email público. Para crear una empresa necesitas un email corporativo.',
          });
        }
      } catch {
        setErrors({ general: 'Email inválido' });
      }
    }
  }, [user?.email]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'El nombre de la empresa es requerido';
    } else if (formData.companyName.length < 2) {
      newErrors.companyName = 'El nombre debe tener al menos 2 caracteres';
    }

    // RFC es opcional pero si se proporciona, validar formato básico
    if (formData.rfc && !/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/i.test(formData.rfc)) {
      newErrors.rfc = 'Formato de RFC inválido';
    }

    if (isPublicEmailDomain(detectedDomain)) {
      newErrors.general = 'No puedes crear una empresa con un email público';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.companyName.trim(),
          rfc: formData.rfc.toUpperCase().trim() || undefined,
          adminUid: user.uid,
          adminEmail: user.email,
          adminName: user.displayName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        // Esperar un momento para mostrar el mensaje de éxito
        setTimeout(() => {
          router.push('/portal');
        }, 2000);
      } else {
        setErrors({ general: data.error || 'Error al crear la empresa' });
      }
    } catch {
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa creada exitosamente</h1>
          <p className="text-gray-600 mb-4">
            Tu empresa ha sido registrada y tu carpeta de Google Drive está lista.
          </p>
          <p className="text-sm text-gray-500">Redirigiendo al portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={() => router.push('/auth/onboarding')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registra tu empresa</h1>
          <p className="text-gray-600">
            Los empleados con email @{detectedDomain} podrán unirse automáticamente.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Error general */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          {/* Nombre de empresa */}
          <div className="mb-4">
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la empresa *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Ej: Acme Corp"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* RFC */}
          <div className="mb-4">
            <label htmlFor="rfc" className="block text-sm font-medium text-gray-700 mb-1">
              RFC (opcional)
            </label>
            <input
              type="text"
              id="rfc"
              name="rfc"
              value={formData.rfc}
              onChange={handleInputChange}
              placeholder="Ej: ABC123456XYZ"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition uppercase ${
                errors.rfc ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.rfc && <p className="mt-1 text-sm text-red-500">{errors.rfc}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Puedes agregarlo después si no lo tienes a la mano.
            </p>
          </div>

          {/* Dominio detectado */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Dominio de tu empresa:</span> @{detectedDomain}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Los empleados con este dominio de email podrán unirse automáticamente.
            </p>
          </div>

          {/* Admin info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Administrador:</span> {user?.displayName || user?.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Serás el administrador de esta empresa y podrás invitar empleados.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || isPublicEmailDomain(detectedDomain)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando empresa...
              </>
            ) : (
              <>
                Crear empresa
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Al crear tu empresa, se generará una carpeta en Google Drive donde se almacenarán los
          documentos y recibos de tu equipo.
        </p>
      </div>
    </div>
  );
}
