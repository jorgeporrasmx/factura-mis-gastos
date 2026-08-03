# Solicitud de facturas por WhatsApp — multicliente

## Plantilla de Meta

- Nombre: `solicitud_factura_fmg_v1`
- Idioma: `es_MX`
- Categoría esperada: utilidad
- Encabezado: imagen dinámica del recibo
- Cuerpo:

```text
Hola, solicito la factura del comprobante adjunto.

Fecha: {{1}}
Total: ${{2}}

Datos fiscales:
Razón social: {{3}}
RFC: {{4}}
Régimen fiscal: {{5}}
Código postal: {{6}}
Uso de CFDI: {{7}}
Correo: {{8}}
Constancia fiscal: {{9}}

Gracias.
```

Los valores se obtienen exclusivamente del perfil fiscal verificado de la empresa vinculada al tablero. Nunca se toman datos fiscales del elemento del recibo.

## Aislamiento y activación

1. El ID del tablero debe resolver exactamente una empresa activa en Firestore.
2. La empresa debe tener `invoiceRequestAutomation.enabled=true`, estado `ready`, perfil fiscal verificado y mapeo completo de columnas.
   La fecha de emisión de la CSF no puede exceder 100 días al momento de verificarla.
3. El alta interna crea las columnas de trazabilidad faltantes, registra el webhook del tablero y guarda el mapeo real de IDs.
4. El envío se bloquea ante datos faltantes, perfil alterado, tablero duplicado o columna incorrecta.
5. La idempotencia usa empresa + tablero + elemento y no permite reenviar por cambios posteriores de plantilla o perfil.

## Respuestas y trazabilidad

- Monday recibe `Preparando`, `Enviado`, `Entregado`, `Leído`, `Respondido` o `Fallido` en el elemento original.
- Una respuesta solo se refleja automáticamente si el webhook de Meta contiene el ID del mensaje contestado.
- Los mensajes sin contexto se guardan en `fmg_whatsapp_inbound_messages` con `reviewState=pending`; no se asignan por teléfono.
