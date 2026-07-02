# Columnas esperadas del machote de Monday (Gastos / Facturas)

**Board MACHOTE (template):** `18398058025`
Cada empresa nueva (y cada operación personal) recibe un duplicado de este board
(`duplicate_board_with_structure`), por lo que **los IDs de columna se conservan
iguales** en todos los boards.

## Columnas usadas al crear un item (subida de recibo)

| ID de columna    | Título esperado   | Tipo    | Uso |
|------------------|-------------------|---------|-----|
| `name`           | (nombre del item) | —       | `Recibo - {Empleado} - {Fecha}` |
| `status`         | Estado            | status  | Se crea en índice 5 (NUEVO) |
| `text_mkthrxct`  | Fecha compra      | text    | Fecha de compra (hoy por defecto) |
| `proyecto`       | Método            | status  | Índice 3 (Web) al crear; el OCR lo actualiza por etiqueta |
| `text_mkqygzgk`  | Link Drive        | text    | URL del archivo en Google Drive |
| `enlace4`        | Drive File ID     | text    | **Llave idempotente** Drive → OCR/IA → Monday |

## Columnas que llena el OCR (`/api/internal/receipt-extraction`)

| ID de columna    | Contenido |
|------------------|-----------|
| `status`         | Estado por etiqueta (`NUEVO`, `SIN INFORMACIÓN`, `INFO`, `En Proceso`, `Listo`, `No Facturado`, `DUPLICADA`) |
| `n_meros`        | Total |
| `text_mky7nh3g`  | Razón social / proveedor |
| `correo`         | Ticket / transacción |
| `link_mkqg4vhb`  | Portal de facturación |
| `proyecto`       | Método por etiqueta (ver nomenclatura abajo) |

## Columnas de empleado (trazabilidad)

El sistema (subida **y** OCR) escribe estas columnas **si existen** en el board.
Si faltan, el proceso **no falla**: se registra un `warning` en logs con el nombre
de la columna faltante. Se detectan por **título** (tolerante a acentos y
mayúsculas), no por ID, para que puedas agregarlas al machote sin cambiar código.

| Título aceptado (cualquiera) | Tipo recomendado | Contenido | Estabilidad |
|------------------------------|------------------|-----------|-------------|
| `Empleado ID`, `ID Empleado`, `Empleado UID` | text | `uid` de Firebase | **Llave técnica estable** |
| `Empleado Email`, `Email Empleado`, `Correo Empleado` | text o email | correo del empleado | Estable |
| `Empleado`, `Nombre Empleado` | text | nombre visible del empleado | Visible / tolerante a fallos |

> **Importante:** el `uid` de Firebase es la llave primaria real del empleado.
> Las columnas de Monday son **campos visibles/tolerantes a fallos**, nunca la
> llave primaria. La columna de tags original (`tag_mm063vts`) ya **no** se usa
> como identificador (los tags requieren IDs precreados y no son confiables como
> llave); se dejó de enviar vacía al crear items.

Durante la sincronización (`/api/expenses/sync`), el gasto se vincula al empleado
resolviendo `Empleado Email` / `Empleado ID` contra los usuarios de la empresa en
Firestore. Si hay match, se escriben `userId`, `userName`, `userEmail` reales en
`companies/{companyId}/expenses/{...}`.

## Nomenclatura: `Sitio Web` (no `Página Web`)

La etiqueta del método web en la columna **Método** (`proyecto`) es **`Sitio Web`**,
no `Página Web`. El código (`METHOD_LABELS` en
`src/app/api/internal/receipt-extraction/route.ts`) ya envía `Sitio Web`; si tu
board todavía tiene la etiqueta `Página Web`, renómbrala a `Sitio Web` para que
el status se asigne correctamente.
