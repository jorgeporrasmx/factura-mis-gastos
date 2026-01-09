'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PaymentForm, PaymentFormData } from '@/components/PaymentForm';
import { OrderSummary } from '@/components/OrderSummary';
import { PLANS, PlanId, CheckoutRequest, CheckoutResponse } from '@/types/payments';
import { ArrowLeft, Shield } from 'lucide-react';

interface CheckoutPageProps {
  params: Promise<{ planId: string }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Obtener el plan
  const planId = resolvedParams.planId as PlanId;
  const plan = PLANS[planId];

  // Si el plan no existe o es corporativo, redirigir
  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan no encontrado</h1>
          <Link href="/#precios" className="text-primary hover:underline">
            Ver planes disponibles
          </Link>
        </div>
      </div>
    );
  }

  if (plan.isCustom) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Plan Corporativo</h1>
          <p className="text-muted-foreground mb-6">
            El plan Corporativo requiere una cotizacion personalizada.
            Contactanos para diseñar la solucion perfecta para tu empresa.
          </p>
          <div className="space-y-3">
            <Link
              href="https://wa.me/526143977690?text=Hola%2C%20me%20interesa%20el%20plan%20Corporativo"
              target="_blank"
              className="block w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-3 px-4 font-medium transition-colors"
            >
              Contactar por WhatsApp
            </Link>
            <Link
              href="/#precios"
              className="block w-full border border-slate-300 hover:bg-slate-100 rounded-lg py-3 px-4 font-medium transition-colors"
            >
              Ver otros planes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const request: CheckoutRequest = {
        planId,
        customer: {
          email: data.customer.email,
          name: data.customer.name,
          phone: data.customer.phone,
          company: data.customer.company,
        },
        card: data.card,
      };

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: CheckoutResponse = await response.json();

      if (result.success) {
        // Redirigir a la pagina de exito
        router.push(
          `/checkout/success?` +
            `transactionId=${result.transactionId}&` +
            `subscriptionId=${result.subscriptionId}&` +
            `plan=${planId}`
        );
      } else {
        setError(result.message || 'Error procesando el pago');
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      setError('Error de conexion. Verifica tu internet e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/#precios"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a planes</span>
            </Link>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Pago seguro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Completa tu suscripcion
          </h1>
          <p className="text-muted-foreground mt-2">
            Estas a un paso de comenzar a optimizar tus gastos con Factura Mis Gastos
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario de pago */}
          <div className="lg:col-span-2">
            <PaymentForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
              submitButtonText={`Pagar ${plan.priceDisplay} ${plan.unit}`}
            />
          </div>

          {/* Resumen de orden */}
          <div className="lg:col-span-1">
            <OrderSummary plan={plan} />
          </div>
        </div>
      </main>

      {/* Footer minimo */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>&copy; 2024 Factura Mis Gastos</span>
              <Link href="/privacidad" className="hover:text-foreground">
                Privacidad
              </Link>
              <Link href="/terminos" className="hover:text-foreground">
                Terminos
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Procesado de forma segura por First Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
