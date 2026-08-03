import { FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { hashTraceValue } from './fmg-whatsapp-core';
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
  getWhatsAppInboundEventKey,
  type WhatsAppInboundMessage,
} from './fmg-whatsapp-status-core';
import {
  runWhatsAppInboundWorkflow,
  type WhatsAppInboundClaim,
  type WhatsAppInboundWorkflowResult,
} from './fmg-whatsapp-inbound-workflow';

const REQUEST_COLLECTION = 'fmg_whatsapp_invoice_requests';
const INBOUND_COLLECTION = 'fmg_whatsapp_inbound_messages';
type ReservationData = {
  companyId?: string;
  boardId?: string;
  itemId?: string;
  mondayColumns?: unknown;
  messageId?: string;
  state?: string;
};

type InboundData = {
  companyId?: string;
  boardId?: string;
  itemId?: string;
  mondayColumns?: unknown;
  mirrored?: boolean;
};

function getFirestoreOrThrow() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no está disponible para mensajes entrantes');
  return db;
}

function targetFromData(data: ReservationData | InboundData): InvoiceRequestMondayTarget | null {
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

function isAuthorizedReservation(data: ReservationData): boolean {
  return Boolean(
    targetFromData(data) &&
      data.state === 'sent' &&
      data.messageId?.startsWith('wamid.')
  );
}

async function findReservationByMessageId(
  messageId: string
): Promise<QueryDocumentSnapshot | null> {
  const db = getFirestoreOrThrow();
  const snapshot = await db
    .collection(REQUEST_COLLECTION)
    .where('messageId', '==', messageId)
    .limit(1)
    .get();
  const match = snapshot.docs[0];
  return match && isAuthorizedReservation(match.data() as ReservationData) ? match : null;
}

async function findReservation(
  message: WhatsAppInboundMessage
): Promise<QueryDocumentSnapshot | null> {
  if (!message.contextMessageId) return null;
  return findReservationByMessageId(message.contextMessageId);
}

async function saveForManualReview(
  eventKey: string,
  message: WhatsAppInboundMessage
): Promise<void> {
  const db = getFirestoreOrThrow();
  await db.collection(INBOUND_COLLECTION).doc(eventKey).set(
    {
      matched: false,
      reviewState: 'pending',
      messageIdHash: hashTraceValue(message.messageId),
      contextMessageIdHash: message.contextMessageId
        ? hashTraceValue(message.contextMessageId)
        : null,
      phoneHash: hashTraceValue(message.from),
      contactName: message.contactName || null,
      type: message.type,
      content: message.content,
      messageTimestamp: message.timestamp,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function claimInboundMessage(
  message: WhatsAppInboundMessage
): Promise<WhatsAppInboundClaim> {
  const db = getFirestoreOrThrow();
  const eventKey = getWhatsAppInboundEventKey(message.messageId);
  const inboundRef = db.collection(INBOUND_COLLECTION).doc(eventKey);
  const existing = await inboundRef.get();
  if (existing.exists) {
    const data = existing.data() as InboundData;
    const target = targetFromData(data);
    if (!target) return { matched: false };
    return {
      matched: true,
      target,
      eventKey,
      shouldMirror: data.mirrored !== true,
    };
  }

  const reservation = await findReservation(message);
  if (!reservation) {
    await saveForManualReview(eventKey, message);
    return { matched: false };
  }
  const reservationData = reservation.data() as ReservationData;
  const target = targetFromData(reservationData);
  if (!target) {
    await saveForManualReview(eventKey, message);
    return { matched: false };
  }

  return db.runTransaction(async (transaction) => {
    const current = await transaction.get(inboundRef);
    if (current.exists) {
      const data = current.data() as InboundData;
      const currentTarget = targetFromData(data);
      if (!currentTarget) return { matched: false };
      return {
        matched: true,
        target: currentTarget,
        eventKey,
        shouldMirror: data.mirrored !== true,
      };
    }

    transaction.create(inboundRef, {
      matched: true,
      companyId: target.companyId,
      boardId: target.boardId,
      itemId: target.itemId,
      mondayColumns: target.columns,
      messageIdHash: hashTraceValue(message.messageId),
      contextMessageIdHash: message.contextMessageId
        ? hashTraceValue(message.contextMessageId)
        : null,
      phoneHash: hashTraceValue(message.from),
      type: message.type,
      messageTimestamp: message.timestamp,
      mirrored: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      matched: true,
      target,
      eventKey,
      shouldMirror: true,
    };
  });
}

async function mirrorInboundMessage(
  target: InvoiceRequestMondayTarget,
  message: WhatsAppInboundMessage
): Promise<void> {
  const receivedAt = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(message.timestamp * 1000));
  const contact = message.contactName
    ? `<br><b>Cliente:</b> ${escapeHtml(message.contactName)}`
    : '';

  await createMondayUpdate(
    target.itemId,
    `<b>WhatsApp · mensaje del cliente</b>${contact}<br><b>Hora:</b> ${escapeHtml(receivedAt)}<br>${escapeHtml(message.content)}`
  );
  await updateMondayItem(target.boardId, target.itemId, {
    [target.columns.whatsAppState]: { label: 'Respondido' },
  });
}

async function markInboundMirrored(eventKey: string): Promise<void> {
  const db = getFirestoreOrThrow();
  const ref = db.collection(INBOUND_COLLECTION).doc(eventKey);
  await ref.set(
    {
      mirrored: true,
      mirroredAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export async function processWhatsAppInboundMessage(
  message: WhatsAppInboundMessage
): Promise<WhatsAppInboundWorkflowResult> {
  return runWhatsAppInboundWorkflow(message, {
    claim: claimInboundMessage,
    mirror: mirrorInboundMessage,
    markMirrored: markInboundMirrored,
  });
}

export async function processWhatsAppInboundMessages(
  messages: WhatsAppInboundMessage[]
): Promise<WhatsAppInboundWorkflowResult[]> {
  const results: WhatsAppInboundWorkflowResult[] = [];
  for (const message of messages) results.push(await processWhatsAppInboundMessage(message));
  return results;
}
