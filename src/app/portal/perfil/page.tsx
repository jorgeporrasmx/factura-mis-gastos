'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useRouter } from 'next/navigation';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, LogOut, Shield, Building2, FolderOpen, ExternalLink, Loader2, FolderPlus, Link2, Copy, Check, MessageCircle, Users, Phone, Pencil } from 'lucide-react';

export default function PerfilPage() {
  const { user, signOut } = useAuth();
  const { company, userProfile, isAdmin, companyUsers, refreshCompany } = useCompany();
  const router = useRouter();

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [creatingUserFolder, setCreatingUserFolder] = useState(false);
  const [folderMessage, setFolderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // WhatsApp state
  const [editingWhatsapp, setEditingWhatsapp] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState('');
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleCreateDriveFolder = async () => {
    if (!user?.uid) return;

    setCreatingFolder(true);
    setFolderMessage(null);

    try {
      const response = await fetch('/api/drive/create-folder', {
        method: 'POST',
        headers: {
          'x-user-uid': user.uid,
        },
      });

      const data = await response.json();

      if (data.success) {
        setFolderMessage({
          type: 'success',
          text: data.alreadyExists
            ? 'La carpeta ya existe. Puedes acceder a ella a continuación.'
            : 'Carpeta de Drive creada exitosamente.',
        });
        // Refrescar los datos de la empresa para mostrar el link
        await refreshCompany();
      } else {
        setFolderMessage({
          type: 'error',
          text: data.error || 'Error al crear la carpeta de Drive',
        });
      }
    } catch {
      setFolderMessage({
        type: 'error',
        text: 'Error de conexión. Por favor intenta de nuevo.',
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCreateUserDriveFolder = async () => {
    if (!user?.uid) return;

    setCreatingUserFolder(true);
    setFolderMessage(null);

    try {
      const response = await fetch(`/api/users/${user.uid}/drive-folder`, {
        method: 'POST',
        headers: {
          'x-user-uid': user.uid,
        },
      });

      const data = await response.json();

      if (data.success) {
        setFolderMessage({
          type: 'success',
          text: data.alreadyExists
            ? 'Tu carpeta personal ya existe. Puedes acceder a ella a continuación.'
            : 'Carpeta personal de Drive creada exitosamente.',
        });
        // Refrescar los datos para mostrar el link
        await refreshCompany();
      } else {
        setFolderMessage({
          type: 'error',
          text: data.error || 'Error al crear la carpeta personal de Drive',
        });
      }
    } catch {
      setFolderMessage({
        type: 'error',
        text: 'Error de conexión. Por favor intenta de nuevo.',
      });
    } finally {
      setCreatingUserFolder(false);
    }
  };

  const handleSaveWhatsapp = async () => {
    if (!user?.uid || !whatsappInput.trim()) return;
    setSavingWhatsapp(true);
    setWhatsappMessage(null);
    try {
      const res = await fetch(`/api/users/${user.uid}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': user.uid,
        },
        body: JSON.stringify({ whatsappPhone: whatsappInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setWhatsappMessage({ type: 'success', text: 'Número guardado correctamente.' });
        setEditingWhatsapp(false);
        await refreshCompany();
      } else {
        setWhatsappMessage({ type: 'error', text: data.error || 'Error al guardar el número.' });
      }
    } catch {
      setWhatsappMessage({ type: 'error', text: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setSavingWhatsapp(false);
    }
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

        {/* WhatsApp section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            WhatsApp
          </h3>

          {whatsappMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${whatsappMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {whatsappMessage.text}
            </div>
          )}

          {userProfile?.whatsappPhone && !editingWhatsapp ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Número configurado</p>
                  <p className="text-gray-900 font-medium">{userProfile.whatsappPhone}</p>
                </div>
              </div>
              <button
                onClick={() => { setWhatsappInput(userProfile.whatsappPhone || ''); setEditingWhatsapp(true); setWhatsappMessage(null); }}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
            </div>
          ) : editingWhatsapp ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Número de WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Incluye código de país. Ej: +52 para México.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveWhatsapp} disabled={savingWhatsapp || !whatsappInput.trim()} size="sm">
                  {savingWhatsapp ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Guardar
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setEditingWhatsapp(false); setWhatsappMessage(null); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Configura tu número para enviar fotos de recibos por WhatsApp y que se registren automáticamente.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setWhatsappInput(''); setEditingWhatsapp(true); setWhatsappMessage(null); }}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Agregar número
              </Button>
            </div>
          )}
        </div>

        {/* Company section */}
        {company ? (
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
        ) : userProfile?.accountType !== 'personal' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              Sin empresa
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Necesitas pertenecer a una empresa para subir tu CSF y recibos.
              Crea una empresa o pide a tu administrador que te invite.
            </p>
            <Button
              onClick={() => router.push('/auth/onboarding/empresa')}
              className="w-full sm:w-auto"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Crear empresa
            </Button>
          </div>
        ) : null}

        {/* Invite employees section (admin only) */}
        {company && isAdmin && company.inviteCode && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Invitar Empleados
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Comparte este enlace con tus empleados para que se registren y se unan a tu empresa.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 truncate">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/unirse/${company.inviteCode}`
                  : `/unirse/${company.inviteCode}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `${window.location.origin}/unirse/${company.inviteCode}`;
                  navigator.clipboard.writeText(url);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="flex-shrink-0"
              >
                {linkCopied ? (
                  <><Check className="w-4 h-4 mr-1" /> Copiado</>
                ) : (
                  <><Copy className="w-4 h-4 mr-1" /> Copiar</>
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Tu empresa ${company.name} te invita a unirte a Factura Mis Gastos. Regístrate aquí: ${typeof window !== 'undefined' ? window.location.origin : ''}/unirse/${company.inviteCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Compartir por WhatsApp
              </a>
            </div>

            {/* Employee list */}
            {companyUsers.length > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Empleados registrados ({companyUsers.filter(u => u.role === 'user').length})
                </p>
                <div className="space-y-2">
                  {companyUsers
                    .filter(u => u.role === 'user')
                    .map(employee => (
                      <div key={employee.uid} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {employee.displayName
                              ? employee.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                              : employee.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {employee.displayName || employee.email}
                            </p>
                            {employee.whatsappPhone && (
                              <p className="text-xs text-gray-500">{employee.whatsappPhone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drive folders section */}
        {company && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Carpetas de Google Drive
            </h3>

            {/* Message feedback */}
            {folderMessage && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  folderMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {folderMessage.text}
              </div>
            )}

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

              {/* Create folder button for admins without Drive folder */}
              {!companyDriveLink && isAdmin && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 mb-3">
                    Tu empresa aún no tiene una carpeta de Google Drive configurada.
                    Crea una para organizar los documentos de tu equipo.
                  </p>
                  <Button
                    onClick={handleCreateDriveFolder}
                    disabled={creatingFolder}
                    className="w-full sm:w-auto"
                  >
                    {creatingFolder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando carpeta...
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Crear carpeta de Drive
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Button for users without personal folder but company has Drive folder */}
              {!userDriveLink && companyDriveLink && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    Aún no tienes una carpeta personal de Drive.
                    Crea una para organizar tus documentos y recibos.
                  </p>
                  <Button
                    onClick={handleCreateUserDriveFolder}
                    disabled={creatingUserFolder}
                    className="w-full sm:w-auto"
                  >
                    {creatingUserFolder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creando carpeta...
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Crear mi carpeta personal
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Message for users without folders and company without Drive */}
              {!userDriveLink && !companyDriveLink && !isAdmin && (
                <p className="text-sm text-gray-500 text-center py-4">
                  La empresa aún no tiene carpeta de Drive configurada.
                  Contacta a tu administrador para habilitarla.
                </p>
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
