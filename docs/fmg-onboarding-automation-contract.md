# FMG Onboarding Automation Contract

## Objetivo

Cada cliente nuevo debe arrancar con el mismo circuito operativo:

1. Perfil creado en FMG.
2. Trial activo.
3. Carpeta Drive de cliente creada.
4. Carpeta personal del usuario creada.
5. Tablero Monday duplicado desde `FACTURA MIS GASTOS MACHOTE`.
6. Cliente agregado al tablero/carpeta.
7. Primer recibo recibido en Drive.
8. Lectura OCR/IA del recibo.
9. Upsert idempotente en Monday y Firebase usando `driveFileId`.
10. Revisión humana sobre los casos `SIN INFORMACIÓN`, `INFO` y `No Facturado`.

## Tablero machote

Board ID: `18398058025`

La descripción del machote debe contener variables, no datos fiscales reales:

```text
Datos de facturación:
Razón social: {{RAZON_SOCIAL}}
RFC: {{RFC}}
Régimen fiscal: {{REGIMEN_FISCAL}}
Domicilio fiscal: {{DOMICILIO_FISCAL}}
Código postal: {{CODIGO_POSTAL}}
Uso CFDI default: {{USO_CFDI_DEFAULT}}
Método de pago default: {{METODO_PAGO_DEFAULT}}
Contacto administrativo: {{CONTACTO_ADMIN}}
Correo de facturación: {{CORREO_FACTURACION}}
Notas operativas: {{NOTAS_OPERATIVAS}}
```

Al duplicar el tablero, la automatización de CSF debe reemplazar esas variables con los datos reales del cliente.

## Entrada Drive -> OCR/IA

El disparador puede vivir en Zapier o n8n. El contrato estable es el endpoint interno:

`POST /api/internal/receipt-extraction`

Headers:

```http
Authorization: Bearer ${FMG_AUTOMATION_SECRET}
Content-Type: application/json
```

Payload mínimo:

```json
{
  "driveFileId": "google-drive-file-id",
  "fileUrl": "https://drive.google.com/...",
  "userId": "firebase-user-id",
  "companyId": "firebase-company-id",
  "mondayBoardId": "18414962380",
  "source": "zapier",
  "extraction": {
    "proveedor": "Waldo's Dolar Mart de México",
    "razonSocial": "Waldo's Dolar Mart de México",
    "rfcProveedor": "WDM990126350",
    "fecha": "2026-05-19",
    "total": 164.95,
    "ticket": "230652",
    "portalFacturacion": "https://facturacion.waldos.com.mx/",
    "metodo": "Web",
    "metodoPago": "Débito BBVA",
    "tienda": "6564",
    "caja": "2",
    "ruta": "portal_web",
    "confidence": 0.93,
    "missingFields": []
  }
}
```

## Salida esperada

El endpoint actualiza:

- `receipts/{driveFileId}`
- `companies/{companyId}/expenses/{driveFileId}`
- `receiptAutomation/{driveFileId}`
- Item Monday del tablero del cliente

El item Monday se busca primero por columna `ID` (`enlace4`) = `driveFileId`. Si existe, se actualiza. Si no existe, se crea. Esto permite reprocesar el mismo archivo sin duplicar items.

## Columnas Monday usadas

| Campo | Columna Monday |
| --- | --- |
| `driveFileId` | `enlace4` / ID |
| Estado | `status` |
| Fecha compra | `text_mkthrxct` |
| Total | `n_meros` |
| Razón social / proveedor | `text_mky7nh3g` |
| Link recibo | `text_mkqygzgk` |
| Método | `proyecto` |
| Ticket | `correo` |
| Portal facturación | `link_mkqg4vhb` |

## Estados

- `NUEVO`: archivo recibido.
- `SIN INFORMACIÓN`: lectura incompleta.
- `INFO`: requiere criterio humano.
- `En Proceso`: datos suficientes para gestionar factura.
- `Listo`: CFDI recibido y validado.
- `No Facturado`: proveedor o ticket no aplica.
- `DUPLICADA`: archivo repetido.

## Ruta de gestión

- `portal_web`: el recibo tiene portal o QR útil.
- `correo`: requiere correo de facturación.
- `whatsapp`: requiere gestión por WhatsApp.
- `revision`: requiere revisión humana.
- `no_facturable`: termina como `No Facturado`.

## Checklist por cliente nuevo

1. Crear perfil.
2. Crear o vincular empresa.
3. Activar trial.
4. Crear carpeta Drive de empresa.
5. Crear carpeta personal del usuario.
6. Duplicar tablero machote.
7. Guardar `mondayBoardId`, `driveFolderId` y `driveDocsFolderId` en Firebase.
8. Compartir carpeta y tablero con el cliente.
9. Subir CSF.
10. Extraer datos fiscales de CSF.
11. Actualizar descripción del tablero.
12. Subir primer recibo.
13. Ejecutar OCR/IA.
14. Confirmar upsert Monday/Firebase por `driveFileId`.
15. Revisar ruta de gestión y estado final.
