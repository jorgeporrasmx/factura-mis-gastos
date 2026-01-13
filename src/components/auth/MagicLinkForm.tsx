'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, CheckCircle } from 'lucide-react';

interface MagicLinkFormProps {
  defaultEmail?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function MagicLinkForm({ defaultEmail, onSuccess, onError }: MagicLinkFormProps) {
  const { signInWithMagicLink, isLoading } = useAuth();
  const [email, setEmail] = useState(defaultEmail || '');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsSending(true);

    const result = await signInWithMagicLink(email);

    setIsSending(false);

    if (result.success) {
      setIsSent(true);
      onSuccess?.();
    } else {
      setError(result.error?.message || 'Error al enviar el enlace');
      onError?.(result.error?.message || 'Error al enviar el enlace');
    }
  };

  if (isSent) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revisa tu correo
        </h3>
        <p className="text-gray-600 mb-4">
          Enviamos un enlace de acceso a <span className="font-medium">{email}</span>
        </p>
        <p className="text-sm text-gray-500">
          El enlace expira en 1 hora. Si no lo ves, revisa tu carpeta de spam.
        </p>
        <Button
          variant="ghost"
          onClick={() => setIsSent(false)}
          className="mt-4"
        >
          Usar otro email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isSending || isLoading}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSending || isLoading || !email}
        className="w-full"
      >
        {isSending ? 'Enviando...' : 'Enviar enlace de acceso'}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Te enviaremos un enlace seguro para iniciar sesión sin contraseña.
      </p>
    </form>
  );
}
