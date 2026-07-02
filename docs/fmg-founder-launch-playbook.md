# FMG Freelancer Founder - Playbook de lanzamiento piloto

Objetivo: vender y operar los primeros clientes del plan Freelancer Founder sin depender todavía de automatización perfecta.

## Criterio de lanzamiento

Lanzar hoy como piloto asistido si se cumplen estas condiciones:

- Landing y checkout responden en producción.
- Checkout registra transacción, suscripción, empresa/personal account y usuario pendiente.
- Monday recibe alta operativa o el fallo queda registrado sin bloquear el pago.
- Success page manda al cliente a crear cuenta con el mismo email.
- Equipo puede atender manualmente altas durante el día.

No lanzar tráfico pagado amplio hasta confirmar First Data en producción con una tarjeta real y conciliación bancaria.

## Flujo cliente

1. Cliente entra a `/checkout/freelancer`.
2. Paga el plan Founder.
3. El sistema guarda:
   - `payment_transactions/{transactionId}`
   - `subscriptions/{subscriptionId}`
   - `companies/{companyId}`
   - `pending_users/{hashEmail}`
4. El cliente llega a `/checkout/success`.
5. Crea cuenta con el mismo email de compra.
6. El portal reclama el `pending_user` y liga el usuario a su empresa/cuenta personal.
7. Cliente sube CSF.
8. Cliente sube primer recibo.
9. Equipo valida y acompaña el primer ciclo.

## Alta operativa interna

Cuando entra un pago:

- Revisar item nuevo en Monday.
- Confirmar transactionId/subscriptionId.
- Confirmar si el ambiente First Data fue sandbox o production.
- Confirmar que el cliente creó cuenta.
- Si no creó cuenta en 30 minutos, escribir por WhatsApp.
- Pedir CSF si no está cargada.
- Revisar que tenga carpeta Drive y tablero Monday si aplica.
- Pedir primer recibo y acompañar la carga.

## Mensaje WhatsApp post-compra

Hola, soy del equipo de Factura Mis Gastos.

Ya vimos tu alta al plan Freelancer Founder. Para dejarte operando hoy necesito:

1. Que crees tu cuenta con el mismo email de compra.
2. Que subas tu Constancia de Situación Fiscal actualizada.
3. Que subas tu primer recibo o captura SAT/CFDI.

Con eso dejamos listo tu portal, tu Contador IA y tu primer flujo de facturación.

## Límites del plan Founder

- Precio: $150 MXN/mes más IVA si aplica en checkout.
- Hasta 30 facturas/recibos al mes.
- 1 usuario.
- Incluye portal, carga de recibos, guía fiscal con CSF, checklist mensual y Contador IA.
- No incluye presentación formal de declaraciones.
- No sustituye revisión de contador público en casos de riesgo o actos definitivos ante SAT.

## Checklist de prueba antes de campaña

- `/` responde 200.
- `/checkout/freelancer` responde 200.
- Pago dummy/test aprobado solo en ambiente controlado.
- Pago real pequeño confirmado antes de tráfico público.
- `payment_transactions` recibe registro.
- `subscriptions` recibe registro.
- `pending_users` recibe registro.
- Usuario nuevo con mismo email queda ligado a empresa/cuenta.
- CSF upload funciona.
- Upload de recibo funciona.
- Contador IA responde con contexto de CSF.

## Pendientes para escalar

- Confirmar First Data production y conciliación.
- Implementar webhooks reales para rechazos, refunds, voids y chargebacks.
- Tokenizar tarjeta si se automatizarán renovaciones.
- Enviar email transaccional real de confirmación.
- Automatizar creación/verificación de Drive y tablero Monday por cliente.
- Dashboard interno de altas/pagos fallidos.
