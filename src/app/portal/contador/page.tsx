'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, ShieldCheck, FileText, Receipt, Upload, X, Image as ImageIcon } from 'lucide-react';

type Attachment = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Pick<Attachment, 'name' | 'mimeType'>[];
};

type ContextState = {
  companyName?: string | null;
  hasCsf?: boolean;
  mondayBoardId?: string | null;
  receiptsCount?: number;
  fiscalUpdatesCount?: number;
  attachmentsCount?: number;
};

const SUGGESTIONS = [
  'Ensenme como usar el Contador IA para preparar mi declaracion mensual.',
  'Voy a subir una captura del SAT: dime que significa y cual es el siguiente paso.',
  'Que puedo deducir segun mi regimen y mi CSF?',
  'Revisa mis comprobantes y dime que me falta para el cierre mensual.',
];

const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE = 6 * 1024 * 1024;

export default function AccountantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Soy tu Contador IA de FMG. Para ayudarte mejor: 1) dime que quieres resolver, 2) comparte capturas del SAT, CFDI o facturacion cuando haya una pantalla especifica, y 3) dime si buscas declarar, deducir, facturar o corregir un error.',
    },
  ]);
  const [question, setQuestion] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ContextState>({});
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = (question.trim().length > 0 || attachments.length > 0) && !isLoading;

  const contextChips = useMemo(() => {
    const chips = [
      context.companyName ? `Empresa: ${context.companyName}` : null,
      context.hasCsf ? 'CSF detectada' : 'CSF pendiente/no detectada',
      context.mondayBoardId ? `Tablero ${context.mondayBoardId}` : null,
      typeof context.receiptsCount === 'number' ? `${context.receiptsCount} comprobantes en contexto` : null,
      typeof context.fiscalUpdatesCount === 'number' ? `${context.fiscalUpdatesCount} fuentes fiscales recientes` : null,
      typeof context.attachmentsCount === 'number' && context.attachmentsCount > 0
        ? `${context.attachmentsCount} captura(s) analizada(s)`
        : null,
    ];
    return chips.filter(Boolean) as string[];
  }, [context]);

  async function askAccountant(nextQuestion?: string) {
    const prompt = (nextQuestion || question).trim() || 'Analiza la captura adjunta y guiame paso a paso.';
    if ((!prompt && attachments.length === 0) || !user?.uid) return;

    setIsLoading(true);
    setError(null);
    setQuestion('');
    const currentAttachments = nextQuestion ? [] : attachments;
    setAttachments([]);

    const nextMessages: Message[] = [
      ...messages,
      {
        role: 'user',
        content: prompt,
        attachments: currentAttachments.map(({ name, mimeType }) => ({ name, mimeType })),
      },
    ];
    setMessages(nextMessages);

    try {
      const response = await fetch('/api/ai-accountant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': user.uid,
        },
        body: JSON.stringify({
          question: prompt,
          history: messages.slice(-8),
          attachments: currentAttachments,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.details || 'No se pudo consultar el Contador IA');
      }

      setContext(result.context || {});
      setMessages([...nextMessages, { role: 'assistant', content: result.answer }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setMessages(nextMessages);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  async function handleAttachmentChange(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files).slice(0, MAX_ATTACHMENTS - attachments.length);
    if (selected.length === 0) {
      setError(`Puedes adjuntar maximo ${MAX_ATTACHMENTS} capturas por consulta.`);
      return;
    }

    const nextAttachments: Attachment[] = [];
    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        setError('Por ahora solo acepta capturas en imagen: PNG, JPG, WEBP o GIF.');
        continue;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setError(`La captura ${file.name} pesa demasiado. Usa una imagen menor a 6 MB.`);
        continue;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('No se pudo leer la captura'));
        reader.readAsDataURL(file);
      });

      nextAttachments.push({
        name: file.name,
        mimeType: file.type,
        dataUrl,
      });
    }

    setAttachments((current) => [...current, ...nextAttachments].slice(0, MAX_ATTACHMENTS));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeAttachment(index: number) {
    setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    askAccountant();
  }

  return (
    <div>
      <PortalHeader title="Contador IA" />

      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <section className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Guia fiscal personalizada</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Usa tu informacion fiscal, comprobantes y capturas del SAT para guiarte paso a paso.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 md:min-w-[300px]">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Criterio experto
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <FileText className="w-4 h-4 text-blue-600" />
                CSF
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Receipt className="w-4 h-4 text-purple-600" />
                Recibos
              </div>
            </div>
          </div>

          {contextChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {contextChips.map((chip) => (
                <span key={chip} className="text-xs bg-blue-50 text-blue-800 rounded-full px-3 py-1">
                  {chip}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="grid md:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900">1. Pregunta con objetivo</p>
            <p className="text-xs text-gray-600 mt-1">Ejemplo: preparar declaracion, deducir gasto, facturar ticket o entender un error.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900">2. Sube capturas</p>
            <p className="text-xs text-gray-600 mt-1">SAT, visor CFDI, facturacion, declaraciones, pagos o mensajes de error.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900">3. Pide el siguiente paso</p>
            <p className="text-xs text-gray-600 mt-1">El contador te dira que revisar, que evidencia falta y que accion tomar.</p>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="h-[56vh] min-h-[420px] overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] md:max-w-[72%] rounded-xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 text-gray-900 border border-gray-200'
                  }`}
                >
                  {message.content}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {message.attachments.map((attachment) => (
                        <div
                          key={`${attachment.name}-${attachment.mimeType}`}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs ${
                            message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                          }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span className="truncate">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Revisando tu contexto fiscal...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isLoading}
                  onClick={() => askAccountant(suggestion)}
                  className="text-xs px-3 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 space-y-2">
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment, index) => (
                      <div key={`${attachment.name}-${index}`} className="flex items-center gap-2 rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-xs">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="max-w-[180px] truncate">{attachment.name}</span>
                        <button type="button" onClick={() => removeAttachment(index)} aria-label="Quitar captura">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Describe lo que quieres resolver o sube una captura del SAT para guiarte..."
                  className="min-h-[52px] max-h-36 w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={1200}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      if (canSubmit) askAccountant();
                    }
                  }}
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(event) => handleAttachmentChange(event.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || attachments.length >= MAX_ATTACHMENTS}
                onClick={() => fileInputRef.current?.click()}
                className="h-[52px] px-4"
                title="Adjuntar captura"
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button type="submit" disabled={!canSubmit} className="h-[52px] px-4">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>

            <p className="text-xs text-gray-500">
              Puedes adjuntar hasta 3 capturas por consulta. Guia fiscal personalizada con fuentes SAT/DOF cuando aplican. No presenta declaraciones ni ejecuta pagos.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
