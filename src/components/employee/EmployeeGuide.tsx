'use client';

import { MessageCircle, Monitor, Mail, Camera, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmployeeGuide() {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">Bienvenido a Factura Mis Gastos</h3>
        <p className="text-sm text-blue-800">
          Tu empresa utiliza esta plataforma para gestionar la facturación de gastos.
          Solo necesitas enviar una foto de tu recibo y nosotros nos encargamos de obtener la factura CFDI.
        </p>
      </div>

      {/* Step 1: Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
          <h4 className="font-semibold text-gray-900">Crea tu perfil</h4>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 pl-11">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Regístrate con Google, correo electrónico o teléfono.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Ingresa tu número de WhatsApp (se usará para enviar recibos).
          </li>
        </ul>
      </div>

      {/* Step 2: Send receipts */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
          <h4 className="font-semibold text-gray-900">Envía tus recibos</h4>
        </div>
        <p className="text-sm text-gray-600 pl-11 mb-3">Tienes 3 opciones para enviar tus recibos:</p>

        <div className="space-y-3 pl-11">
          <div className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
            <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900 text-sm">WhatsApp</p>
              <p className="text-xs text-green-700">Envía la foto del recibo al número de WhatsApp de la empresa. Un recibo por mensaje.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
            <Monitor className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 text-sm">Plataforma Web</p>
              <p className="text-xs text-blue-700">Inicia sesión en tu portal y sube los recibos. Puedes subir varios a la vez.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-purple-50 rounded-lg p-3">
            <Mail className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-purple-900 text-sm">Correo electrónico</p>
              <p className="text-xs text-purple-700">Envía las imágenes adjuntas al correo indicado por tu empresa.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Photo tips */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
          <h4 className="font-semibold text-gray-900">Tips para tus fotos</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 pl-11">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Camera className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            Foto nítida y legible
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Camera className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            Sin sombras ni reflejos
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Camera className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            Recibo completo visible
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Camera className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            Solo JPG o PNG
          </div>
        </div>
      </div>

      {/* Download PDF */}
      <div className="text-center pt-2">
        <a href="/guia-empleado" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Ver guía completa (descargable)
          </Button>
        </a>
      </div>
    </div>
  );
}
