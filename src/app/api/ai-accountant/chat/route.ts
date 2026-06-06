// Personalized fiscal guidance for FMG portal users.
// The assistant is advisory: it does not file taxes or replace a licensed accountant.

import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  getCompanyByIdAdmin,
  getUserProfileAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  getAccountantBoardContext,
  isMondayBoardsConfigured,
  type AccountantBoardContext,
} from '@/lib/monday-boards';
import type { Company, UserProfile } from '@/types/company';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type StoredReceipt = {
  id: string;
  fileName?: string;
  fileUrl?: string;
  status?: string;
  uploadedAt?: string;
  metadata?: Record<string, unknown>;
};

const MAX_QUESTION_LENGTH = 1200;
const MAX_HISTORY_MESSAGES = 8;

function cleanText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function asIsoDate(value: unknown): string | undefined {
  const maybeDate = value as { toDate?: () => Date } | Date | undefined;
  if (!maybeDate) return undefined;
  if (maybeDate instanceof Date) return maybeDate.toISOString();
  const date = maybeDate.toDate?.();
  return date instanceof Date ? date.toISOString() : undefined;
}

async function getRecentReceipts(uid: string): Promise<StoredReceipt[]> {
  const db = getAdminFirestore();
  if (!db) return [];

  try {
    const snapshot = await db
      .collection('receipts')
      .where('userId', '==', uid)
      .limit(12)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        status: data.status,
        uploadedAt: asIsoDate(data.uploadedAt),
        metadata: data.metadata,
      };
    });
  } catch (error) {
    console.warn('[AI Accountant] No se pudieron leer recibos:', error);
    return [];
  }
}

function summarizeUser(user: UserProfile) {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    accountType: user.accountType,
    role: user.role,
    status: user.status,
    onboardingCompleted: user.onboardingCompleted,
    csf: {
      uploaded: Boolean(user.csfUploadedAt),
      uploadedAt: user.csfUploadedAt?.toISOString(),
      fileName: user.csfFileName,
      urlAvailable: Boolean(user.csfUrl || user.csfDriveId),
    },
  };
}

function summarizeCompany(company: Company | null) {
  if (!company) return null;
  return {
    id: company.id,
    name: company.name,
    domain: company.domain,
    rfc: company.rfc,
    plan: company.plan,
    status: company.status,
    subscriptionStatus: company.subscriptionStatus,
    mondayBoardId: company.mondayBoardId,
    csfAvailable: Boolean(company.csfUrl || company.csfDriveId || company.cedulaUrl || company.cedulaDriveId),
  };
}

function buildContextText(args: {
  user: UserProfile;
  company: Company | null;
  board: AccountantBoardContext | null;
  receipts: StoredReceipt[];
}) {
  const fiscalDescription = args.board?.description
    ? args.board.description.slice(0, 2400)
    : 'No hay descripción fiscal de Monday disponible.';

  const receiptLines = [
    ...(args.board?.items || []).map((item) => ({
      source: 'monday',
      item: item.name,
      group: item.groupTitle,
      values: item.values,
    })),
    ...args.receipts.map((receipt) => ({
      source: 'firestore_receipts',
      id: receipt.id,
      fileName: receipt.fileName,
      status: receipt.status,
      uploadedAt: receipt.uploadedAt,
      metadata: receipt.metadata,
    })),
  ].slice(0, 18);

  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      jurisdiction: 'Mexico',
      product: 'Factura Mis Gastos',
      user: summarizeUser(args.user),
      company: summarizeCompany(args.company),
      fiscalProfileFromMondayDescription: fiscalDescription,
      receiptsAndExpenses: receiptLines,
      fiscalKnowledgePolicy: {
        generalKnowledgeAllowed: true,
        curatedFiscalNotes: process.env.FMG_FISCAL_CONTEXT_NOTES || null,
        currentLawGuardrail:
          'Si la pregunta depende de una reforma reciente, regla miscelanea, criterio SAT o publicacion DOF, indica que debe verificarse contra DOF/SAT vigente antes de actuar.',
        noDefinitiveTaxFiling: true,
      },
    },
    null,
    2
  );
}

