# Integración ContaLink - API Documentada

## Base URL
```
https://api.contalink.com (verificar URL exacta)
```

## Autenticación
```
Header: Authorization: {API_KEY}
```
El API key está relacionado a un usuario específico en ContaLink.

---

## Endpoints Disponibles

### 📄 FACTURAS / CFDIs

#### Listar Facturas
```http
GET /invoices/list/
```

**Parámetros de Query:**
- `page` - Número de página (paginación de 500 registros)
- `start_date` - Fecha inicio (YYYY-MM-DD)
- `end_date` - Fecha fin (YYYY-MM-DD)
- `type` - Tipo de comprobante (I=Ingreso, E=Egreso, P=Pago, N=Nómina)

**Respuesta:**
```json
{
  "status": 1,
  "message": "Éxito",
  "list": {
    "total": 150,
    "length": 100,
    "next_page": 2,
    "invoices": [
      {
        "uuid": "ABC123-...",
        "folio": "001",
        "serie": "A",
        "fecha_expedicion": "2024-01-15",
        "rfc_emisor": "ABC123456789",
        "nombre_emisor": "Empresa SA de CV",
        "rfc_receptor": "XYZ987654321",
        "nombre_receptor": "Cliente SA",
        "subtotal": 1000.00,
        "total": 1160.00,
        "descuento": 0,
        "tipo_de_comprobante": "I",
        "estatus": "Vigente",
        "es_nomina": false,
        "conceptos": [
          {
            "producto": "Servicio de consultoría",
            "cantidad": 1,
            "precio_unitario": 1000.00,
            "importe": 1000.00,
            "clave_sat": "80101500",
            "unidad": "E48",
            "impuestos": [
              {
                "impuesto": "IVA",
                "base": 1000.00,
                "tasaocuota": 0.16,
                "importe": 160.00,
                "retencion": false
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### Verificar Estado de Factura
```http
GET /invoices/check-status/{uuid}/
```

**Respuesta:**
```json
{
  "status": 1,
  "message": "Éxito",
  "invoice": {
    "estatus": "Vigente",
    "metodo_pago": "PUE",
    "contabilizado": true,
    "tesoreria": 0.0
  }
}
```

#### Subir XML
```http
POST /invoices/upload/
```

**Body:**
```json
{
  "xml": "base64_encoded_xml_content",
  "name": "factura_001.xml"  // opcional
}
```

**Respuesta:**
```json
{
  "status": 1,
  "message": "Éxito",
  "result": {
    "url": "https://firebase.url/status"  // URL para consultar estado de carga
  }
}
```

---

### 💰 CONCILIACIÓN

#### Conciliar Pago con Factura
```http
POST /conciliation/create/
```

**Body:**
```json
{
  "invoice_id": "UUID-de-la-factura",
  "payment_form": "03",  // Clave SAT forma de pago
  "payment_date": "2024-01-20T10:30:00",
  "amount": 1160.00,
  "bank_account": "Banamex Cuenta Principal"
}
```

---

### 🏦 TESORERÍA / MOVIMIENTOS BANCARIOS

#### Crear Movimiento Bancario
```http
POST /treasury/bank-transactions/
```

**Body:**
```json
{
  "reference": "REF-001",
  "date": "2024-01-20",
  "bank": "Banamex",
  "deposit": 5000.00,
  "withdrawal": 0,
  "description": "Depósito de cliente"
}
```

#### Obtener Movimiento
```http
GET /treasury/bank-transactions/{id}/
```

---

### 📊 CONTABILIDAD

#### Balanza de Comprobación
```http
GET /accounting/trial-balance/
```

**Parámetros:**
- `start_date` - Fecha inicio
- `end_date` - Fecha fin
- `period` - O (omitir periodo 13) o I (incluir)

#### Saldo de Cuenta
```http
GET /accounting/get-account-balance/{accountnumber}/
```

**Parámetros:**
- `date` - Fecha para el saldo
- `period` - O o I

#### Crear Póliza Manual
```http
POST /accounting/manual-accounting-policy/
```

**Body:**
```json
{
  "record_date": "2024-01-20",
  "description": "Póliza de ajuste",
  "accounting_records": {
    "account_code": "110-001",
    "debit": 1000.00,
    "credit": 0
  }
}
```

---

## Flujo de Integración para Factura Mis Gastos

### Sincronización Diaria de CFDIs

```
┌─────────────────────────────────────────────────────────────┐
│                    CRON JOB (6:00 AM)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Para cada empresa con contalinkApiKey:                     │
│                                                             │
│  1. GET /invoices/list/?start_date={lastSync}&type=E        │
│     (Facturas de EGRESO = gastos)                           │
│                                                             │
│  2. Para cada factura recibida:                             │
│     a. Buscar match en Monday por:                          │
│        - RFC emisor                                         │
│        - Monto (±5% tolerancia)                             │
│        - Fecha (±7 días)                                    │
│                                                             │
│  3. Si hay match:                                           │
│     - Actualizar item en Monday                             │
│     - Guardar UUID                                          │
│     - Cambiar estado a "Facturado"                          │
│                                                             │
│  4. Si no hay match:                                        │
│     - Crear item nuevo con estado "INFO"                    │
│     - Marcar para revisión manual                           │
│                                                             │
│  5. Actualizar lastSync en Firebase                         │
└─────────────────────────────────────────────────────────────┘
```

### Lógica de Matcheo

```typescript
interface MatchCriteria {
  rfcEmisor: string;      // Debe coincidir exactamente
  monto: number;          // Tolerancia ±5%
  fecha: string;          // Tolerancia ±7 días
}

