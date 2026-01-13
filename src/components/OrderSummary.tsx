'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Shield, Clock, Users } from 'lucide-react';
import { Plan, formatAmount } from '@/types/payments';

interface OrderSummaryProps {
  plan: Plan;
  showFeatures?: boolean;
}

export function OrderSummary({ plan, showFeatures = true }: OrderSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Resumen de tu orden</h3>
          {plan.popular && (
            <Badge className="gradient-bg">Recomendado</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan seleccionado */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-foreground">Plan {plan.name}</h4>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Precio</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">
                  {plan.priceDisplay}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  {plan.unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Caracteristicas del plan */}
        {showFeatures && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Incluye
            </h4>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Limites del plan */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-900">
              {plan.receiptsLimit === -1 ? 'Ilimitados' : plan.receiptsLimit}
            </p>
            <p className="text-xs text-blue-600">Recibos/mes</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-900">
              {plan.usersLimit === -1 ? 'Ilimitados' : plan.usersLimit}
            </p>
            <p className="text-xs text-purple-600">Usuarios</p>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Subtotal</span>
            <span>{plan.priceDisplay} {plan.unit}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
            <span>IVA (16%)</span>
            <span>
              {plan.price > 0
                ? formatAmount(Math.round(plan.price * 0.16))
                : 'Incluido'}
            </span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
            <span>Total a pagar</span>
            <span className="text-primary">
              {plan.price > 0
                ? formatAmount(Math.round(plan.price * 1.16))
                : plan.priceDisplay}
            </span>
          </div>
        </div>

        {/* Garantias */}
        <div className="bg-green-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Pago 100% seguro</span>
          </div>
          <ul className="text-xs text-green-700 space-y-1 ml-6">
            <li>Encriptacion SSL de 256 bits</li>
            <li>Procesado por First Data</li>
            <li>Sin almacenamiento de datos de tarjeta</li>
          </ul>
        </div>

        {/* Politicas */}
        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>
            Al continuar, aceptas nuestros{' '}
            <a href="/terminos" className="text-primary hover:underline">
              Terminos de Servicio
            </a>{' '}
            y{' '}
            <a href="/privacidad" className="text-primary hover:underline">
              Politica de Privacidad
            </a>
          </p>
          <p>
            Puedes cancelar tu suscripcion en cualquier momento
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente compacto para mostrar en modales
export function OrderSummaryCompact({ plan }: { plan: Plan }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">Plan {plan.name}</h4>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        </div>
        {plan.popular && (
          <Badge className="gradient-bg text-xs">Recomendado</Badge>
        )}
      </div>

      <div className="flex justify-between items-baseline pt-3 border-t border-slate-200">
        <span className="text-sm text-muted-foreground">Total mensual</span>
        <div>
          <span className="text-xl font-bold">{plan.priceDisplay}</span>
          <span className="text-sm text-muted-foreground ml-1">{plan.unit}</span>
        </div>
      </div>
    </div>
  );
}
