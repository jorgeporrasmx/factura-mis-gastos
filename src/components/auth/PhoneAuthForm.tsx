'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setupRecaptcha, sendPhoneVerification, verifyPhoneCode } from '@/lib/firebase/auth';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import type { RecaptchaVerifier } from 'firebase/auth';

interface PhoneAuthFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type Step = 'phone' | 'code' | 'success';

export function PhoneAuthForm({ onSuccess, onError }: PhoneAuthFormProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Setup reCAPTCHA on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (recaptchaContainerRef.current && !recaptchaRef.current) {
        recaptchaRef.current = setupRecaptcha('recaptcha-container-phone');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup reCAPTCHA
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        recaptchaRef.current = null;
      }
    };
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone for display
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digits);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phoneNumber.length !== 10) {
      setError('Ingresa un número de 10 dígitos');
      return;
    }

    if (!recaptchaRef.current) {
      // Try to setup recaptcha again
      recaptchaRef.current = setupRecaptcha('recaptcha-container-phone');
      if (!recaptchaRef.current) {
        setError('Error de verificación. Recarga la página e intenta de nuevo.');
        return;
      }
    }

    setIsLoading(true);

    const result = await sendPhoneVerification(phoneNumber, recaptchaRef.current);

    setIsLoading(false);

    if (result.success) {
      setStep('code');
      setCountdown(60);
    } else {
      setError(result.error?.message || 'Error al enviar código');
      onError?.(result.error?.message || 'Error al enviar código');

      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear();
        } catch (e) {
          // Ignore
        }
        recaptchaRef.current = setupRecaptcha('recaptcha-container-phone');
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsLoading(true);

    const result = await verifyPhoneCode(code);

    setIsLoading(false);

    if (result.success) {
      setStep('success');
      onSuccess?.();
    } else {
      setError(result.error?.message || 'Código incorrecto');
      onError?.(result.error?.message || 'Código incorrecto');
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || !recaptchaRef.current) return;

    setIsLoading(true);
    setError(null);

    // Reset reCAPTCHA before resending
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.clear();
      } catch (e) {
        // Ignore
      }
      recaptchaRef.current = setupRecaptcha('recaptcha-container-phone');
    }

    if (!recaptchaRef.current) {
      setError('Error de verificación. Recarga la página.');
      setIsLoading(false);
      return;
    }

    const result = await sendPhoneVerification(phoneNumber, recaptchaRef.current);

    setIsLoading(false);

    if (result.success) {
      setCountdown(60);
    } else {
      setError(result.error?.message || 'Error al reenviar código');
    }
  };

  // Step 1: Phone number input
  if (step === 'phone') {
    return (
      <form onSubmit={handleSendCode} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Número de celular</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              +52
            </span>
            <Input
              id="phone"
              type="tel"
              placeholder="55 1234 5678"
              value={formatPhoneDisplay(phoneNumber)}
              onChange={handlePhoneChange}
              className="pl-12"
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <Button type="submit" disabled={isLoading || phoneNumber.length !== 10} className="w-full">
          {isLoading ? 'Enviando...' : 'Enviar código SMS'}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Te enviaremos un código de 6 dígitos por SMS.
        </p>

        {/* reCAPTCHA container (invisible) */}
        <div id="recaptcha-container-phone" ref={recaptchaContainerRef} />
      </form>
    );
  }

  // Step 2: Code verification
  if (step === 'code') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setStep('phone');
            setCode('');
            setError(null);
          }}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Cambiar número
        </button>

        <div className="text-center py-2">
          <p className="text-gray-600">
            Enviamos un código a{' '}
            <span className="font-medium">+52 {formatPhoneDisplay(phoneNumber)}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              disabled={isLoading}
              autoComplete="one-time-code"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <Button type="submit" disabled={isLoading || code.length !== 6} className="w-full">
            {isLoading ? 'Verificando...' : 'Verificar'}
          </Button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Reenviar código en {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                Reenviar código
              </button>
            )}
          </div>
        </form>

        {/* Hidden reCAPTCHA container for resend */}
        <div id="recaptcha-container-phone" ref={recaptchaContainerRef} />
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="text-center py-8">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        ¡Verificación exitosa!
      </h3>
      <p className="text-gray-600">
        Redirigiendo...
      </p>
    </div>
  );
}
