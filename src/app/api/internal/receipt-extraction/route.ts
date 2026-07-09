// Internal endpoint for OCR/AI receipt enrichment.
// Zapier/n8n sends extracted receipt data here after a Drive file is created.

import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  getCompanyByIdAdmin,
  getUserProfileAdmin,
} from '@/lib/firebase/firestore-admin';
import type { Company } from '@/types/company';
import {
  createExpenseItem,
  createItemUpdate,
  findExpenseItemByDriveFileId,
  isMondayBoardsConfigured,
  updateExpenseItem,
} from '@/lib/monday-boards';

type ReceiptRoute = 'portal_web' | 'correo' | 'whatsapp' | 'revision' | 'no_facturable';
type ExtractionStatus =
  | 'NUEVO'
  | 'SIN INFORMACIÓN'
  | 'INFO'
  | 'En Proceso'
  | 'Listo'
  | 'No Facturado'
  | 'DUPLICADA';

interface ReceiptExtractionPayload {
  driveFileId: string;
  fileUrl?: string;
  receiptId?: string;
  userId?: string;
  companyId?: string;
  mondayBoardId?: string;
  mondayItemId?: string;
  source?: 'zapier' | 'n8n' | 'manual' | string;
  extraction: {
    proveedor?: string;
    razonSocial?: string;
    rfcProveedor?: string;
    fecha?: string;
    total?: number | string;
    ticket?: string;
    portalFacturacion?: string;
    metodo?: 'Web' | 'Correo' | 'Whatsapp' | 'Manual' | string;
    metodoPago?: string;
    tienda?: string;
    caja?: string;
    ruta?: ReceiptRoute;
    status?: ExtractionStatus;
    confidence?: number;
    missingFields?: string[];
    rawText?: string;
    notes?: string;
  };
}

const STATUS_BY_ROUTE: Record<ReceiptRoute, ExtractionStatus> = {
  portal_web: 'En Proceso',
  correo: 'INFO',
  whatsapp: 'INFO',
  revision: 'INFO',
  no_facturable: 'No Facturado',
};

const METHOD_LABELS: Record<string, string> = {
  Web: 'Página Web',
  web: 'Página Web',
  portal_web: 'Página Web',
  Correo: 'Correo',
  correo: 'Correo',
  Whatsapp: 'Whatsapp',
  WhatsApp: 'Whatsapp',
  whatsapp: 'Whatsapp',
  Manual: 'NUEVO',
  manual: 'NUEVO',
};

