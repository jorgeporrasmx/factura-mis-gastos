// Usuario autenticado
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: 'google' | 'email';
  createdAt: Date;
  lastLoginAt: Date;
}

// Estado de autenticación
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Resultado de operaciones de auth
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: {
    code: string;
    message: string;
  };
}

// Contexto de autenticación
export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  verifyMagicLink: (url: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
