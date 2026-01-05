# Plan de Implementación - Factura Mis Gastos

## Estado Actual

### Implementado
- Landing page completa con todas las secciones
- Captación de leads con Monday Forms
- Widget de WhatsApp (614 397 7690)
- UI de inicio de sesión (solo visual, no funcional)
- UI de selección de planes y pagos (solo visual)
- SEO y metadatos optimizados
- Diseño responsivo

### No Implementado
- Backend/API
- Base de datos
- Autenticación real
- Procesamiento de pagos
- Dashboard de usuario
- Gestión de facturas/recibos

---

## Fases de Implementación

### FASE 1: Infraestructura Base
**Prioridad: CRÍTICA**

#### 1.1 Base de Datos
- [ ] Configurar PostgreSQL (Supabase recomendado para México)
- [ ] Instalar y configurar Prisma ORM
- [ ] Crear esquema inicial:
  ```
  - User (id, email, name, avatar, createdAt)
  - Company (id, name, rfc, address, userId)
  - Subscription (id, plan, status, startDate, endDate, companyId)
  - Invoice (id, amount, status, receiptUrl, cfdiUrl, companyId)
  ```

#### 1.2 Autenticación
- [ ] Instalar NextAuth.js v5
- [ ] Configurar proveedor Google OAuth
- [ ] Configurar proveedor de email/password
- [ ] Crear páginas: /login, /registro, /recuperar-password
- [ ] Implementar middleware de protección de rutas
- [ ] Conectar LoginModal existente con autenticación real

**Variables de entorno necesarias:**
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

### FASE 2: Gestión de Usuarios
**Prioridad: ALTA**

#### 2.1 Registro y Onboarding
- [ ] Flujo de registro con verificación de email
- [ ] Creación de empresa/compañía
- [ ] Captura de RFC y datos fiscales
- [ ] Invitación de miembros del equipo

#### 2.2 Perfil de Usuario
- [ ] Página /dashboard/perfil
- [ ] Edición de datos personales
- [ ] Cambio de contraseña
- [ ] Gestión de notificaciones
- [ ] Foto de perfil

#### 2.3 Gestión de Empresa
- [ ] Página /dashboard/empresa
- [ ] Datos fiscales (RFC, razón social, dirección)
- [ ] Logo de empresa
- [ ] Miembros del equipo con roles (Admin, Usuario)

---

### FASE 3: Sistema de Pagos
**Prioridad: ALTA**

#### 3.1 Integración de Pagos
- [ ] Integrar Stripe (tarjetas internacionales)
- [ ] Integrar Conekta (OXXO, SPEI, tarjetas mexicanas)
- [ ] Crear API endpoints para:
  - POST /api/payments/create-checkout
  - POST /api/payments/webhook
  - GET /api/payments/history

#### 3.2 Gestión de Suscripciones
- [ ] Página /dashboard/suscripcion
- [ ] Mostrar plan actual y uso
- [ ] Upgrade/downgrade de plan
- [ ] Historial de pagos
- [ ] Facturas de suscripción (PDF)
- [ ] Cancelación de suscripción

**Variables de entorno necesarias:**
```env
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
CONEKTA_API_KEY=
CONEKTA_WEBHOOK_SECRET=
```

**Planes a configurar:**
| Plan | Precio | Recibos | Usuarios |
|------|--------|---------|----------|
| Equipos | $1,299 MXN/mes | 150 | 3 |
| Empresa | $2,499 MXN/mes | 300 | 8 |
| Corporativo | Personalizado | Ilimitados | Ilimitados |

---

### FASE 4: Dashboard Principal
**Prioridad: MEDIA**

#### 4.1 Estructura del Dashboard
- [ ] Layout con sidebar de navegación
- [ ] Página /dashboard (resumen)
- [ ] Estadísticas: recibos del mes, facturas generadas, total deducible
- [ ] Gráficas de gastos por categoría
- [ ] Actividad reciente

#### 4.2 Gestión de Recibos
- [ ] Página /dashboard/recibos
- [ ] Subida de recibos (imagen/PDF)
- [ ] Lista de recibos con filtros
- [ ] Estados: Pendiente, En proceso, Facturado, Rechazado
- [ ] Integración con WhatsApp para recibir recibos

