'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, ShieldCheck, FileText, Receipt } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ContextState = {
  companyName?: string | null;
  hasCsf?: boolean;
  mondayBoardId?: string | null;
  receiptsCount?: number;
  fiscalUpdatesCount?: number;
};

const SUGGESTIONS = [
  'Que regimen fiscal tengo y que implica para mis gastos?',
  'Que puedo deducir segun mi perfil fiscal?',
  'Que datos necesito para facturar un ticket?',
  'Que me falta para preparar mi cierre mensual?',
];

export default function AccountantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Soy tu Contador IA de FMG. Analizo tu perfil fiscal, tus comprobantes y reglas fiscales mexicanas para darte una guia practica y personalizada.',
    },
  ]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ContextState>({});
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSubmit = question.trim().length > 0 && !isLoading;

  const contextChips = useMemo(() => {
    const chips = [
      context.companyName ? `Empresa: ${context.companyName}` : null,
      context.hasCsf ? 'CSF detectada' : 'CSF pendiente/no detectada',
      context.mondayBoardId ? `Tablero ${context.mondayBoardId}` : null,
      typeof context.receiptsCount === 'number' ? `${context.receiptsCount} comprobantes en contexto` : null,
      typeof context.fiscalUpdatesCount === 'number' ? `${context.fiscalUpdatesCount} fuentes fiscales recientes` : null,
    ];
    return chips.filter(Boolean) as string[];
  }, [context]);

  async function askAccountant(nextQuestion?: string) {
    const prompt = (nextQuestion || question).trim();
    if (!prompt || !user?.uid) return;

    setIsLoading(true);
    setError(null);
    setQuestion('');

    const nextMessages: Message[] = [...messages, { role: 'user', content: prompt }];
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
                  Usa tu informacion fiscal y comprobantes de FMG para responder dudas practicas.
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
              <textarea
                ref={inputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Pregunta sobre tu regimen, deducciones, facturas o cierre mensual..."
                className="min-h-[52px] max-h-36 flex-1 resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1200}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (canSubmit) askAccountant();
                  }
                }}
              />
              <Button type="submit" disabled={!canSubmit} className="h-[52px] px-4">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>

            <p className="text-xs text-gray-500">
              Guia fiscal personalizada con fuentes SAT/DOF cuando aplican. No presenta declaraciones ni ejecuta pagos.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
