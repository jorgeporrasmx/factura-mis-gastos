# Plan de Implementación: Sistema de Captación de Leads con Monday.com

## Estado: Fase 1-3 COMPLETADAS

---

## Resumen de lo Implementado

### Archivos Creados:
- `src/lib/monday.ts` - Cliente API de Monday.com con configuración del tablero
- `src/app/api/leads/route.ts` - Endpoint POST /api/leads
- `src/components/LeadFormModal.tsx` - Modal con 4 tipos de formulario
- `src/components/WhatsAppWidget.tsx` - Widget flotante con WhatsApp + "Te llamamos"
- `.env.example` - Template de variables de entorno

### Archivos Modificados:
- `src/components/Header.tsx` - CTA abre formulario express
- `src/components/HeroSection.tsx` - CTAs abren formularios express/standard
- `src/components/PricingSection.tsx` - CTAs abren formularios express/corporate
- `src/components/CTASection.tsx` - CTAs abren formularios express/standard
- `src/components/FAQSection.tsx` - Link abre formulario standard
- `src/app/page.tsx` - Usa WhatsAppWidget en lugar de CallPopup

---

## Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   CTA "Comenzar"     CTA "Asesor"      CTA "Cotizar"                │
│        │                  │                  │                       │
│        ▼                  ▼                  ▼                       │
│   ┌─────────┐        ┌─────────┐        ┌─────────┐                 │
│   │  Modal  │        │  Modal  │        │  Modal  │                 │
│   │ Express │        │Estándar │        │Corporat.│                 │
│   │3 campos │        │5 campos │        │9 campos │                 │
│   └────┬────┘        └────┬────┘        └────┬────┘                 │
│        │                  │                  │                       │
│        └──────────────────┼──────────────────┘                       │
│                           ▼                                          │
│                    ┌─────────────┐                                   │
│                    │ POST        │                                   │
│                    │ /api/leads  │                                   │
│                    └──────┬──────┘                                   │
│                           │                                          │
│                           ▼                                          │
│                    ┌─────────────┐                                   │
│                    │ Monday.com  │                                   │
│                    │ Board: 18393740781                              │
│                    │ Grupo: "Nuevos"                                 │
│                    └──────┬──────┘                                   │
│                           │                                          │
│                           ▼                                          │
│              ┌───────────────────────┐                               │
│              │   Thank You Modal     │                               │
│              │  • WhatsApp directo   │                               │
│              │  • Link a Calendly    │                               │
│              │  • Redirect /comenzar │                               │
│              └───────────────────────┘                               │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  WhatsAppWidget (Flotante)                                    │  │
│   │  🤖 Asistente Virtual con IA                                 │  │
│   │  💬 WhatsApp → wa.me/5216144273301                           │  │
│   │  📅 Agendar cita → Calendly                                  │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Datos de Contacto Configurados

- **WhatsApp Ventas:** +52 614 427 3301
- **Email:** hola@facturamisgastos.com
- **Calendly:** https://calendly.com/facturamisgastos/asesoria

---

## Configuración del Tablero Monday.com

**Board ID:** `18393740781`

**Columnas configuradas:**
| Campo | Column ID |
|-------|-----------|
| Estado | color_mkz79aj8 |
| WhatsApp | phone_mkz742fw |
| Email | email_mkz7ydhm |
| Empresa | text_mkz75aj8 |
| Cargo | text_mkz7hm0p |
| Recibos/mes | dropdown_mkz7a2wd |
| Empleados | dropdown_mkz7x7bs |
| Integraciones | dropdown_mkz7d3mf |
| Origen | dropdown_mkz77f67 |
| Plan interés | dropdown_mkz77fz1 |
| Asignado | multiple_person_mkz7e7y4 |
| Fecha entrada | date_mkz7qq3d |
| Próximo contacto | date_mkz73bkw |
| Valor estimado | numeric_mkz72ecg |
| Notas | long_text_mkz7v1b1 |

**Grupos:**
- Nuevos: group_mkz7pm5x
- En proceso: group_mkz7q58a
- Demos: group_mkz7jsgz
- Cerrados: group_mkz7y3yy

---

## PENDIENTE: Configuración Final

### 1. Agregar API Key de Monday (REQUERIDO)

Crear archivo `.env.local` en la raíz del proyecto:

```bash
MONDAY_API_KEY=tu_api_key_de_monday_aqui
```

**Cómo obtener el API Key:**
1. Ve a monday.com → Tu avatar → Developers
2. Click en "My Access Tokens"
3. Genera un nuevo token con permisos de lectura/escritura

### 2. Automatizaciones n8n (FASE 2 - Opcional)

Cuando tengas la URL de n8n, configurar:

1. **Webhook en Monday:**
   - Monday → Tablero de Leads → Integraciones
   - Agregar "When item is created" → Webhook

2. **Workflow en n8n:**
   - Trigger: Webhook desde Monday
   - Acciones según origen del lead:
     - Express → Notificación + nurturing
     - Standard → Notificación prioritaria + tarea
     - Corporate → Notificación gerente + proyecto

### 3. Notificaciones en Monday (Recomendado)

Configurar en Monday directamente:
- Cuando estado = "Nuevo" por más de 1 hora → Notificar
- Cuando se crea item → Notificar al equipo de ventas

---

## Tipos de Formulario

### Express (3 campos)
- Nombre, WhatsApp, Email
- Uso: "Comenzar ahora" en Header, Hero, Pricing, CTA
- Post-envío: Redirect a /comenzar

### Standard (5 campos)
- Nombre, WhatsApp, Email, Empresa (opcional), Recibos/mes (opcional)
- Uso: "Hablar con asesor" en Hero, CTA, FAQ
- Post-envío: WhatsApp + Calendly

### Corporate (9 campos)
- Nombre, Cargo, WhatsApp, Email, Empresa, Empleados, Recibos/mes, Integraciones, Notas
- Uso: Plan Corporativo "Solicitar cotización"
- Post-envío: Mensaje de equipo enterprise + WhatsApp

### Callback (3 campos)
- Nombre, WhatsApp, ¿Cuándo te llamamos?
- Uso: Widget flotante "Te llamamos"
- Post-envío: Confirmación de llamada

---

## Testing

Para probar el sistema:

1. Asegúrate de tener `MONDAY_API_KEY` en `.env.local`
2. Ejecuta `npm run dev`
3. Navega a http://localhost:3000
4. Haz click en cualquier CTA
5. Llena el formulario
6. Verifica que el lead aparezca en Monday.com

---

## Métricas de Éxito

1. **Tasa de conversión de visitante a lead** - Objetivo: >3%
2. **Tiempo de respuesta del equipo** - Objetivo: <5 min
3. **Leads calificados por semana** - Baseline a establecer
4. **Tasa de cierre desde lead** - Objetivo: >10%

---

## Notas Técnicas

- Los formularios son nativos (no iframe) para mejor UX
- La API route oculta el API key de Monday del cliente
- El widget de WhatsApp usa `wa.me` para máxima compatibilidad móvil
- Los formularios incluyen validación en tiempo real
- Estados de loading y error handling robusto
- TypeScript para type safety en toda la implementación
