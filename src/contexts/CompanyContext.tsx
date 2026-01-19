'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type { Company, UserProfile, CompanyUser } from '@/types/company';

interface CompanyContextType {
  // Estado
  company: Company | null;
  userProfile: UserProfile | null;
  companyUsers: CompanyUser[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  refreshCompany: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  isAdmin: boolean;
  hasCompany: boolean;
  onboardingCompleted: boolean;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar perfil de usuario y empresa
  const loadUserData = useCallback(async () => {
    if (!user?.uid) {
      setUserProfile(null);
      setCompany(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Importar funciones de firestore dinámicamente para evitar errores de SSR
      const { getUserProfile, getCompanyById } = await import('@/lib/firebase/firestore');

      // Obtener perfil del usuario
      const profile = await getUserProfile(user.uid);

      if (!profile) {
        // Usuario nuevo, crear perfil básico
        const { createUserProfile } = await import('@/lib/firebase/firestore');
        const newProfile = await createUserProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        setUserProfile(newProfile);
        setCompany(null);
      } else {
        setUserProfile(profile);

        // Si tiene empresa, cargarla
        if (profile.companyId) {
          const companyData = await getCompanyById(profile.companyId);
          setCompany(companyData);
        } else {
          setCompany(null);
        }
      }
    } catch (err) {
      console.error('Error cargando datos de usuario:', err);
      setError('Error al cargar datos de usuario');
      // Crear un perfil básico en memoria para evitar loops
      setUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        photoURL: user.photoURL,
        companyId: null,
        role: 'user',
        onboardingCompleted: true, // Marcar como completado para evitar loop
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        status: 'active',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar usuarios de la empresa (solo admin)
  const refreshUsers = useCallback(async () => {
    if (!userProfile?.companyId || userProfile.role !== 'admin') {
      setCompanyUsers([]);
      return;
    }

    try {
      const { getCompanyUsers } = await import('@/lib/firebase/firestore');
      const users = await getCompanyUsers(userProfile.companyId);
      setCompanyUsers(users);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  }, [userProfile?.companyId, userProfile?.role]);

  // Refrescar datos de empresa
  const refreshCompany = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  // Efecto para cargar datos cuando el usuario cambia
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    } else {
      setUserProfile(null);
      setCompany(null);
      setCompanyUsers([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, loadUserData]);

  // Cargar usuarios cuando el perfil cambia
  useEffect(() => {
    if (userProfile?.role === 'admin' && userProfile.companyId) {
      refreshUsers();
    }
  }, [userProfile?.role, userProfile?.companyId, refreshUsers]);

  // Valores computados
  const isAdmin = userProfile?.role === 'admin';
  const hasCompany = Boolean(userProfile?.companyId);
  const onboardingCompleted = userProfile?.onboardingCompleted ?? false;

  const value: CompanyContextType = {
    company,
    userProfile,
    companyUsers,
    isLoading,
    error,
    refreshCompany,
    refreshUsers,
    isAdmin,
    hasCompany,
    onboardingCompleted,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error('useCompany debe usarse dentro de CompanyProvider');
  }

  return context;
}

// Hook para verificar permisos
export function useCompanyPermissions() {
  const { userProfile, company } = useCompany();

  return {
    canViewAllExpenses: userProfile?.role === 'admin',
    canManageUsers: userProfile?.role === 'admin',
    canUploadCompanyDocs: userProfile?.role === 'admin',
    canUploadReceipts: Boolean(company),
    canViewReports: Boolean(company),
    canConfigureMonday: userProfile?.role === 'admin',
  };
}
