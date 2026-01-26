'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, MessageCircle, Calendar, X, HelpCircle } from 'lucide-react';

// Tipos de formulario
export type FormType = 'express' | 'standard' | 'corporate' | 'callback';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: FormType;
  onSuccess?: () => void;
  redirectTo?: string;
}

interface FormData {
  nombre: string;
  whatsapp: string;
  email: string;
  empresa: string;
  cargo: string;
  recibos_mes: string;
  empleados: string;
  integraciones: string[];
  notas: string;
  cuando_llamar: string;
}

const WHATSAPP_NUMBER = '5216144273301';
const CALENDLY_URL = 'https://calendly.com/facturamisgastos/asesoria';

const initialFormData: FormData = {
  nombre: '',
  whatsapp: '',
  email: '',
  empresa: '',
  cargo: '',
  recibos_mes: '',
  empleados: '',
  integraciones: [],
  notas: '',
  cuando_llamar: '',
};

const formConfig = {
  express: {
    title: 'Comienza ahora',
    description: 'Ingresa tus datos para comenzar a usar Factura Mis Gastos',
    fields: ['nombre', 'whatsapp', 'email'] as const,
    submitText: 'Continuar',
    successTitle: '¡Registro exitoso!',
    successMessage: 'Te hemos registrado. Continúa para seleccionar tu plan.',
  },
  standard: {
    title: 'Habla con un asesor',
    description: 'Déjanos tus datos y te contactamos en menos de 5 minutos',
    fields: ['nombre', 'whatsapp', 'email', 'empresa', 'recibos_mes'] as const,
    submitText: 'Solicitar asesoría',
    successTitle: '¡Gracias por contactarnos!',
    successMessage: 'Un asesor te contactará en menos de 5 minutos en horario laboral.',
  },
  corporate: {
    title: 'Solicitar cotización Enterprise',
    description: 'Cuéntanos sobre tu empresa y te preparamos una propuesta personalizada',
    fields: ['nombre', 'cargo', 'whatsapp', 'email', 'empresa', 'empleados', 'recibos_mes', 'integraciones', 'notas'] as const,
    submitText: 'Solicitar cotización',
    successTitle: '¡Solicitud recibida!',
    successMessage: 'Nuestro equipo Enterprise te contactará en las próximas 24 horas.',
  },
  callback: {
    title: 'Te llamamos',
    description: '¿Cuándo te gustaría que te contactemos?',
    fields: ['nombre', 'whatsapp', 'cuando_llamar'] as const,
    submitText: 'Solicitar llamada',
    successTitle: '¡Listo!',
    successMessage: 'Te llamaremos en el horario solicitado.',
  },
};

const fieldLabels: Record<string, string> = {
  nombre: 'Nombre completo',
  whatsapp: 'WhatsApp',
  email: 'Correo electrónico',
  empresa: 'Empresa',
  cargo: 'Cargo',
  recibos_mes: 'Recibos mensuales aproximados',
  empleados: 'Número de empleados',
  integraciones: 'Integraciones requeridas',
  notas: 'Comentarios adicionales',
  cuando_llamar: '¿Cuándo te llamamos?',
};

const recibosOptions = ['1-50', '51-150', '151-300', '300+'];
const empleadosOptions = ['1-10', '11-50', '51-200', '201-500', '500+'];
const integracionesOptions = ['SAP B1', 'Aspel', 'Contalink', 'Odoo', 'Bind ERP', 'Google Sheets', 'Otra'];
const cuandoOptions = ['Ahora', 'En 1 hora', 'Mañana por la mañana', 'Mañana por la tarde'];

