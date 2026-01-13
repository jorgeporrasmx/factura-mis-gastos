'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLANS, PlanId } from '@/types/payments';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle,
  ArrowRight,
  Mail,
  MessageCircle,
  Calendar,
  UserPlus,
  LogIn,
} from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading } = useAuth();

  const transactionId = searchParams.get('transactionId');
  const subscriptionId = searchParams.get('subscriptionId');
  const planId = searchParams.get('plan') as PlanId;
  const email = searchParams.get('email') || '';

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
            Bienvenido a Factura Mis Gastos. Tu suscripción al plan{' '}
            <span className="font-semibold text-foreground">
              {plan?.name || 'seleccionado'}
            </span>{' '}
            está activa.
          </p>
        </div>

        {/* Detalles de la transaccion */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">
              Detalles de tu suscripción
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
                  <span className="text-muted-foreground">ID de transacción</span>
                  <span className="font-mono text-sm">{transactionId}</span>
                </div>
              )}

              {subscriptionId && (
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">ID de suscripción</span>
                  <span className="font-mono text-sm">{subscriptionId}</span>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Mail className="w-4 h-4 inline mr-2" />
                Hemos enviado un correo de confirmación con todos los detalles
                de tu compra y próximos pasos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceso a cuenta - Prominente */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  ¡Ya tienes acceso a tu portal!
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Configura tu cuenta
                </>
              )}
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : isAuthenticated && user ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Estás conectado como <strong>{user.email}</strong>.
                  Ahora puedes subir tu Constancia de Situación Fiscal y comenzar a cargar tus recibos.
                </p>
                <Link href="/portal">
                  <Button className="w-full gradient-bg hover:opacity-90">
                    Ir a mi portal
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Crea tu cuenta para acceder a tu portal y comenzar a subir tus recibos.
                  Solo toma unos segundos con Google o tu email.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/auth/registro?email=${encodeURIComponent(email)}&txn=${transactionId || ''}`}
                    className="flex-1"
                  >
                    <Button className="w-full gradient-bg hover:opacity-90">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear mi cuenta
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      Ya tengo cuenta
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proximos pasos - Solo si ya está autenticado */}
        {isAuthenticated && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-6">
                ¿Qué sigue?
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Sube tu Constancia Fiscal</h3>
                    <p className="text-sm text-muted-foreground">
                      Necesitamos tu CSF del SAT (máximo 3 meses de antigüedad)
                      para poder generar tus facturas correctamente.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Captura tus recibos</h3>
                    <p className="text-sm text-muted-foreground">
                      Toma fotos de tus recibos directamente desde tu celular
                      o súbelos desde tu galería.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Nosotros nos encargamos</h3>
                    <p className="text-sm text-muted-foreground">
                      Nuestro equipo gestionará las facturas CFDI correspondientes
                      a tus recibos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* CTA final */}
        <div className="text-center">
          {isAuthenticated ? (
            <Link href="/portal">
              <Button className="gradient-bg hover:opacity-90">
                Ir a mi portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href={`/auth/registro?email=${encodeURIComponent(email)}&txn=${transactionId || ''}`}>
              <Button className="gradient-bg hover:opacity-90">
                Crear mi cuenta
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}

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
