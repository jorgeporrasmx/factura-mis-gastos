'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Calendar, ChevronDown, Bot, User } from 'lucide-react';

const WHATSAPP_NUMBER = '5216144273301';
const CALENDLY_URL = 'https://calendly.com/jorgeporras';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  options?: ChatOption[];
}

interface ChatOption {
  label: string;
  action: 'reply' | 'whatsapp' | 'calendar' | 'faq';
  value: string;
}

const FAQ_RESPONSES: Record<string, string> = {
  'que-es': '**Factura Mis Gastos** es una plataforma que convierte tus tickets y recibos en facturas fiscales deducibles de impuestos. Solo tomas una foto del ticket y nosotros nos encargamos del resto.',
  'como-funciona': 'Es muy sencillo:\n1. Tomas foto de tu ticket\n2. Lo subes a la plataforma\n3. Nosotros generamos tu factura en 24-48 hrs\n4. Recibes tu CFDI válido ante el SAT',
  'precios': 'Tenemos planes desde **$99/mes** para uso personal hasta planes corporativos. El plan más popular es el de Equipos a $299/mes que incluye hasta 50 facturas.',
  'tiempo': 'Las facturas se generan en un plazo de **24 a 48 horas hábiles** después de subir tu ticket.',
  'tickets': 'Puedes facturar tickets de: gasolina, restaurantes, supermercados, farmacias, estacionamientos, peajes, papelería, y muchos más establecimientos.',
};

const INITIAL_OPTIONS: ChatOption[] = [
  { label: '¿Qué es Factura Mis Gastos?', action: 'faq', value: 'que-es' },
  { label: '¿Cómo funciona?', action: 'faq', value: 'como-funciona' },
  { label: '¿Cuáles son los precios?', action: 'faq', value: 'precios' },
  { label: 'Hablar por WhatsApp', action: 'whatsapp', value: '' },
];

const SECONDARY_OPTIONS: ChatOption[] = [
  { label: '¿Cuánto tarda una factura?', action: 'faq', value: 'tiempo' },
  { label: '¿Qué tickets puedo facturar?', action: 'faq', value: 'tickets' },
  { label: 'Agendar una cita', action: 'calendar', value: '' },
  { label: 'Hablar por WhatsApp', action: 'whatsapp', value: '' },
];

export function WhatsAppWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (hasInteracted) return;

    const timer = setTimeout(() => {
      setIsExpanded(true);
      setTimeout(() => {
        if (!hasInteracted) {
          setIsExpanded(false);
        }
      }, 10000);
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: '¡Hola! Soy el asistente de Factura Mis Gastos. ¿En qué puedo ayudarte?',
          isBot: true,
          options: INITIAL_OPTIONS,
        },
      ]);
    }
  }, [isExpanded, messages.length]);

  const addBotMessage = (text: string, options?: ChatOption[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text,
          isBot: true,
          options,
        },
      ]);
    }, 800);
  };

  const handleOptionClick = (option: ChatOption) => {
    setHasInteracted(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: option.label,
        isBot: false,
      },
    ]);

    switch (option.action) {
      case 'faq':
        const response = FAQ_RESPONSES[option.value];
        addBotMessage(response, SECONDARY_OPTIONS);
        break;

      case 'whatsapp':
        addBotMessage('Te redirijo a WhatsApp para que hables con nuestro equipo.');
        setTimeout(() => {
          const message = encodeURIComponent(
            'Hola, me interesa Factura Mis Gastos. ¿Podrían darme más información?'
          );
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
        }, 1000);
        break;

      case 'calendar':
        addBotMessage('Te abro nuestro calendario para que agendes una cita con un asesor.');
        setTimeout(() => {
          window.open(CALENDLY_URL, '_blank');
        }, 1000);
        break;

      default:
        addBotMessage('¿Hay algo más en lo que pueda ayudarte?', SECONDARY_OPTIONS);
    }
  };

  const handleToggle = () => {
    setHasInteracted(true);
    setIsExpanded(!isExpanded);
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\d+\.\s/, (match) => `<span class="text-primary font-medium">${match}</span>`);
      return (
        <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="block" />
      );
    });
  };

  if (!isExpanded) {
    return (
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Abrir asistente virtual"
      >
        <Bot className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Asistente Virtual</p>
            <p className="text-blue-100 text-xs">Resuelvo dudas y agendo citas</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className="text-white/80 hover:text-white transition-colors p-1"
          aria-label="Minimizar"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[300px]">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex items-start gap-2 max-w-[85%] ${message.isBot ? '' : 'flex-row-reverse'}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isBot
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-gray-200'
                }`}
              >
                {message.isBot ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div>
                <div
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}
                >
                  {formatMessage(message.text)}
                </div>
                {message.options && (
                  <div className="mt-2 space-y-1.5">
                    {message.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        className="w-full text-left px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors flex items-center gap-2"
                      >
                        {option.action === 'whatsapp' && (
                          <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                        )}
                        {option.action === 'calendar' && (
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        {option.action === 'faq' && (
                          <span className="w-3.5 h-3.5 text-purple-500 font-bold text-center">?</span>
                        )}
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2">
          <Button
            onClick={() => handleOptionClick({ label: 'WhatsApp', action: 'whatsapp', value: '' })}
            size="sm"
            className="flex-1 bg-green-500 hover:bg-green-600 text-xs h-9"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            WhatsApp
          </Button>
          <Button
            onClick={() => handleOptionClick({ label: 'Agendar cita', action: 'calendar', value: '' })}
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-9"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Agendar cita
          </Button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-2">
          Powered by Factura Mis Gastos
        </p>
      </div>
    </div>
  );
}