function getAutomationSecret(): string | undefined {
  const value = process.env.FMG_AUTOMATION_SECRET || process.env.INTERNAL_AUTOMATION_TOKEN;
  return value?.trim().replace(/^["']|["']$/g, '');
}

function isAuthorized(request: NextRequest): boolean {
  const expected = getAutomationSecret();
  if (!expected) return false;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const headerSecret = request.headers.get('x-fmg-automation-secret');

  return bearer === expected || headerSecret === expected;
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().split('T')[0];
}

function normalizeTotal(value?: number | string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;

  const parsed = Number(value.replace(/[$,\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function inferStatus(payload: ReceiptExtractionPayload): ExtractionStatus {
  const explicit = payload.extraction.status;
  if (explicit) return explicit;

  if (payload.extraction.missingFields?.length) return 'SIN INFORMACIÓN';
  if (payload.extraction.ruta) return STATUS_BY_ROUTE[payload.extraction.ruta];

  const hasMinimumData = Boolean(
    payload.extraction.proveedor &&
    payload.extraction.fecha &&
    payload.extraction.total
  );

  return hasMinimumData ? 'En Proceso' : 'INFO';
}

function buildMondayColumnValues(payload: ReceiptExtractionPayload): Record<string, unknown> {
  const extraction = payload.extraction;
  const status = inferStatus(payload);
  const total = normalizeTotal(extraction.total);
  const fecha = normalizeDate(extraction.fecha);
  const methodLabel =
    METHOD_LABELS[extraction.metodo || ''] ||
    (extraction.ruta ? METHOD_LABELS[extraction.ruta] : undefined) ||
    'NUEVO';

  const values: Record<string, unknown> = {
    status: { label: status },
    enlace4: payload.driveFileId,
  };

  if (fecha) values.text_mkthrxct = fecha;
  if (total !== undefined) values.n_meros = String(total);
  if (extraction.razonSocial || extraction.proveedor) {
    values.text_mky7nh3g = extraction.razonSocial || extraction.proveedor;
  }
  if (payload.fileUrl) values.text_mkqygzgk = payload.fileUrl;
  if (methodLabel) values.proyecto = { label: methodLabel };
  if (extraction.ticket) values.correo = extraction.ticket;
  if (extraction.portalFacturacion) {
    values.link_mkqg4vhb = {
      url: extraction.portalFacturacion,
      text: 'Portal de facturación',
    };
  }

  return values;
}

function buildMondayUpdate(payload: ReceiptExtractionPayload): string {
  const e = payload.extraction;
  const lines = [
    '<b>Lectura automática de recibo</b>',
    `Fuente: ${payload.source || 'automatización interna'}`,
    `Drive file ID: ${payload.driveFileId}`,
    e.proveedor ? `Proveedor: ${e.proveedor}` : null,
    e.razonSocial ? `Razón social: ${e.razonSocial}` : null,
    e.rfcProveedor ? `RFC proveedor: ${e.rfcProveedor}` : null,
    e.fecha ? `Fecha: ${e.fecha}` : null,
    e.total !== undefined ? `Total: ${e.total}` : null,
    e.ticket ? `Ticket/transacción: ${e.ticket}` : null,
    e.metodoPago ? `Método de pago: ${e.metodoPago}` : null,
    e.tienda ? `Tienda: ${e.tienda}` : null,
    e.caja ? `Caja: ${e.caja}` : null,
    e.ruta ? `Ruta sugerida: ${e.ruta}` : null,
    e.missingFields?.length ? `Campos pendientes: ${e.missingFields.join(', ')}` : null,
    e.notes ? `Notas: ${e.notes}` : null,
  ].filter(Boolean);

  return lines.join('<br>');
}

async function resolveCompany(payload: ReceiptExtractionPayload): Promise<Company | null> {
  if (payload.companyId) return getCompanyByIdAdmin(payload.companyId);

  const db = getAdminFirestore();
  if (!db) return null;

  if (payload.userId) {
    const user = await getUserProfileAdmin(payload.userId);
    if (user?.companyId) return getCompanyByIdAdmin(user.companyId);
  }

  if (payload.mondayBoardId) {
    const snapshot = await db
      .collection('companies')
      .where('mondayBoardId', '==', payload.mondayBoardId)
      .limit(1)
      .get();

    const doc = snapshot.docs[0];
    if (doc) {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      } as Company;
    }
  }

  return null;
}

async function readReceiptUserId(driveFileId: string): Promise<string | undefined> {
  const db = getAdminFirestore();
  if (!db) return undefined;

  const receipt = await db.collection('receipts').doc(driveFileId).get();
  return receipt.exists ? receipt.data()?.userId : undefined;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    );
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json(
      { success: false, error: 'Firebase Admin no está configurado' },
      { status: 503 }
    );
  }

  try {
    const payload = (await request.json()) as ReceiptExtractionPayload;

    if (!payload.driveFileId || !payload.extraction) {
      return NextResponse.json(
        { success: false, error: 'driveFileId y extraction son obligatorios' },
        { status: 400 }
      );
    }

    const receiptId = payload.receiptId || payload.driveFileId;
    const userId = payload.userId || await readReceiptUserId(receiptId);
    const company = await resolveCompany({ ...payload, userId });

    if (!company?.id) {
      return NextResponse.json(
        { success: false, error: 'No se pudo resolver la empresa del recibo' },
        { status: 400 }
      );
    }

    const boardId = payload.mondayBoardId || company.mondayBoardId;
    const status = inferStatus(payload);
    const total = normalizeTotal(payload.extraction.total) ?? 0;
    const fecha = normalizeDate(payload.extraction.fecha);
    const provider = payload.extraction.proveedor || payload.extraction.razonSocial || 'Recibo';

    let mondayItemId = payload.mondayItemId || null;

    if (isMondayBoardsConfigured() && boardId) {
      mondayItemId = mondayItemId || await findExpenseItemByDriveFileId(boardId, payload.driveFileId);

      const columnValues = buildMondayColumnValues(payload);

      if (mondayItemId) {
        await updateExpenseItem(boardId, mondayItemId, columnValues);
      } else {
        mondayItemId = await createExpenseItem(boardId, provider, columnValues);
      }

      await createItemUpdate(mondayItemId, buildMondayUpdate(payload));
    }

    const receiptStatus =
      status === 'Listo' ? 'completed' :
      status === 'No Facturado' ? 'rejected' :
      status === 'En Proceso' ? 'in_progress' :
      'pending';

    await db.collection('receipts').doc(receiptId).set({
      id: receiptId,
      ...(userId ? { userId } : {}),
      ...(payload.fileUrl ? { fileUrl: payload.fileUrl } : {}),
      storagePath: payload.driveFileId,
      status: receiptStatus,
      monday: mondayItemId && boardId ? { boardId, itemId: mondayItemId } : null,
      metadata: {
        ...payload.extraction,
        driveFileId: payload.driveFileId,
        source: payload.source || 'internal',
        extractedAt: FieldValue.serverTimestamp(),
      },
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    await db
      .collection('companies')
      .doc(company.id)
      .collection('expenses')
      .doc(payload.driveFileId)
      .set({
        id: payload.driveFileId,
        mondayItemId: mondayItemId || '',
        companyId: company.id,
        userId: userId || '',
        userName: '',
        userEmail: '',
        nombre: provider,
        monto: total,
        fecha: fecha ? new Date(`${fecha}T00:00:00`) : new Date(),
        proveedor: provider,
        categoria: 'otros',
        estado:
          receiptStatus === 'completed' ? 'facturado' :
          receiptStatus === 'rejected' ? 'rechazado' :
          receiptStatus === 'in_progress' ? 'en_proceso' :
          'pendiente',
        reciboUrl: payload.fileUrl || '',
        receiptDriveId: payload.driveFileId,
        notas: payload.extraction.notes || '',
        rfcProveedor: payload.extraction.rfcProveedor || '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        syncedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

    await db.collection('receiptAutomation').doc(payload.driveFileId).set({
      driveFileId: payload.driveFileId,
      receiptId,
      companyId: company.id,
      boardId: boardId || null,
      mondayItemId: mondayItemId || null,
      status,
      source: payload.source || 'internal',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      receiptId,
      companyId: company.id,
      monday: mondayItemId && boardId ? { boardId, itemId: mondayItemId } : null,
      status,
    });
  } catch (error) {
    console.error('[receipt-extraction] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando extracción de recibo',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
