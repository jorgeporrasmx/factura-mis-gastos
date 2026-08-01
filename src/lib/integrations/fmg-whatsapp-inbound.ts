import { FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { hashTraceValue } from './fmg-whatsapp-core';
import {
  FMG_MONDAY_COLUMNS,
  createMondayUpdate,
  updateMondayItem,
} from './fmg-whatsapp';
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
const MAX_CORRELATION_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type ReservationData = {
  boardId?: string;
  itemId?: string;
  messageId?: string;
  phoneHash?: string;
  state?: string;
  sentAt?: unknown;
  createdAt?: unknown;
};

type InboundData = {
  itemId?: string;
  mirrored?: boolean;
};

function getFirestoreOrThrow() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no está disponible para mensajes entrantes');
  return db;
}

function timestampMillis(value: unknown): number | undefined {
  if (
    value &&
    typeof value === 'object' &&
    'toMillis' in value &&
    typeof (value as { toMillis?: unknown }).toMillis === 'function'
  ) {
    return (value as { toMillis(): number }).toMillis();
  }
  return undefined;
}

function isAuthorizedReservation(data: ReservationData): boolean {
  const expectedBoardId = process.env.MONDAY_FMG_BOARD_ID || '8964055261';
  return (
    data.boardId === expectedBoardId &&
    Boolean(data.itemId) &&
    data.state === 'sent' &&
    Boolean(data.messageId?.startsWith('wamid.'))
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

async function findLatestReservationByPhone(
  phone: string,
  incomingTimestamp: number
): Promise<QueryDocumentSnapshot | null> {
  const db = getFirestoreOrThrow();
  const snapshot = await db
    .collection(REQUEST_COLLECTION)
    .where('phoneHash', '==', hashTraceValue(phone))
    .limit(50)
    .get();

  const incomingMs = incomingTimestamp * 1000;
  const candidates = snapshot.docs
    .map((doc) => {
      const data = doc.data() as ReservationData;
      const sentMs = timestampMillis(data.sentAt) || timestampMillis(data.createdAt);
      return { doc, data, sentMs };
    })
    .filter(
      (candidate) =>
        isAuthorizedReservation(candidate.data) &&
        candidate.sentMs !== undefined &&
        candidate.sentMs <= incomingMs + 5 * 60 * 1000 &&
        incomingMs - candidate.sentMs <= MAX_CORRELATION_AGE_MS
    )
    .sort((left, right) => (right.sentMs || 0) - (left.sentMs || 0));

  return candidates[0]?.doc || null;
}

async function findReservation(
  message: WhatsAppInboundMessage
): Promise<QueryDocumentSnapshot | null> {
  if (message.contextMessageId) {
    const contextual = await findReservationByMessageId(message.contextMessageId);
    if (contextual) return contextual;
  }
  return findLatestReservationByPhone(message.from, message.timestamp);
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
    if (!data.itemId) return { matched: false };
    return {
      matched: true,
      itemId: data.itemId,
      eventKey,
      shouldMirror: data.mirrored !== true,
    };
  }

  const reservation = await findReservation(message);
  if (!reservation) return { matched: false };
  const reservationData = reservation.data() as ReservationData;
  if (!reservationData.itemId) return { matched: false };
  const itemId = reservationData.itemId;

  return db.runTransaction(async (transaction) => {
    const current = await transaction.get(inboundRef);
    if (current.exists) {
      const data = current.data() as InboundData;
      if (!data.itemId) return { matched: false };
      return {
        matched: true,
        itemId: data.itemId,
        eventKey,
        shouldMirror: data.mirrored !== true,
      };
    }

    transaction.create(inboundRef, {
      itemId,
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
      itemId,
      eventKey,
      shouldMirror: true,
    };
  });
}

async function mirrorInboundMessage(
  itemId: string,
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
    itemId,
    `<b>WhatsApp · mensaje del cliente</b>${contact}<br><b>Hora:</b> ${escapeHtml(receivedAt)}<br>${escapeHtml(message.content)}`
  );
  await updateMondayItem(itemId, {
    [FMG_MONDAY_COLUMNS.whatsAppState]: { label: 'Respondido' },
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