export function LeadFormModal({ isOpen, onClose, formType, onSuccess, redirectTo }: LeadFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadName, setLeadName] = useState('');

  const config = formConfig[formType];

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleIntegracionToggle = (integracion: string) => {
    setFormData(prev => ({
      ...prev,
      integraciones: prev.integraciones.includes(integracion)
        ? prev.integraciones.filter(i => i !== integracion)
        : [...prev.integraciones, integracion],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          data: formData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al enviar el formulario');
      }

      setLeadName(formData.nombre.split(' ')[0]);
      setIsSuccess(true);
      onSuccess?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hola, soy ${leadName}. Me interesa Factura Mis Gastos.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleCalendly = () => {
    window.open(CALENDLY_URL, '_blank');
  };

  const handleContinue = () => {
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      handleClose();
    }
  };

  const renderField = (field: string) => {
    const baseInputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-gray-900 placeholder:text-gray-400";

    switch (field) {
      case 'nombre':
      case 'empresa':
      case 'cargo':
        return (
          <input
            type="text"
            value={formData[field as keyof FormData] as string}
            onChange={(e) => handleInputChange(field as keyof FormData, e.target.value)}
            placeholder={fieldLabels[field]}
            required={field === 'nombre' || (formType === 'corporate' && (field === 'empresa' || field === 'cargo'))}
            className={baseInputClass}
          />
        );

      case 'whatsapp':
        return (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">+52</span>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10 dígitos"
              required
              className={`${baseInputClass} pl-14`}
            />
          </div>
        );

      case 'email':
        return (
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="correo@empresa.com"
            required
            className={baseInputClass}
          />
        );

      case 'recibos_mes':
        return (
          <select
            value={formData.recibos_mes}
            onChange={(e) => handleInputChange('recibos_mes', e.target.value)}
            className={`${baseInputClass} bg-white`}
          >
            <option value="">Selecciona una opción</option>
            {recibosOptions.map(opt => (
              <option key={opt} value={opt}>{opt} recibos/mes</option>
            ))}
          </select>
        );

      case 'empleados':
        return (
          <select
            value={formData.empleados}
            onChange={(e) => handleInputChange('empleados', e.target.value)}
            required={formType === 'corporate'}
            className={`${baseInputClass} bg-white`}
          >
            <option value="">Selecciona una opción</option>
            {empleadosOptions.map(opt => (
              <option key={opt} value={opt}>{opt} empleados</option>
            ))}
          </select>
        );

      case 'integraciones':
        return (
          <div className="flex flex-wrap gap-2">
            {integracionesOptions.map(integracion => (
              <button
                key={integracion}
                type="button"
                onClick={() => handleIntegracionToggle(integracion)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  formData.integraciones.includes(integracion)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {integracion}
              </button>
            ))}
          </div>
        );

      case 'notas':
        return (
          <textarea
            value={formData.notas}
            onChange={(e) => handleInputChange('notas', e.target.value)}
            placeholder="¿Algo que debamos saber?"
            rows={3}
            className={`${baseInputClass} resize-none`}
          />
        );

      case 'cuando_llamar':
        return (
          <div className="grid grid-cols-2 gap-2">
            {cuandoOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleInputChange('cuando_llamar', option)}
                className={`px-4 py-3 rounded-lg text-sm border transition-all ${
                  formData.cuando_llamar === option
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Vista de éxito
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <DialogTitle className="text-xl mb-2">
              {leadName ? `¡Gracias, ${leadName}!` : config.successTitle}
            </DialogTitle>

            <DialogDescription className="text-base mb-6">
              {config.successMessage}
            </DialogDescription>

            <div className="space-y-3">
              {formType === 'express' ? (
                <Button
                  onClick={handleContinue}
                  className="w-full gradient-bg hover:opacity-90 h-12 text-base"
                >
                  Continuar al registro
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Escríbenos por WhatsApp
                  </Button>

                  <button
                    onClick={handleCalendly}
                    className="w-full text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-2 py-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Prefiero agendar una llamada
                  </button>
                </>
              )}

              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Vista del formulario
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {config.fields.map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {fieldLabels[field]}
                {(field === 'nombre' || field === 'whatsapp' || field === 'email' ||
                  (formType === 'corporate' && (field === 'empresa' || field === 'cargo' || field === 'empleados'))) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              {renderField(field)}
            </div>
          ))}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-bg hover:opacity-90 h-12 text-base mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              config.submitText
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Al continuar, aceptas nuestros{' '}
            <a href="/terminos" className="text-blue-600 hover:underline">términos</a>
            {' '}y{' '}
            <a href="/privacidad" className="text-blue-600 hover:underline">política de privacidad</a>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href="/#preguntas-frecuentes"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              ¿Necesitas ayuda? Consulta nuestras preguntas frecuentes
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