function buildSystemPrompt(contextText: string) {
  return `
Eres el Contador IA de Factura Mis Gastos para clientes mexicanos.

Tu trabajo:
- Resolver dudas fiscales practicas en Mexico usando el perfil del cliente, su CSF/cedula fiscal disponible, su empresa y sus recibos/facturas.
- Explicar que regimen fiscal parece tener el cliente cuando el contexto lo indique.
- Orientar sobre que puede facturar, que datos necesita, que puede ser deducible y que conviene revisar con su contador.
- Dar pasos accionables para preparar declaraciones, cierres mensuales y paquetes para contador.
- Distinguir claramente entre deducciones autorizadas de la actividad, deducciones personales de declaracion anual y gastos que solo son referencia operativa.

Limites obligatorios:
- No presentes declaraciones, no calcules impuestos definitivos y no sustituyas a un contador publico.
- No inventes datos fiscales del cliente. Si no aparece en el contexto, dilo y pide la CSF o el dato necesario.
- Para cambios recientes de ley, Resolucion Miscelanea Fiscal, criterios SAT o Diario Oficial de la Federacion, advierte que debe verificarse contra DOF/SAT vigente antes de actuar.
- No prometas deducibilidad definitiva; habla de "posible", "generalmente", "requiere cumplir requisitos" y "validar con contador".
- No mezcles gastos personales con gastos de actividad empresarial. Si mencionas salud, educacion, intereses hipotecarios u otros conceptos personales, aclara que suelen revisarse como deducciones personales y no como gastos operativos del negocio.
- No des estrategias de evasion, simulacion, facturas falsas ni ocultamiento.

Estilo:
- Tono de contador practico, directo y claro.
- Responde en espanol.
- Usa bullets cortos cuando ayuden.
- Cierra con "Siguiente paso recomendado" cuando la pregunta implique accion.

Contexto del cliente:
${contextText}
`.trim();
}

function extractOutputText(responseJson: unknown): string {
  const data = responseJson as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (data.output_text) return data.output_text;

  const parts: string[] = [];
  for (const output of data.output || []) {
    for (const content of output.content || []) {
      if (content.type === 'output_text' && content.text) parts.push(content.text);
    }
  }

  return parts.join('\n').trim();
}

async function callOpenAI(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const input = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input,
      temperature: 0.2,
      max_output_tokens: 900,
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json?.error?.message || `OpenAI error ${response.status}`;
    throw new Error(message);
  }

  const text = extractOutputText(json);
  if (!text) throw new Error('OpenAI no regreso texto');
  return text;
}

async function saveConversation(args: {
  uid: string;
  companyId?: string | null;
  question: string;
  answer: string;
}) {
  const db = getAdminFirestore();
  if (!db) return;

  await db.collection('ai_accountant_threads').add({
    userId: args.uid,
    companyId: args.companyId || null,
    question: args.question,
    answer: args.answer,
    createdAt: FieldValue.serverTimestamp(),
    product: 'fmg-ai-accountant-mvp',
  });
}

export async function POST(request: NextRequest) {
  try {
    const uid = request.headers.get('x-user-uid');
    if (!uid) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const question = cleanText(body?.question);
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!question) {
      return NextResponse.json({ success: false, error: 'La pregunta es obligatoria' }, { status: 400 });
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { success: false, error: `La pregunta debe tener maximo ${MAX_QUESTION_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const user = await getUserProfileAdmin(uid);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    const company = user.companyId ? await getCompanyByIdAdmin(user.companyId) : null;
    const mondayBoardId = company?.mondayBoardId;
    const [board, receipts] = await Promise.all([
      mondayBoardId && isMondayBoardsConfigured()
        ? getAccountantBoardContext(mondayBoardId)
        : Promise.resolve(null),
      getRecentReceipts(uid),
    ]);

    const contextText = buildContextText({ user, company, board, receipts });
    const systemPrompt = buildSystemPrompt(contextText);

    const sanitizedHistory: ChatMessage[] = history
      .filter((message: ChatMessage) => message?.role === 'user' || message?.role === 'assistant')
      .slice(-MAX_HISTORY_MESSAGES)
      .map((message: ChatMessage) => ({
        role: message.role,
        content: cleanText(message.content).slice(0, 1200),
      }))
      .filter((message: ChatMessage) => message.content);

    const answer = await callOpenAI(systemPrompt, [
      ...sanitizedHistory,
      { role: 'user', content: question },
    ]);

    await saveConversation({
      uid,
      companyId: company?.id || null,
      question,
      answer,
    });

    return NextResponse.json({
      success: true,
      answer,
      context: {
        companyName: company?.name || user.companyName || null,
        hasCsf: Boolean(user.csfUploadedAt || company?.csfUrl || company?.cedulaUrl),
        mondayBoardId: mondayBoardId || null,
        receiptsCount: receipts.length + (board?.items.length || 0),
      },
    });
  } catch (error) {
    console.error('[AI Accountant] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al consultar el Contador IA',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
