# Validación local y operativa — solicitud de factura por WhatsApp

Fecha: 2026-07-29 a 2026-07-30  
Rama: `feat/fmg-whatsapp-invoice-requests`

## Alcance validado

Flujo exclusivamente saliente:

1. Aceptar solamente eventos del tablero `8964055261`, columna `proyecto`,
   cuyo nuevo valor sea `WhatsApp`.
2. Cargar teléfono, fecha, total e imagen del recibo.
3. Reservar atómicamente una clave por tablero, elemento y plantilla en
   Firestore antes de cualquier llamada a Meta.
4. Adjuntar el recibo como imagen de encabezado y enviar la plantilla
   `solicitud_factura_jorge_recibo` en `es_MX`.
5. Guardar el ID de Meta y el estado mínimo en Firestore y Monday.
6. Bloquear reintentos automáticos, incluidos eventos concurrentes y
   respuestas inciertas de Meta.
7. Mantener el envío real deshabilitado por defecto; el modo de prueba solo
   permite el ID de elemento declarado expresamente.

Quedaron eliminados el webhook receptor de Meta, la descarga de respuestas,
los subelementos XML/PDF y los estados `Entregado`, `Leído` y `Respondido`.

## Evidencia reproducible

### Pruebas y simulación aislada

Comando:

```sh
npm run test:fmg-whatsapp
```

Resultado: 13 pruebas aprobadas, 0 fallidas.

La suite usa puertos simulados; no realiza llamadas de red ni escribe en
Monday, Meta, Drive o Firestore. Comprueba:

- normalización del teléfono mexicano `6144273301`;
- extracción del archivo de Drive y formato del total;
- filtro exacto del evento de Monday;
- estructura del payload de la plantilla, recibo, fecha y total;
- total sin signo monetario duplicado, porque la plantilla ya contiene `$`;
- clave idempotente estable aunque cambien columnas del gasto;
- secuencia de trazabilidad mínima;
- dos eventos concurrentes producen una sola llamada de mensaje;
- un duplicado posterior no descarga ni envía;
- una respuesta incierta queda bloqueada sin reintento automático;
- validación aislada sin reserva, trazabilidad ni llamadas a Meta;
- compuerta cerrada, modo de prueba por elemento y modo live.

### Tipos

Comando:

```sh
npx tsc --noEmit
```

Resultado: aprobado.

### Lint del cambio

Comando:

```sh
npx eslint src/app/api/integrations/monday/whatsapp/route.ts \
  src/lib/integrations/fmg-whatsapp.ts \
  src/lib/integrations/fmg-whatsapp-core.ts \
  src/lib/integrations/fmg-whatsapp-core.test.ts \
  src/lib/integrations/fmg-whatsapp-workflow.ts \
  src/lib/integrations/fmg-whatsapp-workflow.test.ts
```

Resultado: aprobado sin errores ni advertencias.

El lint global del repositorio sigue fallando por 10 errores preexistentes en
archivos ajenos a esta integración; no se modificaron como parte de esta fase.

### Build

Comando:

```sh
npm run build
```

Resultado: aprobado con Next.js 16.0.9. La tabla de rutas incluye únicamente:

```text
/api/integrations/monday/whatsapp
```

No incluye `/api/integrations/meta/whatsapp`.

## Evidencia operativa

- Plantilla de Meta `1033789495709796`:
  `solicitud_factura_jorge_recibo`, `APPROVED`, `es_MX`, categoría `UTILITY`.
- La plantilla contiene el RFC, régimen fiscal, código postal, uso de CFDI,
  correo de recepción y enlace a la constancia fiscal de Jorge.
- Simulación autenticada del elemento `12660861968`:
  teléfono `526144273301`, fecha `2026-07-29`, total `1.00 MXN` e imagen JPEG
  de 3,057,412 bytes.
- Primer envío real aceptado por Meta con un ID que comienza en
  `wamid.HBgNNT`.
- Repetición directa del mismo evento: respuesta `duplicate` con el mismo ID.
- Monday registró `Enviado`, el ID completo y una actualización con la
  trazabilidad del envío.
- Firestore registró una sola reserva en estado `sent`, con fechas de creación
  y envío.
- Deployment de producción: `dpl_8Upn8ytCu1msYTjNHShF81jgxVWM`.
- La protección de Vercel permanece activa; el webhook utiliza un bypass
  exclusivo de automatización y un segundo secreto propio de la aplicación.
- Webhook permanente de Monday: `616347342`, tablero `8964055261`, columna
  `proyecto`, valor estable `index: 6` (`Whatsapp`).
- Prueba de extremo a extremo desde Monday (`NUEVO → Whatsapp`): producción
  procesó el evento con `status: duplicate` y el mismo ID, por lo que no hubo
  un segundo envío.

## Límite funcional

El flujo termina cuando Meta acepta la solicitud saliente. No recibe respuestas
por WhatsApp y no descarga, almacena ni timbra XML/PDF; ContaLink cubre esa
etapa separadamente.
