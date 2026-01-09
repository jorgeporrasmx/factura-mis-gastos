'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLANS, PlanId } from '@/types/payments';
import {
  CheckCircle,
  ArrowRight,
  Mail,
  MessageCircle,
  Download,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();

  const transactionId = searchParams.get('transactionId');
  const subscriptionId = searchParams.get('subscriptionId');
  const planId = searchParams.get('plan') as PlanId;

  const plan = planId ? PLANS[planId] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Mensaje de exito */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            ¡Pago exitoso!
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Bienvenido a Factura Mis Gastos. Tu suscripcion al plan{' '}
            <span className="font-semibold text-foreground">
              {plan?.name || 'seleccionado'}
            </span>{' '}
            esta activa.
          </p>
        </div>

        {/* Detalles de la transaccion */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">
              Detalles de tu suscripcion
            </h2>

            <div className="space-y-3">
              {plan && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
              )}

              {plan && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Precio</span>
                  <span className="font-medium">
                    {plan.priceDisplay} {plan.unit}
                  </span>
                </div>
              )}

              {transactionId && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">ID de transaccion</span>
                  <span className="font-mono text-sm">{transactionId}</span>
                </div>
              )}

              {subscriptionId && (
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">ID de suscripcion</span>
                  <span className="font-mono text-sm">{subscriptionId}</span>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Mail className="w-4 h-4 inline mr-2" />
                Hemos enviado un correo de confirmacion con todos los detalles
                de tu compra y proximos pasos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Proximos pasos */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-6">
              ¿Que sigue?
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Configura tu cuenta</h3>
                  <p className="text-sm text-muted-foreground">
                    Recibiras un correo con instrucciones para configurar tu
                    cuenta y agregar a tu equipo.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Descarga la app</h3>
                  <p className="text-sm text-muted-foreground">
                    Disponible para iOS y Android. Comienza a capturar tus
                    recibos desde tu telefono.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Agenda una sesion de onboarding</h3>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo te ayudara a configurar todo para que
                    aproveches al maximo la plataforma.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones rapidas */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="https://calendly.com/facturamisgastos/asesoria"
            target="_blank"
            className="block"
          >
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Agendar onboarding</h3>
                  <p className="text-sm text-muted-foreground">
                    30 min con un asesor
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link
            href="https://wa.me/526143977690?text=Hola%2C%20acabo%20de%20suscribirme%20y%20tengo%20dudas"
            target="_blank"
            className="block"
          >
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Soporte por WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">
                    Respuesta inmediata
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recursos utiles */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">
              Recursos utiles
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium block">App iOS</span>
                  <span className="text-xs text-muted-foreground">
                    App Store
                  </span>
                </div>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium block">App Android</span>
                  <span className="text-xs text-muted-foreground">
                    Play Store
                  </span>
                </div>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium block">Guia de inicio</span>
                  <span className="text-xs text-muted-foreground">
                    PDF descargable
                  </span>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* CTA final */}
        <div className="text-center">
          <Link href="/comenzar">
            <Button className="gradient-bg hover:opacity-90">
              Ir a mi cuenta
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground mt-4">
            ¿Tienes preguntas?{' '}
            <a
              href="mailto:soporte@facturamisgastos.com"
              className="text-primary hover:underline"
            >
              soporte@facturamisgastos.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
