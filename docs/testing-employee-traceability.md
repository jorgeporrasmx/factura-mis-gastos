# Prueba end-to-end: trazabilidad de empleados

Cubre el flujo completo: empresa con `inviteCode` → empleado se une → sube recibo
→ webhook OCR → datos de empleado en los 3 paths de Firestore → visible en Monday
→ reporte filtrable por empleado respetando permisos.

Arquitectura (rama `fmg-ai-accountant-mvp`):
```
/api/upload/receipt
  → Drive (carpeta del empleado)
  → Monday item (enlace4 = driveFileId, columnas de empleado si existen)
  → FMG_RECEIPT_OCR_WEBHOOK_URL (n8n) con userId/companyId/employee*
      → n8n hace OCR y llama a /api/internal/receipt-extraction
          → Monday (upsert por enlace4) + receipts + companies/{id}/expenses + receiptAutomation
```

## 0. Prueba automática de lógica (sin credenciales)

```bash
node scripts/verify-employee-traceability.mjs
```

Valida: detección tolerante de columnas de empleado, construcción de column_values
por tipo, resolución de empleado (uid > email > fallback), regla de reproceso
(no vaciar campos poblados), export CSV con datos de empleado, y `generateInviteCode`.

## 1. Empresa con `inviteCode`

- Empresas nuevas ya obtienen `inviteCode` al crearse (`/api/companies`), y las
  operaciones personales también (`personal-operation.ts`).
- Empresas antiguas sin código: correr el backfill (idempotente, no toca
  operaciones con código ya asignado):

```bash
# Dry-run (lista lo que haría). Usa el uid de un usuario admin real.
curl -s https://STAGING/api/admin/backfill-invite-codes \
  -H "x-user-uid: UID_DE_UN_ADMIN"

# Aplicar
curl -s -X POST https://STAGING/api/admin/backfill-invite-codes \
  -H "x-user-uid: UID_DE_UN_ADMIN"
```

Espera `success: true` y una lista de `{ id, name, inviteCode }`. Correrlo de nuevo
debe devolver `updated: 0` (idempotencia).

## 2. Empleado se une por link

1. Abrir `https://STAGING/unirse/<inviteCode>`.
2. Registrarse / iniciar sesión, capturar WhatsApp, unirse.
3. Verificar en Firestore `users/{uid}`:
   `companyId`, `companyName`, `role: "user"`, `accountType: "empleado"`,
   `onboardingCompleted: true`, `status: "active"`, `whatsappPhone`,
   `driveFolderId` (si Drive está configurado).

Casos de error a comprobar (mensaje claro, no fallo silencioso):
- Cuenta ya en **otra** empresa → 409 `ALREADY_IN_ANOTHER_COMPANY`.
- Cuenta **personal** (con operación personal activa) → 409 `PERSONAL_ACCOUNT_ACTIVE`.
- Cuenta personal legada con CSF → 409 `PERSONAL_ACCOUNT_HAS_DATA`.

## 3. Empleado sube un recibo

- Desde el portal del empleado, subir un recibo (`/api/upload/receipt`).
- Verificar el item creado en el board de Monday de la empresa:
  - Nombre: `Recibo - {Empleado} - {fecha}`; `enlace4` = driveFileId.
  - Si el board tiene las columnas `Empleado`, `Empleado Email`, `Empleado ID`
    (ver `docs/monday-columns.md`), deben venir pobladas.
  - Si faltan, la subida **no** falla: aparece un `warning` en logs de Vercel.
- El webhook OCR (`FMG_RECEIPT_OCR_WEBHOOK_URL`) recibe `userId`, `companyId`,
  `mondayBoardId`, `mondayItemId`, `employeeId`, `employeeName`, `employeeEmail`,
  `employeeWhatsapp`.

## 4. Webhook OCR simulado

```bash
# a) Auth: sin secret debe rechazar con 401
FMG_BASE_URL=https://STAGING node scripts/simulate-ocr-webhook.mjs

# b) Flujo completo (usa un uid real de empleado y su companyId)
FMG_BASE_URL=https://STAGING FMG_AUTOMATION_SECRET=<secret> \
  node scripts/simulate-ocr-webhook.mjs <driveFileId> <uidEmpleado> <companyId>

# c) Reproceso SIN datos de empleado: no debe vaciar campos ya poblados
FMG_BASE_URL=https://STAGING FMG_AUTOMATION_SECRET=<secret> \
  node scripts/simulate-ocr-webhook.mjs <mismoDriveFileId> <uidEmpleado> <companyId> --sin-empleado
```

Notas:
- Si el payload sólo trae `userId`, el endpoint resuelve `userName`/`userEmail`/
  `whatsappPhone` desde `users/{uid}` en Firestore (sin fallar por opcionales).
- Idempotencia por `driveFileId`: la corrida (b) repetida actualiza el mismo item
  de Monday (búsqueda por `enlace4`) y los mismos documentos.

## 5. Firestore contiene datos de empleado en los 3 paths

Verificar que `userId`, `userName`, `userEmail` (y `employeeCode` si se envió)
estén poblados en:

1. `receipts/{driveFileId}`
2. `companies/{companyId}/expenses/{driveFileId}`
3. `receiptAutomation/{driveFileId}`

**Regla dura:** después de la corrida (c) (reproceso sin datos de empleado),
esos campos deben seguir poblados — el endpoint sólo escribe llaves con valor
(merge), nunca vacía un campo ya lleno. Lo mismo aplica a la sincronización
manual (`upsertExpense(s)` usa `mergeEmployeePreservingNonEmpty`).

## 6. Monday muestra al empleado

En el board de la empresa, el item del recibo debe mostrar las columnas
`Empleado` / `Empleado Email` / `Empleado ID` pobladas (si existen en el board).
La columna **Método** debe quedar con etiqueta `Sitio Web` para subidas web.

## 7. Reporte filtrable y con permisos

- **Admin:** ve todos los gastos, filtro por empleado, columna Usuario con
  nombre + email. Export **CSV** incluye nombre, email e ID de empleado.
- **Empleado:** sólo ve sus propios gastos. El filtro es a nivel query
  (`/api/expenses` fuerza `userId = uid` para no-admins), no sólo en UI —
  aunque manipule la URL con otro `userId`, el backend lo ignora.
