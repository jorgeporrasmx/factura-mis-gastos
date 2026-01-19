'use client';

import { useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { ChevronDown, ChevronUp, FileImage, Clock, AlertCircle, CheckCircle, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import { TermsModal } from '@/components/TermsModal';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
  category: string;
}

const faqItems: FAQItem[] = [
  // Requisitos de recibos
  {
    category: 'Requisitos de Recibos',
    question: '¿Qué formatos de imagen acepta el sistema?',
    answer: 'Únicamente aceptamos imágenes en formato JPG, JPEG o PNG. No se aceptan archivos PDF bajo ninguna circunstancia. Los recibos en PDF serán rechazados automáticamente sin posibilidad de reprocesamiento.',
  },
  {
    category: 'Requisitos de Recibos',
    question: '¿Qué información debe ser visible en el recibo?',
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Nombre o razón social del comercio</li>
        <li>Fecha de la transacción (día, mes y año)</li>
        <li>Importe total de la compra (incluyendo IVA)</li>
        <li>Concepto o descripción de los productos/servicios</li>
        <li>Dirección del establecimiento (cuando esté disponible)</li>
        <li>Al menos un medio de contacto para facturación (web, email o teléfono)</li>
      </ul>
    ),
  },
  {
    category: 'Requisitos de Recibos',
    question: '¿Qué calidad debe tener la imagen del recibo?',
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Nitidez:</strong> El texto debe ser completamente legible, sin desenfoques.</li>
        <li><strong>Iluminación:</strong> Evitar sombras, reflejos o zonas sobreexpuestas.</li>
        <li><strong>Encuadre:</strong> El recibo completo debe estar visible, sin cortes.</li>
        <li><strong>Orientación:</strong> La imagen debe estar correctamente orientada (no de lado ni invertida).</li>
      </ul>
    ),
  },
  {
    category: 'Requisitos de Recibos',
    question: '¿Qué hago si mi recibo tiene un código QR para facturar?',
    answer: 'Cuando el recibo incluya un código QR que dirija a un portal externo de facturación, debes tomar UNA SOLA fotografía que incluya tanto el recibo completo como el código QR visible en la misma imagen. No se aceptarán imágenes separadas del recibo y del QR.',
  },
  // Tiempos de envío
  {
    category: 'Tiempos y Envío',
    question: '¿Cuánto tiempo tengo para enviar un recibo?',
    answer: 'Los recibos deben enviarse el MISMO DÍA de la compra y dentro del mismo mes calendario. Por ejemplo, un recibo del 15 de enero debe enviarse el 15 de enero y no después del 31 de enero. Los recibos enviados fuera de estos plazos podrán ser rechazados.',
  },
  {
    category: 'Tiempos y Envío',
    question: '¿Por qué canales puedo enviar mis recibos?',
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Plataforma web (RECOMENDADO):</strong> Puedes subir múltiples recibos simultáneamente.</li>
        <li><strong>WhatsApp:</strong> Se debe enviar UN recibo por mensaje. No se procesarán múltiples recibos en un solo mensaje.</li>
        <li><strong>Correo electrónico:</strong> Puedes adjuntar múltiples recibos, cada uno como archivo independiente.</li>
      </ul>
    ),
  },
  {
    category: 'Tiempos y Envío',
    question: '¿En cuánto tiempo recibo mi factura?',
    answer: 'El tiempo promedio de gestión es de 24 a 48 horas hábiles desde la recepción del recibo válido. Este tiempo puede variar dependiendo de la capacidad de respuesta del proveedor.',
  },
  // Casos especiales
  {
    category: 'Casos Especiales',
    question: '¿Qué información necesito para facturar gasolina?',
    answer: 'El ticket de gasolina debe incluir los últimos 4 dígitos de la tarjeta utilizada para el pago O la placa del vehículo. Sin esta información, la gasolinera no podrá emitir el CFDI conforme a las disposiciones del SAT.',
  },
  {
    category: 'Casos Especiales',
    question: '¿Puedo facturar tickets de estacionamiento?',
    answer: 'Sí, se aceptan tickets de estacionamientos que cuenten con sistema de facturación. Los tickets de máquinas expendedoras sin datos fiscales no son facturables.',
  },
  {
    category: 'Casos Especiales',
    question: '¿Qué información necesito para facturar casetas de peaje?',
    answer: 'Se requiere el ticket con número de plaza, carril y hora de cruce.',
  },
  {
    category: 'Casos Especiales',
    question: '¿Qué gastos NO son facturables?',
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Gastos en el extranjero:</strong> Solo procesamos recibos de transacciones en México.</li>
        <li><strong>Comercio informal:</strong> Tianguis, mercados sobre ruedas, vendedores ambulantes.</li>
        <li><strong>Tickets sin datos fiscales:</strong> Comprobantes que no incluyan información del emisor ni medios de contacto.</li>
      </ul>
    ),
  },
  // Rechazos y conteo
  {
    category: 'Rechazos y Conteo',
    question: '¿Cuándo se rechaza un recibo y cómo afecta mi límite mensual?',
    answer: (
      <div className="space-y-3">
        <p><strong>Rechazos que cuentan como 1 recibo:</strong></p>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Formato incorrecto (PDF u otro no permitido)</li>
          <li>Imagen ilegible, borrosa o incompleta</li>
          <li>Falta de información de contacto del proveedor</li>
          <li>Recibo enviado fuera del plazo</li>
          <li>QR externo no incluido en la misma imagen</li>
          <li>Múltiples recibos en un solo mensaje de WhatsApp</li>
        </ul>
        <p><strong>Rechazos que cuentan como 0.5 recibos:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proveedor no responde después de 2 intentos</li>
          <li>Proveedor no emite CFDI</li>
          <li>Plazo de facturación expirado en el sistema del proveedor</li>
          <li>Error técnico del portal de facturación del proveedor</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'Rechazos y Conteo',
    question: '¿Qué garantía tengo de obtener mi factura?',
    answer: 'Si tu recibo cumple con TODOS los requisitos y el proveedor emite facturas, garantizamos la obtención del CFDI. Si no logramos obtener la factura por causas imputables a nuestra gestión, ese recibo NO contará en tu límite mensual.',
  },
  // Datos fiscales
  {
    category: 'Datos Fiscales',
    question: '¿Qué datos fiscales necesito proporcionar?',
    answer: (
      <ul className="list-disc pl-5 space-y-1">
        <li>RFC (Registro Federal de Contribuyentes)</li>
        <li>Razón social o nombre completo</li>
        <li>Código postal fiscal</li>
        <li>Régimen fiscal</li>
        <li>Uso de CFDI</li>
      </ul>
    ),
  },
  {
    category: 'Datos Fiscales',
    question: '¿Qué es la Constancia de Situación Fiscal (CSF)?',
    answer: 'Es un documento emitido por el SAT que certifica tu situación fiscal actual. Necesitamos una CSF con máximo 3 meses de antigüedad para poder procesar tus recibos y garantizar que los datos de facturación sean correctos.',
  },
  // Respaldo
  {
    category: 'Respaldo de Documentos',
    question: '¿Por cuánto tiempo conservan mis documentos?',
    answer: 'Conservamos una copia de todos los recibos recibidos y CFDI obtenidos durante la vigencia de tu servicio. Una vez terminada la relación comercial, los archivos se mantienen por 30 días naturales. Te recomendamos mantener tus propios respaldos de los CFDI.',
  },
];

