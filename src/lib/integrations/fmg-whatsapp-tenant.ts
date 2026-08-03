import { getAdminFirestore } from '@/lib/firebase/admin';
import type { Company, InvoiceRequestAutomation } from '@/types/company';
import {
  buildVerifiedTenant,
  type InvoiceRequestTenant,
} from './fmg-whatsapp-tenant-core';
import { PermanentWorkflowError } from './fmg-whatsapp-core';

type CompanyTenantData = Pick<
  Company,
  'name' | 'status' | 'mondayBoardId' | 'invoiceRequestAutomation'
>;

export async function resolveInvoiceRequestTenant(
  boardId: string
): Promise<InvoiceRequestTenant> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no está disponible para resolver la empresa');

  const snapshot = await db
    .collection('companies')
    .where('mondayBoardId', '==', boardId)
    .limit(2)
    .get();

  if (snapshot.empty) {
    throw new PermanentWorkflowError('El tablero no pertenece a una empresa registrada');
  }
  if (snapshot.size !== 1) {
    throw new PermanentWorkflowError(
      'El tablero está vinculado a más de una empresa; el envío fue bloqueado'
    );
  }

  const document = snapshot.docs[0];
  const data = document.data() as CompanyTenantData;
  try {
    return buildVerifiedTenant({
      companyId: document.id,
      companyName: data.name,
      companyStatus: data.status,
      boardId: data.mondayBoardId,
      automation: data.invoiceRequestAutomation as InvoiceRequestAutomation | undefined,
    });
  } catch (error) {
    throw new PermanentWorkflowError(
      error instanceof Error ? error.message : 'Configuración de empresa inválida'
    );
  }
}
