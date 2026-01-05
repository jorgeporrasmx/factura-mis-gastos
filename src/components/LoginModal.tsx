'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: { name: string; email: string; avatar: string }) => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, error, clearError } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    clearError();
    try {
      await signInWithGoogle();
      onClose();
      router.push('/dashboard');
    } catch {
      // Error is handled in the context
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
        router.push('/dashboard');
      } else if (mode === 'register') {
        await signUpWithEmail(email, password, name);
        onClose();
        router.push('/dashboard');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccessMessage('Te enviamos un correo para restablecer tu contraseña');
      }
    } catch {
      // Error is handled in the context
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleClose = () => {
    switchMode('login');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'register' && 'Crear Cuenta'}
            {mode === 'reset' && 'Recuperar Contraseña'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login' && 'Accede a tu cuenta de Factura Mis Gastos'}
            {mode === 'register' && 'Crea tu cuenta para comenzar'}
            {mode === 'reset' && 'Te enviaremos un correo para restablecer tu contraseña'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Google Login - Only show in login/register modes */}
          {mode !== 'reset' && (
            <>
              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Conectando...
                  </div>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continuar con Google
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O con correo
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            )}

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />

            {mode !== 'reset' && (
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            )}

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Success Message */}
            {successMessage && (
              <p className="text-sm text-green-600 text-center">{successMessage}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium gradient-bg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </div>
              ) : (
                <>
                  {mode === 'login' && 'Iniciar Sesión'}
                  {mode === 'register' && 'Crear Cuenta'}
                  {mode === 'reset' && 'Enviar Correo'}
                </>
              )}
            </Button>
          </form>

          {/* Mode Switching Links */}
          <div className="text-center text-sm space-y-2">
            {mode === 'login' && (
              <>
                <p className="text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-primary font-medium hover:underline"
                  >
                    Regístrate
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-muted-foreground hover:text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </p>
              </>
            )}
            {mode === 'register' && (
              <p className="text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary font-medium hover:underline"
                >
                  Inicia Sesión
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <p className="text-muted-foreground">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary font-medium hover:underline"
                >
                  Volver al inicio de sesión
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
