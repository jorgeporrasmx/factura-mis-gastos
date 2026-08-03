import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { duplicateBoardForCompany } from '@/lib/monday-boards';
import type {
  InvoiceRequestFiscalProfile,
  InvoiceRequestMondayColumns,
} from '@/types/company';
import {
  getFiscalProfileVersion,
  resolveMondayColumnMap,
  validateFiscalProfile,
  type MondayBoardColumn,
} from './fmg-whatsapp-tenant-core';
import { cleanEnv } from './fmg-whatsapp-core';

const MONDAY_API_URL = 'https://api.monday.com/v2';

type FiscalProfileInput = Omit<InvoiceRequestFiscalProfile, 'version'>;

type MondayApiPayload<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

function requiredEnv(name: string): string {
  const value = cleanEnv(process.env[name]);
  if (!value) throw new Error(`${name} no configurada`);
  return value;
}

async function mondayRequest<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: requiredEnv('MONDAY_API_KEY'),
      'Content-Type': 'application/json',
      'API-Version': process.env.MONDAY_API_VERSION || '2026-07',
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const payload = (await response.json()) as MondayApiPayload<T>;
  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(
      `Monday API: ${payload.errors?.[0]?.message || `${response.status} ${response.statusText}`}`
    );
  }
  return payload.data;
}

async function getBoardColumns(boardId: string): Promise<MondayBoardColumn[]> {
  const data = await mondayRequest<{
    boards: Array<{ columns: MondayBoardColumn[] }>;
  }>(
    `query FmgBoardColumns($boardId: [ID!]!) {
      boards(ids: $boardId) { columns { id title type } }
    }`,
    { boardId: [boardId] }
  );
  const board = data.boards[0];
  if (!board) throw new Error('El tablero de Monday no existe o no es accesible');
  return board.columns;
}

async function createColumn(
  boardId: string,
  title: string,
  columnType: 'text' | 'status'
): Promise<MondayBoardColumn> {
  const data = await mondayRequest<{ create_column: MondayBoardColumn }>(
    `mutation FmgCreateColumn($boardId: ID!, $title: String!, $columnType: ColumnType!) {
      create_column(board_id: $boardId, title: $title, column_type: $columnType) {
        id title type
      }
    }`,
    { boardId, title, columnType }
  );
  return data.create_column;
}

async function ensureTrackingColumns(boardId: string): Promise<MondayBoardColumn[]> {
  const columns = await getBoardColumns(boardId);
  const titles = new Set(columns.map((column) => column.title.trim().toLowerCase()));
  const additions: MondayBoardColumn[] = [];
  if (!titles.has('whatsapp id')) {
    additions.push(await createColumn(boardId, 'WhatsApp ID', 'text'));
  }
  if (!titles.has('whatsapp estado')) {
    additions.push(await createColumn(boardId, 'WhatsApp estado', 'status'));
  }
  return [...columns, ...additions];
}

function publicWebhookUrl(): string {
  const configured = cleanEnv(process.env.FMG_PUBLIC_BASE_URL);
  const vercelHost = cleanEnv(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  const base = configured || (vercelHost ? `https://${vercelHost}` : undefined);
  if (!base) throw new Error('FMG_PUBLIC_BASE_URL no configurada');
  const url = new URL('/api/integrations/monday/whatsapp', base);
  url.searchParams.set('secret', requiredEnv('MONDAY_WHATSAPP_WEBHOOK_SECRET'));
  if (url.toString().length > 255) throw new Error('La URL del webhook de Monday excede 255 caracteres');
  return url.toString();
}

async function ensureMondayWebhook(
  boardId: string,
  columns: InvoiceRequestMondayColumns,
  existingWebhookId?: string
): Promise<string> {
  const existing = await mondayRequest<{
    webhooks: Array<{ id: string; event: string; config?: string }>;
  }>(
    `query FmgWebhooks($boardId: ID!) {
      webhooks(board_id: $boardId) { id event config }
    }`,
    { boardId }
  );
  const match = existing.webhooks.find((webhook) => {
    if (
      webhook.id !== existingWebhookId ||
      webhook.event !== 'change_specific_column_value'
    ) return false;
    try {
      return JSON.parse(webhook.config || '{}').columnId === columns.method;
    } catch {
      return false;
    }
  });
  if (match) return match.id;

  const data = await mondayRequest<{ create_webhook: { id: string } }>(
    `mutation FmgCreateWebhook($boardId: ID!, $url: String!, $config: JSON!) {
      create_webhook(
        board_id: $boardId
        url: $url
        event: change_specific_column_value
        config: $config
      ) { id }
    }`,
    {
      boardId,
      url: publicWebhookUrl(),
      config: JSON.stringify({ columnId: columns.method }),
    }
  );
  return data.create_webhook.id;
}

export async function provisionInvoiceRequestClient(input: {
  companyId: string;
  fiscalProfile: FiscalProfileInput;
}): Promise<{
  companyId: string;
  boardId: string;
  webhookId: string;
  columns: InvoiceRequestMondayColumns;
  fiscalProfileVersion: string;
}> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no está disponible');
  const companyRef = db.collection('companies').doc(input.companyId);
  const companySnapshot = await companyRef.get();
  if (!companySnapshot.exists) throw new Error('La empresa no existe');
  const company = companySnapshot.data() || {};
  if (company.status !== 'active') throw new Error('La empresa no está activa');
  const fiscalProfile = validateFiscalProfile({
    ...input.fiscalProfile,
    version: getFiscalProfileVersion(input.fiscalProfile),
  });
  if (company.rfc && String(company.rfc).toUpperCase() !== fiscalProfile.rfc) {
    throw new Error('El RFC del perfil no coincide con el RFC registrado de la empresa');
  }

  let boardId = typeof company.mondayBoardId === 'string' ? company.mondayBoardId : '';
  if (!boardId) {
    if (typeof company.name !== 'string' || !company.name.trim()) {
      throw new Error('La empresa no tiene un nombre válido para crear su tablero');
    }
    const board = await duplicateBoardForCompany(company.name.trim());
    boardId = board.boardId;
    await companyRef.update({
      mondayBoardId: boardId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  const mondayColumns = resolveMondayColumnMap(await ensureTrackingColumns(boardId));
  const existingWebhookId =
    typeof company.invoiceRequestAutomation?.mondayWebhookId === 'string'
      ? company.invoiceRequestAutomation.mondayWebhookId
      : undefined;
  const webhookId = await ensureMondayWebhook(
    boardId,
    mondayColumns,
    existingWebhookId
  );
  const configuredAt = new Date().toISOString();

  await companyRef.update({
    rfc: fiscalProfile.rfc,
    invoiceRequestAutomation: {
      enabled: true,
      status: 'ready',
      fiscalProfile,
      mondayColumns,
      mondayWebhookId: webhookId,
      configuredAt,
      configuredBy: fiscalProfile.verifiedBy,
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    companyId: input.companyId,
    boardId,
    webhookId,
    columns: mondayColumns,
    fiscalProfileVersion: fiscalProfile.version,
  };
}
