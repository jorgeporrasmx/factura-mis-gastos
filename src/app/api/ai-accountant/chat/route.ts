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

type FiscalUpdate = {
  title: string;
  date?: string;
  url?: string;
  source: 'SAT' | 'DOF';
};

const MAX_QUESTION_LENGTH = 1200;
const MAX_HISTORY_MESSAGES = 8;
const SAT_RMF_2026_URL =
  'https://www.sat.gob.mx/minisitio/NormatividadRMFyRGCE/normatividad_rmf_rgce2026.html';
const DOF_HOME_URL = 'https://dof.gob.mx/';

function cleanText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&aacute;/gi, 'á')
    .replace(/&eacute;/gi, 'é')
    .replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó')
    .replace(/&uacute;/gi, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&ntilde;/gi, 'ñ')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&uuml;/gi, 'ü')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#173;/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(baseUrl: string, href?: string): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return undefined;
  }
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

async function fetchFiscalUpdates(): Promise<FiscalUpdate[]> {
  const updates: FiscalUpdate[] = [];

  try {
    const response = await fetch(SAT_RMF_2026_URL, { next: { revalidate: 60 * 60 * 6 } });
    if (response.ok) {
      const html = await response.text();
      const anchorRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*\((publicad[ao][^)]+)\)/gi;
      let match: RegExpExecArray | null;

      while ((match = anchorRegex.exec(html)) && updates.length < 14) {
        const title = decodeHtml(match[2]);
        if (!/RMF|Miscelánea|RMRMF|RGCE|RFA|Resolución/i.test(title)) continue;

        updates.push({
          source: 'SAT',
          title,
          date: decodeHtml(match[3]),
          url: absoluteUrl(SAT_RMF_2026_URL, match[1]),
        });
      }
    }
  } catch (error) {
    console.warn('[AI Accountant] No se pudo leer SAT RMF 2026:', error);
  }

  try {
    const response = await fetch(DOF_HOME_URL, { next: { revalidate: 60 * 60 * 6 } });
    if (response.ok) {
      const html = await response.text();
      const linkRegex = /<a[^>]+href="([^"]*nota_detalle[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match: RegExpExecArray | null;

      while ((match = linkRegex.exec(html)) && updates.length < 20) {
        const title = decodeHtml(match[2]);
        if (!/(SAT|SHCP|Fiscal|Federaci[oó]n|Contribuyente|Impuesto|ISR|IVA|C[oó]digo Fiscal|69-B|Miscel[aá]nea)/i.test(title)) {
          continue;
        }

        updates.push({
          source: 'DOF',
          title,
          url: absoluteUrl(DOF_HOME_URL, match[1].replace(/&amp;/g, '&')),
        });
      }
    }
  } catch (error) {
    console.warn('[AI Accountant] No se pudo leer DOF:', error);
  }

  return updates;
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
  fiscalUpdates: FiscalUpdate[];
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
      officialFiscalUpdates: {
        fetchedAt: new Date().toISOString(),
        sources: [
          'SAT Normatividad RMF/RGCE/RFA 2026',
          'DOF portada oficial filtrada por señales fiscales',
        ],
        items: args.fiscalUpdates,
      },
      fiscalKnowledgePolicy: {
        generalKnowledgeAllowed: true,
        curatedFiscalNotes: process.env.FMG_FISCAL_CONTEXT_NOTES || null,
        currentLawGuardrail:
          'Usa officialFiscalUpdates como contexto de actualidad. Si el caso depende de una publicacion especifica no incluida, pide fecha/documento o sugiere consultar esa fuente concreta, sin usarlo como salida evasiva.',
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
- Orientar con criterio experto sobre que puede facturar, que datos necesita, que puede ser deducible y que tratamiento conviene segun el regimen.
- Dar pasos accionables para preparar declaraciones, cierres mensuales y paquetes para contador.
- Distinguir claramente entre deducciones autorizadas de la actividad, deducciones personales de declaracion anual y gastos que solo son referencia operativa.
- Usar el contexto officialFiscalUpdates para mencionar publicaciones recientes de SAT/DOF cuando sean relevantes.

Limites obligatorios:
- No presentes declaraciones, no calcules impuestos definitivos y no sustituyas a un contador publico.
- No inventes datos fiscales del cliente. Si no aparece en el contexto, dilo y pide la CSF o el dato necesario.
- No abras ni cierres respuestas con "revisa con tu contador", "consulta a tu contador" o frases similares. Da primero tu analisis y consejo personalizado. Solo menciona validacion humana si hay riesgo, ambiguedad documental o decision definitiva de presentacion/pago.
- Para cambios recientes de ley, Resolucion Miscelanea Fiscal, criterios SAT o DOF: usa las fuentes oficiales incluidas; si falta una fuente especifica, di exactamente que falta verificar.
- No prometas deducibilidad definitiva; habla de "deducible si cumple requisitos", "normalmente procede", "normalmente no procede" o "requiere evidencia X".
- No mezcles gastos personales con gastos de actividad empresarial. Si mencionas salud, educacion, intereses hipotecarios u otros conceptos personales, aclara que suelen revisarse como deducciones personales y no como gastos operativos del negocio.
- No des estrategias de evasion, simulacion, facturas falsas ni ocultamiento.

Estilo:
- Tono de contador practico, directo y claro.
- Actua como experto: toma postura cuando el contexto sea suficiente.
- Responde en espanol.
- Usa bullets cortos cuando ayuden.
- Cierra con "Siguiente paso recomendado" cuando la pregunta implique accion. Ese cierre debe ser operativo, no una evasiva.

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
    const [board, receipts, fiscalUpdates] = await Promise.all([
      mondayBoardId && isMondayBoardsConfigured()
        ? getAccountantBoardContext(mondayBoardId)
        : Promise.resolve(null),
      getRecentReceipts(uid),
      fetchFiscalUpdates(),
    ]);

    const contextText = buildContextText({ user, company, board, receipts, fiscalUpdates });
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
        fiscalUpdatesCount: fiscalUpdates.length,
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
