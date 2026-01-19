'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  sendPasswordResetEmail,
} from '@/lib/firebase/auth';
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';

interface EmailPasswordFormProps {
  mode?: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type View = 'form' | 'forgot-password' | 'check-email' | 'verify-email';

export function EmailPasswordForm({
  mode = 'login',
  onSuccess,
  onError,
}: EmailPasswordFormProps) {
  const [view, setView] = useState<View>('form');
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email) {
      setError('Por favor ingresa tu email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }

    if (!password) {
      setError('Por favor ingresa tu contraseña');
      return false;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    const result = isLogin
      ? await signInWithEmailPassword(email, password)
      : await signUpWithEmailPassword(email, password);

    setIsLoading(false);

    if (result.success) {
      if (result.needsEmailVerification) {
        setView('verify-email');
      } else {
        onSuccess?.();
      }
    } else {
      setError(result.error?.message || 'Error de autenticación');
      onError?.(result.error?.message || 'Error de autenticación');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setIsLoading(true);

    const result = await sendPasswordResetEmail(email);

    setIsLoading(false);

    if (result.success) {
      setView('check-email');
    } else {
      setError(result.error?.message || 'Error al enviar email');
    }
  };

  // Forgot password view
  if (view === 'forgot-password') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setView('form')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </button>

        <div className="text-center py-2">
          <h3 className="font-semibold text-gray-900 mb-1">Restablecer contraseña</h3>
          <p className="text-sm text-gray-600">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <Button type="submit" disabled={isLoading || !email} className="w-full">
            {isLoading ? 'Enviando...' : 'Enviar enlace'}
          </Button>
        </form>
      </div>
    );
  }

  // Check email view (after password reset)
  if (view === 'check-email') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revisa tu correo
        </h3>
        <p className="text-gray-600 mb-4">
          Enviamos un enlace a <span className="font-medium">{email}</span>
        </p>
        <Button variant="ghost" onClick={() => setView('form')}>
          Volver al inicio de sesión
        </Button>
      </div>
    );
  }

  // Verify email view (after registration)
  if (view === 'verify-email') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verifica tu email
        </h3>
        <p className="text-gray-600 mb-4">
          Enviamos un enlace de verificación a{' '}
          <span className="font-medium">{email}</span>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setView('form');
            setIsLogin(true);
          }}
        >
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  // Main form view
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
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLogin && (
        <div className="text-right">
          <button
            type="button"
            onClick={() => setView('forgot-password')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading
          ? (isLogin ? 'Iniciando...' : 'Creando cuenta...')
          : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setConfirmPassword('');
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {isLogin
            ? '¿No tienes cuenta? Regístrate'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </form>
  );
}
