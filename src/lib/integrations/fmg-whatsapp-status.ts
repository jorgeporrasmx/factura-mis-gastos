import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  createMondayUpdate,
  updateMondayItem,
} from './fmg-whatsapp';
import {
  validateMondayColumns,
  type InvoiceRequestMondayTarget,
} from './fmg-whatsapp-tenant-core';
import {
  escapeHtml,
  getWhatsAppStatusEventKey,
  getWhatsAppStatusLabel,
  shouldApplyWhatsAppStatus,
  type WhatsAppDeliveryStatus,
  type WhatsAppStatusEvent,
} from './fmg-whatsapp-status-core';
import {
  runWhatsAppStatusWorkflow,
  type WhatsAppStatusClaim,
  type WhatsAppStatusWorkflowResult,
} from './fmg-whatsapp-status-workflow';

const IDEMPOTENCY_COLLECTION = 'fmg_whatsapp_invoice_requests';

type ReservationData = {
  companyId?: string;
  boardId?: string;
  itemId?: string;
  mondayColumns?: unknown;
  messageId?: string;
  state?: string;
  metaStatus?: WhatsAppDeliveryStatus;
  metaStatusTimestamp?: number;
  metaStatusEventKey?: string;
  metaStatusMirrored?: boolean;
};

function reservationTarget(data: ReservationData): InvoiceRequestMondayTarget | null {
  if (!data.companyId || !data.boardId || !data.itemId) return null;
  try {
    return {
      companyId: data.companyId,
      boardId: data.boardId,
      itemId: data.itemId,
      columns: validateMondayColumns(data.mondayColumns),
    };
  } catch {
    return null;
  }
}

function getFirestoreOrThrow() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no está disponible para estados de WhatsApp');
  return db;
}

async function claimStatus(event: WhatsAppStatusEvent): Promise<WhatsAppStatusClaim> {
  const db = getFirestoreOrThrow();
  const matches = await db
    .collection(IDEMPOTENCY_COLLECTION)
    .where('messageId', '==', event.messageId)
    .limit(1)
    .get();

  const match = matches.docs[0];
  if (!match) return { matched: false };

  const eventKey = getWhatsAppStatusEventKey(event);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(match.ref);
    const current = (snapshot.data() || {}) as ReservationData;
    const target = reservationTarget(current);
    if (!target || current.messageId !== event.messageId) {
      return { matched: false };
    }

    if (current.metaStatusEventKey === eventKey && current.metaStatusMirrored !== true) {
      return {
        matched: true,
        target,
        eventKey,
        shouldMirror: true,
      };
    }

    if (
      !shouldApplyWhatsAppStatus(
        current.metaStatus,
        current.metaStatusTimestamp,
        event
      )
    ) {
      return {
        matched: true,
        target,
        eventKey,
        shouldMirror: false,
      };
    }

    const sentAlreadyReflected = event.status === 'sent' && current.state === 'sent';
    transaction.update(match.ref, {
      metaStatus: event.status,
      metaStatusTimestamp: event.timestamp,
      metaStatusEventKey: eventKey,
      metaStatusDetail: event.detail || FieldValue.delete(),
      metaStatusMirrored: sentAlreadyReflected,
      metaStatusReceivedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      matched: true,
      target,
      eventKey,
      shouldMirror: !sentAlreadyReflected,
    };
  });
}

async function mirrorStatusToMonday(
  target: InvoiceRequestMondayTarget,
  event: WhatsAppStatusEvent
): Promise<void> {
  const label = getWhatsAppStatusLabel(event.status);
  await updateMondayItem(
    target.boardId,
    target.itemId,
    { [target.columns.whatsAppState]: { label } },
    { createLabelsIfMissing: true }
  );

  const safeDetail = event.detail ? `<br>${escapeHtml(event.detail)}` : '';
  await createMondayUpdate(
    target.itemId,
    `<b>WhatsApp: ${label}</b><br>ID: ${escapeHtml(event.messageId)}${safeDetail}`
  );
}

async function markStatusMirrored(eventKey: string): Promise<void> {
  const db = getFirestoreOrThrow();
  const matches = await db
    .collection(IDEMPOTENCY_COLLECTION)
    .where('metaStatusEventKey', '==', eventKey)
    .limit(1)
    .get();
  const match = matches.docs[0];
  if (!match) return;

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(match.ref);
    const data = (snapshot.data() || {}) as ReservationData;
    if (data.metaStatusEventKey !== eventKey) return;
    transaction.update(match.ref, {
      metaStatusMirrored: true,
      metaStatusMirroredAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function processWhatsAppStatus(
  event: WhatsAppStatusEvent
): Promise<WhatsAppStatusWorkflowResult> {
  return runWhatsAppStatusWorkflow(event, {
    claim: claimStatus,
    mirror: mirrorStatusToMonday,
    markMirrored: markStatusMirrored,
  });
}

export async function processWhatsAppStatuses(
  events: WhatsAppStatusEvent[]
): Promise<WhatsAppStatusWorkflowResult[]> {
  const results: WhatsAppStatusWorkflowResult[] = [];
  for (const event of events) results.push(await processWhatsAppStatus(event));
  return results;
}
