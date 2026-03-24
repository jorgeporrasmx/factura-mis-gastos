'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Monitor, Mail, Camera, Clock, AlertTriangle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
  icon: React.ReactNode;
}

const employeeFaqs: FAQItem[] = [
  {
    icon: <MessageCircle className="w-4 h-4" />,
    question: '¿Cómo envío un recibo por WhatsApp?',
    answer: (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Toma una foto clara del recibo (formato JPG o PNG, NO PDF).</li>
        <li>Abre WhatsApp y busca el contacto de <strong>Factura Mis Gastos</strong>.</li>
        <li>Envía la foto del recibo como imagen (no como documento).</li>
        <li>Envía <strong>UN recibo por mensaje</strong>. No envíes varios en un solo mensaje.</li>
        <li>Recibirás una confirmación de que tu recibo fue recibido.</li>
      </ol>
    ),
  },
  {
    icon: <Monitor className="w-4 h-4" />,
    question: '¿Cómo envío un recibo por la plataforma web?',
    answer: (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Inicia sesión en tu portal de Factura Mis Gastos.</li>
        <li>Ve a la sección <strong>&quot;Recibos&quot;</strong> en el menú lateral.</li>
        <li>Haz clic en <strong>&quot;Subir recibo&quot;</strong>.</li>
        <li>Selecciona la imagen del recibo desde tu dispositivo.</li>
        <li>Puedes subir múltiples recibos a la vez desde la plataforma web.</li>
      </ol>
    ),
  },
  {
    icon: <Mail className="w-4 h-4" />,
    question: '¿Cómo envío un recibo por correo electrónico?',
    answer: (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Envía un correo a la dirección proporcionada por tu empresa.</li>
        <li>Adjunta las imágenes de los recibos (JPG o PNG).</li>
        <li>Puedes adjuntar múltiples recibos, cada uno como archivo independiente.</li>
      </ol>
    ),
  },
  {
    icon: <Camera className="w-4 h-4" />,
    question: '¿Qué requisitos debe cumplir la foto del recibo?',
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Formato:</strong> Solo JPG, JPEG o PNG. No se aceptan PDF.</li>
        <li><strong>Nitidez:</strong> El texto debe ser completamente legible.</li>
        <li><strong>Iluminación:</strong> Sin sombras, reflejos o zonas sobreexpuestas.</li>
        <li><strong>Encuadre:</strong> Todo el recibo debe ser visible, sin cortes.</li>
        <li><strong>Información visible:</strong> Nombre del comercio, fecha, importe total y concepto.</li>
        <li><strong>Código QR:</strong> Si el recibo tiene QR de facturación, inclúyelo en la misma foto.</li>
      </ul>
    ),
  },
  {
    icon: <Clock className="w-4 h-4" />,
    question: '¿Cuánto tiempo tengo para enviar un recibo?',
    answer: 'Debes enviar el recibo el MISMO DÍA de la compra y dentro del mismo mes calendario. Los recibos enviados fuera de plazo pueden ser rechazados.',
  },
  {
    icon: <Clock className="w-4 h-4" />,
    question: '¿En cuánto tiempo recibo mi factura?',
    answer: 'El tiempo promedio es de 24 a 48 horas hábiles desde que envías el recibo válido. Puede variar según la respuesta del proveedor.',
  },
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    question: '¿Qué pasa si mi recibo es de gasolina?',
    answer: 'El ticket de gasolina debe incluir los últimos 4 dígitos de la tarjeta utilizada para el pago O la placa del vehículo. Sin esta información no se podrá emitir la factura.',
  },
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    question: '¿Qué gastos NO se pueden facturar?',
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Gastos en el extranjero (solo transacciones en México).</li>
        <li>Comercio informal (tianguis, vendedores ambulantes).</li>
        <li>Tickets sin datos fiscales del emisor.</li>
      </ul>
    ),
  },
];

export function EmployeeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {employeeFaqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 pr-4">
                <span className="text-blue-600">{faq.icon}</span>
                <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-0">
                <div className="pl-7 text-gray-600 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
