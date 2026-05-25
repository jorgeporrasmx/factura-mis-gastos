'use client';

import { useState } from 'react';
import { getWhatsAppUrl } from '@/lib/whatsapp';

const faqs = [
  {
    question: "¿Qué es Factura Mis Gastos?",
    answer: "Factura Mis Gastos es para negocios con tickets y recibos desordenados. Mandas foto del recibo; lo facturamos, lo guardamos y cerramos el mes para tu contador."
  },
  {
    question: "¿Cómo funciona el servicio?",
    answer: "El flujo es simple: 1) mandas foto del recibo, 2) lo facturamos, 3) lo ordenamos en Drive y 4) queda registrado para tu corte mensual."
  },
  {
    question: "¿Cuánto cuesta el servicio?",
    answer: "Tenemos plan fundador desde $999 MXN/mes para hasta 30 recibos y FMG Recibo a Factura por $1,499 MXN/mes para hasta 75 recibos. FMG Empresa inicia en $2,499 MXN/mes para mayor volumen."
  },
  {
    question: "¿Para qué tipo de negocios es ideal?",
    answer: "Es ideal para negocios chicos y medianos con gastos frecuentes: restaurantes, talleres, gimnasios, servicios técnicos, construcción, consultorios, agencias, eventos, inmobiliarias y equipos comerciales."
  },
  {
    question: "¿Garantizan que todo recibo se puede facturar?",
    answer: "No. Algunos tickets no cumplen requisitos fiscales. En esos casos dejamos el comprobante ordenado y señalado para que tu contador decida el tratamiento correcto."
  },
  {
    question: "¿Sustituyen a mi contador?",
    answer: "No. FMG no sustituye a tu contador. Le entregamos un paquete más ordenado para que pueda revisar deducciones y trabajar con mejor información."
  },
  {
    question: "¿Qué necesito para empezar?",
    answer: "Solo necesitas mandar tus datos y tu primer recibo. Si aplica para tu negocio, activamos el flujo mensual y te damos instrucciones para enviar nuevos tickets durante el mes."
  },
  {
    question: "¿Por qué puede pagarse solo?",
    answer: "Porque muchos negocios ya hicieron el gasto, pero pierden la deducción por no facturar u ordenar a tiempo. Si FMG ayuda a recuperar comprobantes que antes se perdían, el servicio puede costar menos que el dinero que dejas fuera."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
          <a
            href={getWhatsAppUrl('Hola, tengo preguntas sobre Factura Mis Gastos y quiero revisar mi caso.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Revisar mi caso
          </a>
        </div>
      </div>
    </section>
  );
}
