'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import {
  CardInput,
  CardBrand,
  detectCardBrand,
  validateCardNumber,
  validateExpiry,
  validateCVV,
} from '@/types/payments';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  submitButtonText?: string;
}

export interface PaymentFormData {
  card: CardInput;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
}

interface FormErrors {
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
  holderName?: string;
  email?: string;
  name?: string;
  phone?: string;
}

export function PaymentForm({
  onSubmit,
  isLoading = false,
  error,
  submitButtonText = 'Pagar ahora',
}: PaymentFormProps) {
  // Estado del formulario
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown');

  // Formatear número de tarjeta
  const formatCardNumber = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, '');
    const brand = detectCardBrand(digits);
    setCardBrand(brand);

    // AMEX: 4-6-5, Otros: 4-4-4-4
    if (brand === 'amex') {
      return digits.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, p1, p2, p3) => {
        let result = p1;
        if (p2) result += ' ' + p2;
        if (p3) result += ' ' + p3;
        return result;
      }).trim();
    }

    return digits.replace(/(\d{4})/g, '$1 ').trim();
  }, []);

  // Handlers de cambio
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
      setErrors(prev => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleExpMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setExpMonth(value);
    setErrors(prev => ({ ...prev, expMonth: undefined }));
  };

  const handleExpYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setExpYear(value);
    setErrors(prev => ({ ...prev, expYear: undefined }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxLength = cardBrand === 'amex' ? 4 : 3;
    const value = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setCvv(value);
    setErrors(prev => ({ ...prev, cvv: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    setErrors(prev => ({ ...prev, phone: undefined }));
  };

  // Validación
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar tarjeta
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || !validateCardNumber(cleanCardNumber)) {
      newErrors.cardNumber = 'Numero de tarjeta invalido';
    }

    if (!expMonth || !expYear || !validateExpiry(expMonth, expYear)) {
      newErrors.expMonth = 'Fecha invalida';
    }

    if (!cvv || !validateCVV(cvv, cardBrand)) {
      newErrors.cvv = 'CVV invalido';
    }

    if (!holderName || holderName.trim().length < 2) {
      newErrors.holderName = 'Nombre del titular requerido';
    }

    // Validar datos del cliente
    if (!name || name.trim().length < 2) {
      newErrors.name = 'Nombre requerido';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalido';
    }

    if (phone && phone.length < 10) {
      newErrors.phone = 'Telefono debe tener 10 digitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data: PaymentFormData = {
      card: {
        number: cardNumber.replace(/\s/g, ''),
        expMonth,
        expYear,
        cvv,
        holderName,
      },
      customer: {
        name,
        email,
        phone: phone || undefined,
        company: company || undefined,
      },
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error global */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Datos del cliente */}
      <Card>
        <CardHeader className="pb-4">
          <h3 className="text-lg font-semibold">Datos de contacto</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" error={!!errors.name}>
                Nombre completo *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Perez"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors(prev => ({ ...prev, name: undefined }));
                }}
                error={!!errors.name}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" error={!!errors.email}>
                Correo electronico *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@empresa.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                error={!!errors.email}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="6141234567"
                value={phone}
                onChange={handlePhoneChange}
                error={!!errors.phone}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa (opcional)</Label>
              <Input
                id="company"
                type="text"
                placeholder="Mi Empresa S.A. de C.V."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datos de la tarjeta */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Datos de pago
            </h3>
            <div className="flex items-center gap-2">
              <CardBrandIcon brand={cardBrand} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Numero de tarjeta */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber" error={!!errors.cardNumber}>
              Numero de tarjeta *
            </Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                error={!!errors.cardNumber}
                disabled={isLoading}
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            {errors.cardNumber && (
              <p className="text-xs text-red-500">{errors.cardNumber}</p>
            )}
          </div>

          {/* Nombre del titular */}
          <div className="space-y-2">
            <Label htmlFor="holderName" error={!!errors.holderName}>
              Nombre en la tarjeta *
            </Label>
            <Input
              id="holderName"
              type="text"
              placeholder="JUAN PEREZ"
              value={holderName}
              onChange={(e) => {
                setHolderName(e.target.value.toUpperCase());
                setErrors(prev => ({ ...prev, holderName: undefined }));
              }}
              error={!!errors.holderName}
              disabled={isLoading}
              className="uppercase"
            />
            {errors.holderName && (
              <p className="text-xs text-red-500">{errors.holderName}</p>
            )}
          </div>

          {/* Fecha de expiracion y CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expMonth" error={!!errors.expMonth}>
                Mes *
              </Label>
              <Input
                id="expMonth"
                type="text"
                inputMode="numeric"
                placeholder="MM"
                value={expMonth}
                onChange={handleExpMonthChange}
                error={!!errors.expMonth}
                disabled={isLoading}
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expYear" error={!!errors.expMonth}>
                Anio *
              </Label>
              <Input
                id="expYear"
                type="text"
                inputMode="numeric"
                placeholder="AA"
                value={expYear}
                onChange={handleExpYearChange}
                error={!!errors.expMonth}
                disabled={isLoading}
                maxLength={2}
              />
              {errors.expMonth && (
                <p className="text-xs text-red-500">{errors.expMonth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv" error={!!errors.cvv}>
                CVV *
              </Label>
              <Input
                id="cvv"
                type="text"
                inputMode="numeric"
                placeholder={cardBrand === 'amex' ? '1234' : '123'}
                value={cvv}
                onChange={handleCvvChange}
                error={!!errors.cvv}
                disabled={isLoading}
                maxLength={cardBrand === 'amex' ? 4 : 3}
              />
              {errors.cvv && (
                <p className="text-xs text-red-500">{errors.cvv}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boton de envio */}
      <Button
        type="submit"
        className="w-full gradient-bg hover:opacity-90 h-12 text-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner />
            Procesando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {submitButtonText}
          </span>
        )}
      </Button>

      {/* Mensaje de seguridad */}
      <p className="text-xs text-center text-muted-foreground">
        <Lock className="w-3 h-3 inline mr-1" />
        Tus datos estan protegidos con encriptacion SSL de 256 bits.
        Procesado de forma segura por First Data.
      </p>
    </form>
  );
}