#### 4.3 Gestión de Facturas
- [ ] Página /dashboard/facturas
- [ ] Lista de facturas CFDI
- [ ] Descarga de XML y PDF
- [ ] Verificación con SAT
- [ ] Exportación a Excel

---

### FASE 5: Integraciones
**Prioridad: MEDIA**

#### 5.1 WhatsApp Business API
- [ ] Configurar cuenta de WhatsApp Business
- [ ] Webhook para recibir mensajes
- [ ] Procesamiento de imágenes de recibos
- [ ] Respuestas automáticas de confirmación

#### 5.2 Integraciones Contables (Futuro)
- [ ] API para Aspel
- [ ] API para Contalink
- [ ] Exportación a formatos estándar

#### 5.3 n8n Automations
- [ ] Conectar con n8n self-hosted
- [ ] Automatización: Nuevo lead → Monday → Email de bienvenida
- [ ] Automatización: Recibo recibido → Notificación
- [ ] Automatización: Factura lista → Envío por email

---

### FASE 6: Comunicaciones
**Prioridad: MEDIA**

#### 6.1 Sistema de Emails
- [ ] Configurar SendGrid o Resend
- [ ] Templates de email:
  - Bienvenida
  - Verificación de email
  - Recuperación de contraseña
  - Factura lista
  - Recordatorio de pago
  - Resumen semanal

**Variables de entorno:**
```env
SENDGRID_API_KEY=
EMAIL_FROM=
```

---

### FASE 7: Seguridad y Producción
**Prioridad: ALTA (antes de lanzar)**

#### 7.1 Seguridad
- [ ] Rate limiting en APIs
- [ ] Validación de inputs (Zod)
- [ ] Sanitización de datos
- [ ] Headers de seguridad
- [ ] CORS configurado
- [ ] Encriptación de datos sensibles

#### 7.2 Monitoreo
- [ ] Configurar Sentry para errores
- [ ] Google Analytics / Plausible
- [ ] Logs estructurados
- [ ] Alertas de errores críticos

#### 7.3 Cumplimiento
- [ ] Política de privacidad
- [ ] Términos y condiciones
- [ ] Aviso de cookies
- [ ] Cumplimiento LFPDPPP (México)

---

## Resumen de Servicios Externos Necesarios

| Servicio | Propósito | Costo Estimado |
|----------|-----------|----------------|
| Supabase | Base de datos + Auth | Gratis hasta 500MB |
| Google Cloud | OAuth | Gratis |
| Stripe | Pagos internacionales | 2.9% + $0.30 por transacción |
| Conekta | Pagos México (OXXO, SPEI) | 2.9% + $2.50 MXN |
| SendGrid | Emails transaccionales | Gratis hasta 100/día |
| Vercel | Hosting | Ya configurado |
| WhatsApp Business | Mensajería | ~$0.05 USD por mensaje |

---

## Orden de Implementación Recomendado

```
SEMANA 1-2:  Fase 1 (Base de datos + Auth)
SEMANA 3-4:  Fase 2 (Usuarios y perfiles)
SEMANA 5-6:  Fase 3 (Pagos)
SEMANA 7-8:  Fase 4 (Dashboard básico)
SEMANA 9-10: Fase 5 (WhatsApp + n8n)
SEMANA 11:   Fase 6 (Emails)
SEMANA 12:   Fase 7 (Seguridad y lanzamiento)
```

---

## Decisiones Pendientes

1. **Base de datos**: ¿Supabase, PlanetScale, o Railway?
2. **Pagos**: ¿Solo Stripe, solo Conekta, o ambos?
3. **WhatsApp**: ¿API oficial o Twilio?
4. **Almacenamiento de archivos**: ¿Supabase Storage, AWS S3, o Cloudinary?
5. **Dominio de email**: ¿Cuál usar para emails transaccionales?

---

## Próximos Pasos Inmediatos

1. **Revisar este plan** y confirmar prioridades
2. **Crear cuentas** en servicios necesarios (Supabase, Stripe, etc.)
3. **Obtener credenciales** y configurar variables de entorno
4. **Comenzar Fase 1** con base de datos y autenticación

---

*Documento creado: Enero 2026*
*Última actualización: Pendiente*
