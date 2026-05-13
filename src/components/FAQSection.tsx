'use client';

import { useState } from 'react';
import { LeadFormModal } from './LeadFormModal';

const faqs = [
  {
    question: "¿Qué es Factura Mis Gastos?",
    answer: "Factura Mis Gastos es un piloto asistido para empresas mexicanas que necesitan dejar de perder deducciones por comprobantes desordenados. Centralizamos recibos y facturas, los ordenamos por persona, empresa y mes, y cerramos con un reporte listo para revisar con tu contador."
  },
  {
    question: "¿Cómo funciona el servicio?",
    answer: "El proceso es simple: 1) tu equipo sube tickets, recibos o facturas, 2) FMG los concentra y ordena por usuario y periodo, 3) hacemos seguimiento de faltantes, y 4) entregamos un corte mensual con carpeta documental y reporte de revisión."
  },
  {
    question: "¿Cuánto cuesta el servicio?",
    answer: "Hoy manejamos tres ofertas: Diagnóstico de deducciones perdidas por $999 MXN una vez, Piloto FMG por $1,499 MXN/mes (hasta 3 usuarios y 100 comprobantes), y FMG Empresa por $2,499 MXN/mes (hasta 8 usuarios y 300 comprobantes)."
  },
  {
    question: "¿Para qué tipo de empresas es ideal?",
    answer: "Factura Mis Gastos es perfecto para empresas mexicanas con 3 a 15 empleados que generan gastos frecuentes: empresas de logística y transporte, equipos de ventas en campo, constructoras, consultorías, empresas de tecnología, y cualquier negocio con empleados que viajan o hacen compras para la empresa."
  },
  {
    question: "¿El proceso es automático o hay verificación humana?",
    answer: "Nuestro servicio incluye verificación humana en cada factura. A diferencia de sistemas 100% automatizados, nuestro equipo se asegura de que cada CFDI sea correcto y válido antes de entregarla. Esto garantiza que ningún gasto se quede sin facturar y que todas las facturas cumplan con los requisitos del SAT."
  },
  {
    question: "¿Puedo establecer límites de gasto y reglas de aprobación?",
    answer: "Sí. Puedes definir límites de gasto por empleado o categoría. Si un gasto excede el límite que defines, te notificamos para que lo apruebes antes de solicitar la factura. También puedes establecer categorías permitidas y cualquier política interna que necesites."
  },
  {
    question: "¿Se integra con mi sistema contable?",
    answer: "Todavía no. En este MVP no prometemos integración contable avanzada. Para el piloto entregamos carpeta documental ordenada y reporte mensual para que tu contador lo revise más fácil."
  },
  {
    question: "¿Cuánto tiempo tarda en generarse una factura?",
    answer: "El objetivo del piloto no es prometer facturación automática con el proveedor, sino orden operativo. Normalmente hacemos onboarding rápido y el primer corte mensual se define contigo desde el inicio para que el contador reciba la información a tiempo."
  },
  {
    question: "¿Es útil para gastos de viaje y viáticos?",
    answer: "¡Absolutamente! Los gastos de viaje (hoteles, vuelos, taxis, comidas) son los más difíciles de facturar porque el empleado está fuera de la oficina. Con Factura Mis Gastos, tu equipo solo envía el recibo desde donde esté y nosotros nos encargamos de conseguir la factura."
  },
  {
    question: "¿Cómo empiezo a usar el servicio?",
    answer: "Es muy fácil: 1) Elige el plan que mejor se adapte a tu empresa, 2) Completa el registro y proporciona los datos de facturación (RFC), 3) Comparte el número de WhatsApp o correo con tus empleados, 4) Comienza a recibir facturas organizadas. Puedes empezar hoy mismo."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="preguntas-frecuentes" aria-label="Preguntas frecuentes sobre Factura Mis Gastos" className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Preguntas{' '}
            <span className="gradient-text">frecuentes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resolvemos tus dudas sobre cómo funciona Factura Mis Gastos y cómo puede ayudar a tu empresa.
          </p>
        </header>

        <div className="space-y-4" role="list" aria-label="Lista de preguntas frecuentes">
          {faqs.map((faq, index) => (
            <article
              key={index}
              className="border border-border rounded-xl overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors"
              role="listitem"
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                aria-hidden={openIndex !== index}
              >
                <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            ¿Tienes más preguntas?
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Agendar diagnóstico
          </button>
        </div>
      </div>

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formType="callback"
      />
    </section>
  );
}