const categories = [...new Set(faqItems.map(item => item.category))];

export default function AyudaPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = selectedCategory
    ? faqItems.filter(item => item.category === selectedCategory)
    : faqItems;

  const categoryIcons: Record<string, React.ReactNode> = {
    'Requisitos de Recibos': <FileImage className="w-4 h-4" />,
    'Tiempos y Envío': <Clock className="w-4 h-4" />,
    'Casos Especiales': <AlertCircle className="w-4 h-4" />,
    'Rechazos y Conteo': <CheckCircle className="w-4 h-4" />,
    'Datos Fiscales': <HelpCircle className="w-4 h-4" />,
    'Respaldo de Documentos': <HelpCircle className="w-4 h-4" />,
  };

  return (
    <div>
      <PortalHeader title="Ayuda y FAQ" />

      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centro de Ayuda</h2>
          <p className="text-gray-600 mt-1">
            Encuentra respuestas a las preguntas más frecuentes sobre nuestro servicio.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryIcons[category]}
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.map((item, index) => {
            const globalIndex = faqItems.indexOf(item);
            const isOpen = openItems.includes(globalIndex);

            return (
              <div
                key={globalIndex}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(globalIndex)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 pr-4">
                    <span className="text-blue-600 mt-0.5">
                      {categoryIcons[item.category]}
                    </span>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">
                        {item.category}
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.question}
                      </span>
                    </div>
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
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Nuestro equipo de soporte está listo para ayudarte.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:soporte@facturamisgastos.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              soporte@facturamisgastos.com
            </a>
            <a
              href="https://wa.me/521234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Horario de atención: Lunes a viernes de 9:00 a 18:00 hrs (Centro de México)
          </p>
        </div>

        {/* Terms link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <button
            onClick={() => setIsTermsModalOpen(true)}
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Ver Términos y Condiciones completos
          </button>
        </div>
      </div>

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
}
