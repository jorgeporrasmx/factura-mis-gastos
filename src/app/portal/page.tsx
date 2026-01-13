'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { DashboardCard } from '@/components/portal/DashboardCard';
import { FileText, Receipt, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data - in production this would come from Firebase
interface UserData {
  csf: {
    status: 'pending' | 'valid' | 'expiring_soon' | 'expired';
    expiresAt?: Date;
    daysUntilExpiry?: number;
  };
  receipts: {
    total: number;
    pending: number;
    completed: number;
  };
}

export default function PortalDashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    csf: { status: 'pending' },
    receipts: { total: 0, pending: 0, completed: 0 },
  });

  // In production, fetch user data from Firebase here
  useEffect(() => {
    // Mock: check localStorage for CSF status
    const csfUploaded = localStorage.getItem('csf_uploaded');
    if (csfUploaded) {
      const uploadDate = new Date(csfUploaded);
      const expiresAt = new Date(uploadDate);
      expiresAt.setMonth(expiresAt.getMonth() + 3);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let status: UserData['csf']['status'] = 'valid';
      if (daysUntilExpiry <= 0) status = 'expired';
      else if (daysUntilExpiry <= 15) status = 'expiring_soon';

      setUserData((prev) => ({
        ...prev,
        csf: { status, expiresAt, daysUntilExpiry },
      }));
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const csfStatusConfig = {
    pending: {
      status: 'warning' as const,
      icon: AlertTriangle,
      title: 'Constancia Fiscal Pendiente',
      description: 'Sube tu CSF para poder subir recibos',
    },
    valid: {
      status: 'success' as const,
      icon: CheckCircle,
      title: 'Constancia Fiscal Vigente',
      description: userData.csf.daysUntilExpiry
        ? `Vence en ${userData.csf.daysUntilExpiry} días`
        : 'Tu CSF está vigente',
    },
    expiring_soon: {
      status: 'warning' as const,
      icon: Clock,
      title: 'CSF por Vencer',
      description: `Vence en ${userData.csf.daysUntilExpiry} días. Actualízala pronto.`,
    },
    expired: {
      status: 'error' as const,
      icon: AlertTriangle,
      title: 'CSF Expirada',
      description: 'Tu CSF ha expirado. Actualízala para continuar.',
    },
  };

  const csfConfig = csfStatusConfig[userData.csf.status];

  return (
    <div>
      <PortalHeader title="Mi Portal" />

      <div className="p-4 md:p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Usuario'}
          </h2>
          <p className="text-gray-600 mt-1">
            Aquí puedes gestionar tu constancia fiscal y subir tus recibos.
          </p>
        </div>

        {/* CSF Alert if pending/expired */}
        {(userData.csf.status === 'pending' || userData.csf.status === 'expired') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 md:p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">
                  {userData.csf.status === 'pending'
                    ? 'Sube tu Constancia de Situación Fiscal'
                    : 'Tu CSF ha expirado'}
                </h3>
                <p className="text-yellow-700 text-sm mt-1">
                  {userData.csf.status === 'pending'
                    ? 'Necesitas subir tu CSF (máximo 3 meses de antigüedad) para poder cargar recibos.'
                    : 'Actualiza tu Constancia de Situación Fiscal para continuar subiendo recibos.'}
                </p>
                <Link href="/portal/csf">
                  <Button className="mt-4" size="sm">
                    {userData.csf.status === 'pending' ? 'Subir CSF' : 'Actualizar CSF'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* CSF Card */}
          <DashboardCard
            title={csfConfig.title}
            description={csfConfig.description}
            icon={csfConfig.icon}
            status={csfConfig.status}
            href="/portal/csf"
          />

          {/* Receipts Card */}
          <DashboardCard
            title="Mis Recibos"
            description={
              userData.csf.status === 'pending' || userData.csf.status === 'expired'
                ? 'Sube tu CSF para habilitar esta sección'
                : 'Sube fotos de tus recibos para facturar'
            }
            icon={Receipt}
            status={
              userData.csf.status === 'pending' || userData.csf.status === 'expired'
                ? 'neutral'
                : 'success'
            }
            href={
              userData.csf.status === 'pending' || userData.csf.status === 'expired'
                ? undefined
                : '/portal/recibos'
            }
            value={userData.receipts.total}
          >
            {userData.receipts.total > 0 && (
              <div className="flex gap-4 text-sm">
                <span className="text-yellow-600">{userData.receipts.pending} pendientes</span>
                <span className="text-green-600">{userData.receipts.completed} facturados</span>
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Quick actions */}
        {userData.csf.status === 'valid' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/portal/recibos?action=capture">
                <Button>
                  <Receipt className="w-4 h-4 mr-2" />
                  Tomar foto de recibo
                </Button>
              </Link>
              <Link href="/portal/recibos?action=upload">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Subir desde galería
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
