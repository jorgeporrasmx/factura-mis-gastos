'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useRouter } from 'next/navigation';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, LogOut, Shield, Building2, FolderOpen, ExternalLink } from 'lucide-react';

export default function PerfilPage() {
  const { user, signOut } = useAuth();
  const { company, userProfile, isAdmin } = useCompany();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  // Construir enlaces de Drive
  const companyDriveLink = company?.driveFolderId
    ? `https://drive.google.com/drive/folders/${company.driveFolderId}`
    : null;
  const userDriveLink = userProfile?.driveFolderId
    ? `https://drive.google.com/drive/folders/${userProfile.driveFolderId}`
    : null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div>
      <PortalHeader title="Mi Perfil" />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuario'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-medium">
                {user.displayName
                  ? user.displayName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : user.email.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.displayName || 'Usuario'}
              </h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Correo electrónico</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-600">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Método de acceso</p>
                <p className="text-gray-900">
                  {user.provider === 'google' ? 'Google' : 'Enlace por correo'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Miembro desde</p>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company section */}
        {company && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresa
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="text-gray-900">{company.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tu rol</p>
                  <p className="text-gray-900">
                    {isAdmin ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
              </div>

              {company.rfc && (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 text-gray-400 flex items-center justify-center text-xs font-bold">
                    RFC
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">RFC</p>
                    <p className="text-gray-900">{company.rfc}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drive folders section */}
        {(userDriveLink || companyDriveLink) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Carpetas de Google Drive
            </h3>

            <div className="space-y-3">
              {userDriveLink && (
                <a
                  href={userDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Mi carpeta personal</p>
                      <p className="text-sm text-blue-600">Tus documentos y recibos</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}

              {companyDriveLink && isAdmin && (
                <a
                  href={companyDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Carpeta de empresa</p>
                      <p className="text-sm text-green-600">Documentos de {company?.name}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Account section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Cuenta</h3>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Help section */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-2">¿Necesitas ayuda?</p>
          <a
            href="https://wa.me/521234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contáctanos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
