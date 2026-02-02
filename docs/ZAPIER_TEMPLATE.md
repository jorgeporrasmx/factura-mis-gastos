# Zapier Template: Drive → Monday

## Descripción
Cada usuario/empleado necesita su propia automatización en Zapier que detecte cuando sube un archivo a su carpeta de Drive y cree un item en el tablero de Monday de su empresa.

## Flujo

```
┌─────────────────────┐
│  Google Drive       │
│  Nueva archivo en   │
│  carpeta empleado   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Filter             │
│  Solo imágenes/PDF  │
│  (tickets/recibos)  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  OpenAI             │
│  Analizar imagen    │
│  Extraer datos      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Monday.com         │
│  Crear item en      │
│  tablero empresa    │
│  + Tag empleado     │
└─────────────────────┘
```

## Configuración del Zap

### Paso 1: Trigger - Google Drive

**App:** Google Drive  
**Trigger:** New File in Folder  
**Configuración:**
- **Drive:** Shared Drive o My Drive (según configuración)
- **Folder:** `[ID de carpeta del empleado]`
- **Include File Contents:** Yes (para poder analizar)

### Paso 2: Filter (opcional pero recomendado)

**Condición:** Solo continuar si:
- File MIME Type contains `image/` OR
- File MIME Type contains `application/pdf`

Esto evita procesar archivos que no son recibos.

### Paso 3: OpenAI - Analizar Recibo

**App:** OpenAI (ChatGPT)  
**Action:** Send Prompt  
**Configuración:**

**Model:** gpt-4-vision-preview (para imágenes) o gpt-4-turbo  
**Prompt:**
```
Analiza este recibo/ticket y extrae la siguiente información en formato JSON:

{
  "proveedor": "nombre del establecimiento",
  "fecha": "YYYY-MM-DD",
  "total": 123.45,
  "metodo_pago": "efectivo|tarjeta|transferencia",
  "concepto": "breve descripción de la compra",
  "tiene_rfc": true/false,
  "rfc_emisor": "RFC si es visible"
}

Si algún campo no es visible o legible, usa null.
Responde SOLO con el JSON, sin explicaciones.
```

**Image URL:** `{{Step 1: Web Content Link}}`

### Paso 4: Code by Zapier (Parser)

**Action:** Run JavaScript  
**Input Data:**
- `openai_response`: `{{Step 3: Response}}`

**Code:**
```javascript
const response = inputData.openai_response;
let data;

try {
  // Limpiar respuesta (a veces viene con markdown)
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  data = JSON.parse(cleaned);
} catch (e) {
  // Si falla el parse, valores por defecto
  data = {
    proveedor: "Sin identificar",
    fecha: new Date().toISOString().split('T')[0],
    total: 0,
    concepto: "Pendiente de revisar"
  };
}

output = {
  proveedor: data.proveedor || "Sin identificar",
  fecha: data.fecha || new Date().toISOString().split('T')[0],
  total: data.total || 0,
  metodo_pago: data.metodo_pago || "No especificado",
  concepto: data.concepto || "",
  tiene_rfc: data.tiene_rfc ? "Sí" : "No",
  rfc_emisor: data.rfc_emisor || ""
};
```

### Paso 5: Monday.com - Crear Item

**App:** Monday.com  
**Action:** Create Item  
**Configuración:**

- **Board:** `[ID del tablero de la empresa]`
- **Group:** `Mes actual 2026` (o el grupo activo)
- **Item Name:** `{{Step 4: proveedor}}`

**Column Values:**
| Columna | Valor |
|---------|-------|
| Estado | `NUEVO` |
| Fecha de compra | `{{Step 4: fecha}}` |
| Total | `{{Step 4: total}}` |
| Empleado (tag) | `[Nombre del empleado]` |
| Método | Determinar según `metodo_pago` |
| Razón Social | `{{Step 4: rfc_emisor}}` |

### Paso 6: Monday.com - Add Update (opcional)

**App:** Monday.com  
**Action:** Create an Update  

**Item:** `{{Step 5: Item ID}}`  
**Update Body:**
```
📎 Recibo subido automáticamente

📄 Archivo: {{Step 1: File Name}}
🔗 Link: {{Step 1: Web View Link}}
📝 Concepto: {{Step 4: concepto}}
```

---

## Variables por Usuario

Cada Zap necesita estas variables específicas:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DRIVE_FOLDER_ID` | ID de la carpeta del empleado en Drive | `1ABC123xyz` |
| `MONDAY_BOARD_ID` | ID del tablero de la empresa | `18398058025` |
| `EMPLOYEE_NAME` | Nombre del empleado (para tag) | `Juan Pérez` |
| `EMPLOYEE_TAG_ID` | ID del tag del empleado (si ya existe) | `12345` |

---

## Crear Zap para Nuevo Usuario

### Proceso Manual (hasta automatizar):

1. **Obtener datos del usuario:**
   - Carpeta Drive ID (de Firebase/Company)
   - Tablero Monday ID (de Firebase/Company)
   - Nombre del empleado

2. **Duplicar Zap template**

3. **Configurar variables específicas:**
   - Actualizar Folder ID en el trigger
   - Actualizar Board ID en Monday
   - Actualizar nombre de empleado en el tag

4. **Activar Zap**

### Automatización Futura:

Se puede crear un endpoint `/api/zapier/create-user-zap` que use la API de Zapier para:
1. Duplicar el Zap template
2. Configurar las variables
3. Activar automáticamente

---

## Manejo de Errores

### Archivo no es recibo
- El filter lo descarta automáticamente

### OpenAI no puede leer el recibo
- Se crea item con valores por defecto
- Estado: "SIN INFORMACIÓN"
- Se agrega nota para revisión manual

### Monday falla
- Zapier reintenta automáticamente
- Se puede configurar email de alerta

---

## Métricas a Monitorear

1. **Recibos procesados por día/semana**
2. **Tasa de éxito de OCR**
3. **Items creados que requieren revisión manual**
4. **Errores por tipo**

---

## Zap Template ID

Una vez creado el template base, guardar el ID aquí para referencia:

**Template Zap ID:** `[PENDIENTE - crear en Zapier]`

**URL Template:** `https://zapier.com/app/editor/[ZAP_ID]`
