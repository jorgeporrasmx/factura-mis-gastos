# Plan: Sistema de Onboarding de Empleados por Enlace de Invitación

## Resumen

Crear un flujo donde el admin de una empresa comparta un enlace único (ej: `facturamisgastos.com/unirse/acme-corp`) con sus empleados. Los empleados se registran, proporcionan su WhatsApp y quedan vinculados a la empresa automáticamente. Incluye FAQ para empleados y guía PDF descargable.

---

## Paso 1: Cambios en Modelo de Datos

### Archivo: `src/types/company.ts`

- Agregar `inviteCode: string` a la interfaz `Company` — slug legible basado en nombre (ej: "acme-corp")
- Agregar `whatsappPhone?: string` a `UserProfile` — número de WhatsApp del empleado
- Agregar `whatsappPhone?: string` a `CompanyUser` — para que admin vea los WhatsApp de su equipo

### Archivo: `src/types/company.ts` (nueva función)
- Agregar función `generateInviteCode(companyName: string): string` — normaliza el nombre a slug (sin acentos, minúsculas, guiones)

---

## Paso 2: Generar `inviteCode` al Crear Empresa

### Archivo: `src/app/api/companies/route.ts`

- Al crear empresa, generar `inviteCode` a partir del nombre
- Verificar unicidad del `inviteCode` en Firestore; si ya existe, agregar sufijo numérico (ej: "acme-corp-2")
- Guardar `inviteCode` en el documento de la empresa

### Archivo: `src/lib/firebase/firestore.ts` y `firestore-admin.ts`

- Agregar función `getCompanyByInviteCode(code: string): Promise<Company | null>`
- Agregar función `isInviteCodeAvailable(code: string): Promise<boolean>`

---

## Paso 3: API para Unirse por Código de Invitación

### Nuevo archivo: `src/app/api/companies/join-by-invite/route.ts`

**GET `/api/companies/join-by-invite?code=acme-corp`**
- Buscar empresa por `inviteCode`
- Retornar nombre e info básica de la empresa (para mostrar en la página)

**POST `/api/companies/join-by-invite`**
- Body: `{ uid, email, displayName, whatsappPhone, inviteCode }`
- Validar que el código existe y la empresa está activa
- Crear carpeta de usuario en Google Drive (si está configurado)
- Vincular usuario a empresa con rol 'user'
- Guardar `whatsappPhone` en el perfil del usuario
- Retornar datos de la empresa

---

## Paso 4: Página Pública de Invitación `/unirse/[code]`

### Nuevo archivo: `src/app/unirse/[code]/page.tsx`

Página pública (no requiere auth inicialmente) con 3 secciones en tabs:

**Tab 1: "Registro" (default)**
- Header con logo y nombre de la empresa
- Mensaje de bienvenida: "Tu empresa [Nombre] te invita a unirte a Factura Mis Gastos"
- Opciones de registro/login: Google, Email, o Teléfono (reutilizar componentes de auth existentes)
- Campo obligatorio de WhatsApp con validación mexicana (+52, 10 dígitos)
- Botón "Unirme a [Nombre de Empresa]"
- Si el usuario ya está autenticado, solo pedir WhatsApp y confirmar

**Tab 2: "Guía Rápida"**
- FAQ orientado al empleado (cómo enviar recibos por WhatsApp, por la app, formatos aceptados, tiempos)
- Reutilizar contenido del FAQ existente en `/portal/ayuda`
- Botón para descargar PDF de guía

**Tab 3: "Preguntas Frecuentes"**
- FAQ específico para empleados (diferente al landing page que es para empresas)
- Preguntas como: ¿Cómo envío un recibo por WhatsApp?, ¿Qué información debe tener el recibo?, ¿En cuánto tiempo recibo mi factura?, etc.

### Flujo del empleado:
1. Abre el enlace → Ve info de la empresa y opciones de registro
2. Se registra con Google/Email/Teléfono
3. Ingresa su número de WhatsApp
4. Click "Unirme" → Se vincula a la empresa
5. Redirect al portal con onboarding completado

---

## Paso 5: Panel Admin — Enlace de Invitación

### Modificar: `src/app/portal/perfil/page.tsx`

- Si el usuario es admin, mostrar sección "Invitar Empleados"
- Mostrar el enlace completo de invitación con botón "Copiar enlace"
- Botón "Compartir por WhatsApp" (abre wa.me con mensaje predefinido)
- Lista de empleados actuales con su WhatsApp (si disponible)

---

## Paso 6: Guía PDF Estática del Empleado

### Nuevo archivo: `public/guia-empleado.pdf`

PDF con:
1. ¿Qué es Factura Mis Gastos? (1 párrafo)
2. Cómo crear tu perfil (pasos con capturas simplificadas)
3. Cómo enviar recibos por WhatsApp (paso a paso)
4. Cómo enviar recibos por la plataforma web (paso a paso)
5. Requisitos del recibo (formatos, info necesaria, calidad de imagen)
6. Tiempos de procesamiento
7. Contacto y soporte

---

## Paso 7: Migración de Empresas Existentes

### Nuevo archivo: `src/app/api/companies/generate-invite-codes/route.ts`

- Endpoint admin para generar `inviteCode` para empresas que ya existen y no tienen uno
- Se ejecuta una vez para migración

---

## Archivos a crear/modificar (resumen)

| Acción | Archivo |
|--------|---------|
| Modificar | `src/types/company.ts` |
| Modificar | `src/lib/firebase/firestore.ts` |
| Modificar | `src/lib/firebase/firestore-admin.ts` |
| Modificar | `src/app/api/companies/route.ts` |
| Modificar | `src/app/portal/perfil/page.tsx` |
| Crear | `src/app/api/companies/join-by-invite/route.ts` |
| Crear | `src/app/unirse/[code]/page.tsx` |
| Crear | `src/components/employee/EmployeeOnboardingForm.tsx` |
| Crear | `src/components/employee/EmployeeFAQ.tsx` |
| Crear | `src/components/employee/EmployeeGuide.tsx` |
| Crear | `public/guia-empleado.pdf` |

## Orden de implementación

1. Modelo de datos (tipos + Firestore)
2. API join-by-invite
3. Modificar API de creación de empresa (generar inviteCode)
4. Página `/unirse/[code]` con formulario
5. Componentes FAQ y Guía del empleado
6. Panel admin con enlace de invitación
7. PDF estático
