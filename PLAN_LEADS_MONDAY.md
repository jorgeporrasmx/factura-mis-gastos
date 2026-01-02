# Plan de Implementación: Sistema de Captación de Leads con Monday.com

## Objetivo
Crear un sistema de captación de leads optimizado para conversión que:
1. Capture información de prospectos directamente en Monday.com
2. Minimice la fricción del usuario
3. Permita respuesta inmediata del equipo de ventas
4. Automatice el seguimiento con n8n

---

## Arquitectura General

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
│   └────┬────┘        └────┬────┘        └────┬────┘                 │
│        │                  │                  │                       │
│        └──────────────────┼──────────────────┘                       │
│                           ▼                                          │
│                    ┌─────────────┐                                   │
│                    │ Monday.com  │                                   │
│                    │   (API)     │                                   │
│                    └──────┬──────┘                                   │
│                           │                                          │
│              ┌────────────┼────────────┐                             │
│              ▼            ▼            ▼                             │
│        Notificación   Webhook a    Confirmación                      │
│         a Ventas        n8n        + WhatsApp                        │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Widget Flotante (WhatsApp + "Te llamamos")                  │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Datos de Contacto

- **WhatsApp Ventas:** +52 614 397 7690
- **Email:** hola@facturamisgastos.com
- **Calendly:** https://calendly.com/facturamisgastos/asesoria

---

## Paso 1: Crear Formularios en Monday.com

### 1.1 Formulario Express (Para "Comenzar ahora")
**Campos:**
| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| Nombre completo | Texto | ✅ |
| WhatsApp | Teléfono | ✅ |
| Email | Email | ✅ |
| Origen | Hidden (valor: "CTA Comenzar") | Auto |

**Configuración Monday:**
- Crear en tablero de Leads
- Habilitar "Form" en la vista
- Configurar mensaje de éxito personalizado
- Obtener URL de embed

### 1.2 Formulario Estándar (Para "Hablar con asesor")
**Campos:**
| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| Nombre completo | Texto | ✅ |
| WhatsApp | Teléfono | ✅ |
| Email corporativo | Email | ✅ |
| Empresa | Texto | ❌ |
| Recibos mensuales | Dropdown | ❌ |
| Origen | Hidden (valor: "CTA Asesor") | Auto |

**Opciones Dropdown "Recibos mensuales":**
- 1-50 recibos
- 51-150 recibos
- 151-300 recibos
- Más de 300 recibos

### 1.3 Formulario Corporativo (Para plan Enterprise)
**Campos:**
| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| Nombre completo | Texto | ✅ |
| Cargo | Texto | ✅ |
| Email corporativo | Email | ✅ |
| WhatsApp | Teléfono | ✅ |
| Empresa | Texto | ✅ |
| Número de empleados | Dropdown | ✅ |
| Recibos mensuales | Dropdown | ✅ |
| Integraciones requeridas | Multi-select | ❌ |
| Comentarios | Texto largo | ❌ |
| Origen | Hidden (valor: "Plan Corporativo") | Auto |

**Opciones Dropdown "Empleados":**
- 1-10
- 11-50
- 51-200
- 201-500
- Más de 500

**Opciones Multi-select "Integraciones":**
- SAP Business One
- Aspel
- Contalink
- Odoo
- Bind ERP
- Google Sheets
- Otra

---

## Paso 2: Implementación Frontend

### 2.1 Crear Componente LeadFormModal

**Archivo:** `src/components/LeadFormModal.tsx`

**Funcionalidad:**
- Modal con diseño consistente al sitio
- Formulario nativo (no iframe) para mejor UX
- Validación en tiempo real
- Envío a API route de Next.js
- Estados: loading, success, error
- Página de confirmación con:
  - Mensaje de éxito
  - Botón de WhatsApp prominente
  - Link secundario a Calendly

**Variantes:**
- `type="express"` - 3 campos
- `type="standard"` - 5 campos
- `type="corporate"` - 9 campos

### 2.2 Crear API Route para Monday

