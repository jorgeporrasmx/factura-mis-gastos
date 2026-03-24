'use client';

import {
  MessageCircle,
  Monitor,
  Mail,
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileImage,
} from 'lucide-react';

export default function GuiaEmpleadoContent() {
  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print button - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-10">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          Descargar / Imprimir PDF
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12 print:px-4 print:py-4">
        {/* Header */}
        <div className="text-center mb-10 print:mb-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2 print:text-2xl">
            Factura Mis Gastos
          </h1>
          <h2 className="text-xl text-gray-700 font-medium print:text-lg">
            Guía Rápida del Empleado
          </h2>
          <div className="w-16 h-1 bg-blue-600 mx-auto mt-4" />
        </div>

        {/* Intro */}
        <div className="bg-blue-50 rounded-xl p-5 mb-8 print:bg-gray-100 print:mb-4 print:p-3">
          <p className="text-gray-700 text-sm leading-relaxed">
            Tu empresa utiliza <strong>Factura Mis Gastos</strong> para gestionar la facturación de gastos.
            Solo necesitas enviar una foto de tu recibo y nosotros nos encargamos de obtener la factura CFDI
            con el proveedor. Esta guía te explica cómo hacerlo paso a paso.
          </p>
        </div>

        {/* Section 1: Create Profile */}
        <section className="mb-8 print:mb-4">
          <div className="flex items-center gap-3 mb-4 print:mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <h3 className="text-lg font-bold text-gray-900">Crea tu perfil</h3>
          </div>
          <div className="pl-11 space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>Abre el enlace de invitación que te compartió tu empresa.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>Regístrate con tu cuenta de Google, correo electrónico o teléfono.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>Ingresa tu número de WhatsApp (10 dígitos). Se usará para que puedas enviar recibos.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>Haz clic en &quot;Unirme&quot; y listo. Tu perfil quedará vinculado a tu empresa.</p>
            </div>
          </div>
        </section>

        {/* Section 2: How to send receipts */}
        <section className="mb-8 print:mb-4">
          <div className="flex items-center gap-3 mb-4 print:mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <h3 className="text-lg font-bold text-gray-900">Envía tus recibos</h3>
          </div>

          <div className="pl-11 space-y-4">
            {/* WhatsApp */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50 print:bg-gray-50 print:p-2">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Por WhatsApp</h4>
              </div>
              <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                <li>Toma una foto clara del recibo.</li>
                <li>Envíala al número de WhatsApp de Factura Mis Gastos.</li>
                <li>Envía <strong>UN recibo por mensaje</strong>.</li>
                <li>Recibirás confirmación de recepción.</li>
              </ol>
            </div>

            {/* Web */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 print:bg-gray-50 print:p-2">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Por la Plataforma Web</h4>
              </div>
              <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                <li>Inicia sesión en tu portal.</li>
                <li>Ve a &quot;Recibos&quot; en el menú.</li>
                <li>Haz clic en &quot;Subir recibo&quot;.</li>
                <li>Puedes subir varios recibos a la vez.</li>
              </ol>
            </div>

            {/* Email */}
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 print:bg-gray-50 print:p-2">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Por Correo Electrónico</h4>
              </div>
              <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                <li>Envía un correo a la dirección indicada por tu empresa.</li>
                <li>Adjunta las imágenes de los recibos (JPG o PNG).</li>
                <li>Puedes adjuntar múltiples recibos como archivos independientes.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Section 3: Photo requirements */}
        <section className="mb-8 print:mb-4">
          <div className="flex items-center gap-3 mb-4 print:mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <h3 className="text-lg font-bold text-gray-900">Requisitos de la foto del recibo</h3>
          </div>

          <div className="pl-11">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2 text-gray-700">
                <FileImage className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Formato:</strong> Solo JPG, JPEG o PNG. No PDF.</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <Camera className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Nitidez:</strong> Texto completamente legible.</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <Camera className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Sin sombras:</strong> Sin reflejos ni zonas oscuras.</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <Camera className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Completo:</strong> Todo el recibo visible, sin cortes.</span>
              </div>
            </div>

            <div className="mt-4 bg-amber-50 rounded-lg p-3 border border-amber-200 print:bg-gray-50">
              <p className="text-sm text-amber-800">
                <strong>Información visible requerida:</strong> Nombre del comercio, fecha, importe total,
                concepto, y al menos un medio de contacto del comercio (web, email o teléfono).
              </p>
            </div>

            <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-200 print:bg-gray-50">
              <p className="text-sm text-blue-800">
                <strong>Código QR:</strong> Si tu recibo tiene un QR para facturar, toma UNA SOLA foto
                que incluya el recibo completo y el QR visible.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Timing */}
        <section className="mb-8 print:mb-4">
          <div className="flex items-center gap-3 mb-4 print:mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <h3 className="text-lg font-bold text-gray-900">Tiempos importantes</h3>
          </div>

          <div className="pl-11 space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Envío del recibo</p>
                <p>Envíalo el <strong>mismo día</strong> de la compra y dentro del <strong>mismo mes</strong>.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Tiempo de facturación</p>
                <p>Generalmente <strong>24 a 48 horas hábiles</strong> después de recibir tu recibo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Special cases */}
        <section className="mb-8 print:mb-4">
          <div className="flex items-center gap-3 mb-4 print:mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              5
            </div>
            <h3 className="text-lg font-bold text-gray-900">Casos especiales</h3>
          </div>

          <div className="pl-11 space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p><strong>Gasolina:</strong> El ticket debe incluir los últimos 4 dígitos de la tarjeta o la placa del vehículo.</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p><strong>Casetas de peaje:</strong> Se requiere el ticket con número de plaza, carril y hora.</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p><strong>No facturables:</strong> Gastos en el extranjero, comercio informal, tickets sin datos fiscales.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200 print:pt-3">
          <p className="text-sm text-gray-500">
            ¿Tienes dudas? Contacta al administrador de tu empresa o escríbenos por WhatsApp.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            facturamisgastos.com
          </p>
        </div>
      </div>
    </div>
  );
}