function findMatch(cfdi: ContalinkInvoice, mondayItems: MondayItem[]): MondayItem | null {
  return mondayItems.find(item => {
    // RFC debe coincidir
    if (item.rfcEmisor?.toUpperCase() !== cfdi.rfc_emisor?.toUpperCase()) {
      return false;
    }
    
    // Monto con tolerancia del 5%
    const montoTolerance = item.total * 0.05;
    if (Math.abs(item.total - cfdi.total) > montoTolerance) {
      return false;
    }
    
    // Fecha con tolerancia de 7 días
    const itemDate = new Date(item.fechaCompra);
    const cfdiDate = new Date(cfdi.fecha_expedicion);
    const daysDiff = Math.abs(itemDate - cfdiDate) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      return false;
    }
    
    return true;
  });
}
```

---

## Variables de Entorno

```env
# ContaLink
CONTALINK_BASE_URL=https://api.contalink.com
CONTALINK_API_KEY=your_api_key  # Para testing/admin

# Por cliente (en Firebase)
# company.contalinkApiKey
# company.contalinkLastSync
```

---

## Estructura Firebase (Company)

```typescript
interface Company {
  // ... otros campos
  contalinkApiKey?: string;       // API key del cliente
  contalinkLastSync?: Timestamp;  // Última sincronización
  contalinkEnabled?: boolean;     // Si tiene ContaLink activo
}
```

---

## Código de Ejemplo

```typescript
// src/lib/contalink.ts

const CONTALINK_BASE_URL = process.env.CONTALINK_BASE_URL || 'https://api.contalink.com';

interface ContalinkConfig {
  apiKey: string;
}

export async function listInvoices(
  config: ContalinkConfig,
  filters: {
    startDate?: string;
    endDate?: string;
    type?: 'I' | 'E' | 'P' | 'N';
    page?: number;
  }
): Promise<ContalinkInvoiceList> {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.type) params.append('type', filters.type);
  if (filters.page) params.append('page', filters.page.toString());

  const response = await fetch(
    `${CONTALINK_BASE_URL}/invoices/list/?${params}`,
    {
      headers: {
        'Authorization': config.apiKey,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`ContaLink API error: ${response.status}`);
  }

  return response.json();
}

export async function checkInvoiceStatus(
  config: ContalinkConfig,
  uuid: string
): Promise<ContalinkInvoiceStatus> {
  const response = await fetch(
    `${CONTALINK_BASE_URL}/invoices/check-status/${uuid}/`,
    {
      headers: {
        'Authorization': config.apiKey,
        'Accept': 'application/json',
      },
    }
  );

  return response.json();
}
```

---

## Próximos Pasos

- [ ] Crear `src/lib/contalink.ts` con funciones de API
- [ ] Crear endpoint `/api/contalink/sync` para sincronización manual
- [ ] Configurar cron job para sincronización automática
- [ ] Agregar campo `contalinkApiKey` al formulario de empresa
- [ ] UI para configurar ContaLink en el portal admin

---

## Notas

- El matcheo actual en Make/n8n **funciona muy bien** (según Jorge)
- Solo hay que configurarlo para cada cliente nuevo
- Cada cliente necesita su propia API key de ContaLink
- El usuario debe registrar su FIEL directamente en ContaLink