**Archivo:** `src/app/api/leads/route.ts`

**Funcionalidad:**
- Recibe datos del formulario
- Valida campos requeridos
- Envía a Monday.com via API
- Retorna confirmación o error

**Endpoint:** `POST /api/leads`

**Payload:**
```json
{
  "type": "express|standard|corporate",
  "data": {
    "nombre": "...",
    "whatsapp": "...",
    "email": "...",
    // ... campos según tipo
  }
}
```

### 2.3 Actualizar Componentes Existentes

#### Header.tsx
- Botón "Comenzar ahora" → Abre LeadFormModal type="express"
- Después del formulario → Redirect a /comenzar

#### HeroSection.tsx
- "Comenzar ahora" → LeadFormModal type="express" → /comenzar
- "Hablar con un asesor" → LeadFormModal type="standard" → Confirmación

#### PricingSection.tsx
- Planes 1-3 "Comenzar ahora" → LeadFormModal type="express" → /comenzar
- Plan Corporativo "Cotizar" → LeadFormModal type="corporate" → Confirmación

#### CTASection.tsx
- "Comenzar ahora" → LeadFormModal type="express" → /comenzar
- "Hablar con un asesor" → LeadFormModal type="standard" → Confirmación

#### FAQSection.tsx
- Link "Agenda una llamada" → LeadFormModal type="standard"

### 2.4 Rediseñar CallPopup (Widget Flotante)

**Nuevo diseño:**

```
Estado minimizado:
┌─────────────────┐
│  💬 WhatsApp    │  ← Botón verde prominente
└─────────────────┘

Estado expandido (hover/click):
┌─────────────────────────────┐
│  ¿Tienes dudas?             │
│                             │
│  ┌───────────────────────┐  │
│  │ 💬 Escríbenos ahora   │  │  ← WhatsApp directo
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 📞 Te llamamos        │  │  ← Abre mini-form
│  └───────────────────────┘  │
│                             │
│         ✕ Cerrar            │
└─────────────────────────────┘
```

**Mini-formulario "Te llamamos":**
- Nombre
- WhatsApp
- Dropdown: "Ahora" / "En 1 hora" / "Mañana"
- Botón: "Solicitar llamada"

---

## Paso 3: Integración con Monday.com API

### 3.1 Configuración

**Variables de entorno (.env.local):**
```
MONDAY_API_KEY=tu_api_key_aqui
MONDAY_BOARD_ID=id_del_tablero_leads
```

### 3.2 API Route Implementation

**Endpoint:** `/api/leads`

**Flujo:**
1. Recibir POST con datos del formulario
2. Validar campos según tipo de formulario
3. Mapear campos a columnas de Monday
4. Crear item via Monday API (GraphQL)
5. Retornar success/error

**Monday API (GraphQL):**
```graphql
mutation {
  create_item (
    board_id: BOARD_ID,
    item_name: "Nombre del Lead",
    column_values: "{...}"
  ) {
    id
  }
}
```

---

## Paso 4: Página de Confirmación (Thank You)

### 4.1 Diseño UX