// Componente de icono de marca de tarjeta
function CardBrandIcon({ brand }: { brand: CardBrand }) {
  const iconClass = "h-8 w-auto";

  switch (brand) {
    case 'visa':
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="4" fill="#1A1F71" />
          <path d="M19.5 31L21.5 17H25L23 31H19.5Z" fill="white" />
          <path d="M32.5 17.3C31.7 17 30.5 16.7 29 16.7C25.5 16.7 23 18.5 23 21.1C23 23 24.7 24 26 24.7C27.3 25.4 27.8 25.9 27.8 26.5C27.8 27.4 26.7 27.9 25.6 27.9C24.1 27.9 23.3 27.7 22 27.1L21.5 26.9L21 30C22 30.4 23.7 30.8 25.5 30.8C29.2 30.8 31.6 29 31.6 26.2C31.6 24.7 30.7 23.5 28.7 22.5C27.5 21.9 26.8 21.5 26.8 20.8C26.8 20.2 27.5 19.6 28.9 19.6C30.1 19.6 31 19.8 31.7 20.1L32 20.2L32.5 17.3Z" fill="white" />
          <path d="M37.5 17H35C34.2 17 33.6 17.2 33.3 18L28 31H31.7L32.4 29H37L37.4 31H40.5L37.5 17ZM33.3 26.3C33.6 25.5 35 21.7 35 21.7C35 21.7 35.3 20.8 35.5 20.3L35.7 21.6C35.7 21.6 36.5 25.2 36.7 26.3H33.3Z" fill="white" />
          <path d="M16.5 17L13 26.5L12.6 24.7C12 22.7 10.2 20.5 8 19.4L11.3 31H15L20.5 17H16.5Z" fill="white" />
          <path d="M10.5 17H5L5 17.3C9.5 18.3 12.5 21 13.5 24.3L12.4 18C12.2 17.2 11.6 17 10.5 17Z" fill="#F9A533" />
        </svg>
      );
    case 'mastercard':
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="4" fill="#000" />
          <circle cx="18" cy="24" r="10" fill="#EB001B" />
          <circle cx="30" cy="24" r="10" fill="#F79E1B" />
          <path d="M24 16.5C26.4 18.3 28 21 28 24C28 27 26.4 29.7 24 31.5C21.6 29.7 20 27 20 24C20 21 21.6 18.3 24 16.5Z" fill="#FF5F00" />
        </svg>
      );
    case 'amex':
      return (
        <svg className={iconClass} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="4" fill="#006FCF" />
          <path d="M5 24L8 18H12L15 24L18 18H22L17 28H13L10 22L7 28H3L5 24Z" fill="white" />
          <path d="M23 18H32V21H26V22H32V25H26V26H32V28H23V18Z" fill="white" />
          <path d="M33 28L38 23L33 18H39L42 21L45 18H48L43 23L48 28H42L39 25L36 28H33Z" fill="white" />
        </svg>
      );
    default:
      return (
        <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-gray-400" />
        </div>
      );
  }
}

// Componente de spinner de carga
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
