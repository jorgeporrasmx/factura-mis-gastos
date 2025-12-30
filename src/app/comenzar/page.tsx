'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    id: 'basico',
    name: "Básico",
    tagline: "Paga solo lo que facturas.",
    price: "$10",
    priceValue: 10,
    unit: "MXN por factura",
    description: "Ideal para equipos pequeños o flujo variable.",
    features: [
      "Sin costo mensual fijo",
      "Reporte mensual incluido",
      "Envío por WhatsApp o correo",
      "Soporte por correo"
    ],
    popular: false
  },
  {
    id: 'equipos',
    name: "Equipos",
    tagline: "Para empresas con gastos recurrentes.",
    price: "$990",
    priceValue: 990,
    unit: "MXN/mes",
    description: "Hasta 150 recibos y 5 empleados.",
    features: [
      "150 recibos mensuales",
      "Hasta 5 empleados",
      "Reportes por empleado",
      "Reglas de aprobación",
      "Dashboard de control",
      "Soporte prioritario"
    ],
    popular: true
  },
  {
    id: 'empresa',
    name: "Empresa",
    tagline: "Control total para operaciones más grandes.",
    price: "$1,990",
    priceValue: 1990,
    unit: "MXN/mes",
    description: "1,000 recibos, 15 empleados, múltiples RFCs.",
    features: [
      "1,000 recibos mensuales",
      "Hasta 15 empleados",
      "3 RFCs incluidos",
      "Integración contable opcional",
      "Reportes por departamento",
      "API disponible",
      "Soporte dedicado"
    ],
    popular: false
  }
];

const paymentMethods = [
  {
    id: 'card',
    name: 'Tarjeta de crédito/débito',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'transfer',
    name: 'Transferencia bancaria',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
    description: 'SPEI o depósito bancario'
  },
  {
    id: 'oxxo',
    name: 'Pago en OXXO',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    description: 'Genera tu ficha de pago'
  }
];

export default function ComenzarPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep(2);
    // Scroll suave a la sección de pago
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
  };

  const handleContinue = () => {
    if (selectedPlan && selectedPayment) {
      // Aquí se integrará con el sistema de pagos
      alert(`Próximamente: Integración de pago para el plan ${selectedPlan} con ${selectedPayment}`);
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">Factura Mis Gastos</span>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Volver al inicio
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Comienza a{' '}
            <span className="gradient-text">facturar tus gastos</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecciona el plan que mejor se adapte a tu empresa y completa tu registro en minutos.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'gradient-bg text-white' : 'bg-slate-200'}`}>
              1
            </div>
            <span className="hidden sm:inline font-medium">Elige tu plan</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'gradient-bg text-white' : 'bg-slate-200'}`}>
              2
            </div>
            <span className="hidden sm:inline font-medium">Método de pago</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'gradient-bg text-white' : 'bg-slate-200'}`}>
              3
            </div>
            <span className="hidden sm:inline font-medium">Confirmar</span>
          </div>
        </div>

        {/* Plans selection */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            1. Selecciona tu plan
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative bg-white border shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'ring-2 ring-primary shadow-lg border-primary'
                    : plan.popular
                    ? 'ring-2 ring-primary/50 shadow-lg border-0'
                    : 'border-border'
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg">
                    Recomendado
                  </Badge>
                )}
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-primary font-medium">{plan.tagline}</p>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.unit}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Payment section */}
        {selectedPlan && (
          <section id="payment-section" className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              2. Selecciona tu método de pago
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="grid gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? 'border-primary bg-blue-50'
                        : 'border-border bg-white hover:border-primary/50'
                    }`}
                    onClick={() => handlePaymentSelect(method.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedPayment === method.id ? 'gradient-bg text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* How to pay instructions */}
              {selectedPayment && (
                <div className="mt-8 p-6 bg-white rounded-xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ¿Cómo funciona el pago?
                  </h3>
                  {selectedPayment === 'card' && (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>1. Al continuar, serás redirigido a nuestra pasarela de pago segura.</p>
                      <p>2. Ingresa los datos de tu tarjeta de crédito o débito.</p>
                      <p>3. El cargo se realizará de forma inmediata y recibirás confirmación por correo.</p>
                      <p>4. Para planes mensuales, el cargo se renovará automáticamente cada mes.</p>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Pago 100% seguro con encriptación SSL</span>
                      </div>
                    </div>
                  )}
                  {selectedPayment === 'transfer' && (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>1. Te proporcionaremos los datos bancarios para realizar la transferencia.</p>
                      <p>2. Realiza el pago por SPEI o depósito bancario.</p>
                      <p>3. Envíanos el comprobante de pago por correo o WhatsApp.</p>
                      <p>4. Tu cuenta será activada en un máximo de 24 horas hábiles.</p>
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                        <p className="font-medium text-foreground mb-2">Datos bancarios:</p>
                        <p>Banco: BBVA</p>
                        <p>Cuenta: 0123456789</p>
                        <p>CLABE: 012345678901234567</p>
                        <p>Beneficiario: Factura Mis Gastos S.A. de C.V.</p>
                      </div>
                    </div>
                  )}
                  {selectedPayment === 'oxxo' && (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>1. Al continuar, generaremos una ficha de pago con código de barras.</p>
                      <p>2. Presenta la ficha en cualquier tienda OXXO.</p>
                      <p>3. Realiza el pago en efectivo (comisión de $10 MXN).</p>
                      <p>4. Tu cuenta será activada automáticamente en un máximo de 24 horas.</p>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t text-amber-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>La ficha tiene validez de 3 días</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Summary and confirm */}
        {selectedPlan && selectedPayment && (
          <section className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              3. Resumen de tu pedido
            </h2>
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-foreground">Plan {selectedPlanData?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPlanData?.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{selectedPlanData?.price}</p>
                  <p className="text-sm text-muted-foreground">{selectedPlanData?.unit}</p>
                </div>
              </div>
              <div className="py-4 border-b border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Método de pago</span>
                  <span className="font-medium text-foreground">
                    {paymentMethods.find(m => m.id === selectedPayment)?.name}
                  </span>
                </div>
              </div>
              <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold text-foreground">Total a pagar</span>
                  <span className="text-2xl font-bold gradient-text">{selectedPlanData?.price} MXN</span>
                </div>
                <Button
                  className="w-full gradient-bg hover:opacity-90 text-lg py-6 h-auto"
                  onClick={handleContinue}
                >
                  Continuar al pago
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Al continuar, aceptas nuestros{' '}
                  <a href="#" className="text-primary hover:underline">Términos y Condiciones</a>
                  {' '}y{' '}
                  <a href="#" className="text-primary hover:underline">Política de Privacidad</a>
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-8 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Pago seguro
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Factura incluida
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Cancela cuando quieras
              </div>
            </div>
          </section>
        )}

        {/* Help section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            ¿Tienes dudas?{' '}
            <a
              href="https://calendly.com/facturamisgastos/asesoria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              Habla con un asesor
            </a>
            {' '}o escríbenos a{' '}
            <a href="mailto:hola@facturamisgastos.com" className="text-primary font-medium hover:underline">
              hola@facturamisgastos.com
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Factura Mis Gastos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