```
┌─────────────────────────────────────────┐
│                                         │
│            ✅                           │
│                                         │
│   ¡Gracias, [Nombre]!                   │
│                                         │
│   Te contactamos en menos de            │
│   5 minutos en horario laboral.         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  💬 Escríbenos por WhatsApp     │   │  ← Botón verde grande
│   │     para respuesta inmediata    │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ¿Prefieres agendar una llamada?       │
│   → Agenda aquí                         │  ← Link a Calendly
│                                         │
│            [Cerrar]                     │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 Variantes por Tipo

**Express (Comenzar):**
- Mensaje de confirmación
- Botón "Continuar al registro" → /comenzar
- Botón secundario WhatsApp

**Standard (Asesor):**
- Mensaje de confirmación
- Botón WhatsApp prominente
- Link a Calendly

**Corporate (Cotizar):**
- Mensaje: "Nuestro equipo enterprise te contactará en las próximas 24 horas"
- Botón WhatsApp
- Link a Calendly

---

## Paso 5: Automatizaciones n8n (Fase 2)

### 5.1 Webhook Trigger
- Monday notifica a n8n cuando se crea un lead
- n8n procesa según el tipo/origen

### 5.2 Automatizaciones Sugeridas

**Lead Express:**
1. Notificar por Slack/Email al equipo
2. Enviar WhatsApp de bienvenida automático
3. Agregar a secuencia de nurturing

**Lead Standard:**
1. Notificación inmediata a vendedor asignado
2. Crear tarea de seguimiento en Monday
3. Enviar email de confirmación con recursos

**Lead Corporate:**
1. Notificación prioritaria a gerente de ventas
2. Crear proyecto en Monday para seguimiento
3. Agendar reunión automática si hay calendario disponible

---

## Paso 6: Archivos a Crear/Modificar

### Archivos Nuevos:
1. `src/components/LeadFormModal.tsx` - Modal principal de formularios
2. `src/components/LeadForm.tsx` - Componente de formulario reutilizable
3. `src/components/ThankYouModal.tsx` - Página de confirmación
4. `src/components/WhatsAppWidget.tsx` - Nuevo widget flotante
5. `src/app/api/leads/route.ts` - API route para Monday
6. `src/lib/monday.ts` - Cliente de Monday API

### Archivos a Modificar:
1. `src/components/Header.tsx` - Integrar modal en CTA
2. `src/components/HeroSection.tsx` - Integrar modales en CTAs
3. `src/components/PricingSection.tsx` - Integrar modales en botones
4. `src/components/CTASection.tsx` - Integrar modales en CTAs
5. `src/components/FAQSection.tsx` - Cambiar link por modal
6. `src/components/CallPopup.tsx` - Rediseñar como WhatsApp widget
7. `src/app/layout.tsx` - Agregar WhatsAppWidget global

### Variables de Entorno:
```
MONDAY_API_KEY=
MONDAY_BOARD_ID=
NEXT_PUBLIC_WHATSAPP_NUMBER=5216143977690
```

---

## Orden de Implementación

### Fase 1: Infraestructura (Prioridad Alta)
1. [ ] Configurar variables de entorno
2. [ ] Crear cliente Monday API (`src/lib/monday.ts`)
3. [ ] Crear API route (`/api/leads`)
4. [ ] Crear componente LeadForm base
5. [ ] Crear componente LeadFormModal
6. [ ] Crear componente ThankYouModal

### Fase 2: Integración CTAs (Prioridad Alta)
7. [ ] Actualizar HeroSection con modales
8. [ ] Actualizar Header con modal
9. [ ] Actualizar PricingSection con modales
10. [ ] Actualizar CTASection con modales
11. [ ] Actualizar FAQSection con modal

### Fase 3: Widget WhatsApp (Prioridad Media)
12. [ ] Crear WhatsAppWidget
13. [ ] Reemplazar CallPopup
14. [ ] Agregar a layout global

### Fase 4: Automatizaciones n8n (Prioridad Media)
15. [ ] Configurar webhook en Monday
16. [ ] Crear workflow en n8n
17. [ ] Configurar notificaciones

### Fase 5: Testing y Optimización (Prioridad Alta)
18. [ ] Probar flujo completo de cada formulario
19. [ ] Verificar creación de leads en Monday
20. [ ] Probar en móvil
21. [ ] Optimizar tiempos de carga

---

## Métricas de Éxito

1. **Tasa de conversión de visitante a lead** - Objetivo: >3%
2. **Tiempo de respuesta del equipo** - Objetivo: <5 min
3. **Leads calificados por semana** - Baseline a establecer
4. **Tasa de cierre desde lead** - Objetivo: >10%

---

## Notas Técnicas

- Los formularios son nativos (no iframe) para mejor UX y control
- La API route maneja la comunicación con Monday para ocultar API keys
- El widget de WhatsApp usa `wa.me` para máxima compatibilidad
- Los formularios incluyen honeypot y rate limiting básico para spam
- Se implementa loading states y error handling robusto
