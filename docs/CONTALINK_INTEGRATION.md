# Integración ContaLink

## ¿Qué es ContaLink?

ContaLink es un sistema contable en la nube que permite:
- Descargar automáticamente CFDIs del SAT
- Gestionar múltiples RFCs/empresas
- Acceso via API para automatizaciones

## Uso Actual en Factura Mis Gastos

### Flujo:
1. Usuario registra su **e.firma (FIEL)** directamente en ContaLink
2. ContaLink descarga automáticamente los CFDIs recibidos del SAT
3. Automatización en Make/n8n matchea facturas con recibos en Monday

### Requisitos por Usuario:
- Cuenta en ContaLink
- FIEL registrada (cada usuario la sube directamente)
- API key de ContaLink (por cuenta/RFC)

## Configuración

### Variables de Entorno
```env
# API ContaLink (tu cuenta)
CONTALINK_API_KEY=tu_api_key_aqui
CONTALINK_API_SECRET=tu_api_secret_aqui

# Para cada cliente se necesita su propia API key
# Almacenar en Firebase por empresa
```

### Estructura en Firebase (Company)
```typescript
interface Company {
  // ... otros campos
  contalinkApiKey?: string;      // API key del cliente
  contalinkLastSync?: Date;      // Última sincronización
  contalinkRfcId?: string;       // ID del RFC en ContaLink
}
```

## API ContaLink (Documentación Pendiente)

### Endpoints Típicos (por verificar con documentación oficial):

```
GET  /api/v1/cfdis              # Listar CFDIs
GET  /api/v1/cfdis/{uuid}       # Obtener CFDI específico
GET  /api/v1/cfdis/download     # Descargar XML/PDF
POST /api/v1/cfdis/sync         # Forzar sincronización con SAT
```

### Headers Requeridos:
```
Authorization: Bearer {api_key}
Content-Type: application/json
```

## Automatización: Matcheo Factura ↔ Recibo

### Lógica de Matcheo:

```
Para cada CFDI descargado:
  1. Extraer: UUID, RFC emisor, monto, fecha
  2. Buscar en Monday items donde:
     - Estado = "En Proceso" o "Listo"
     - RFC emisor coincide (o similar)
     - Monto coincide (±5% tolerancia)
     - Fecha cercana (±7 días)
  3. Si hay match:
     - Actualizar item con UUID
     - Cambiar estado a "Facturado"
     - Adjuntar link al CFDI
  4. Si no hay match:
     - Crear item nuevo con estado "INFO"
     - Marcar para revisión manual
```

### Trigger de Sincronización:
- **Opción A:** Cron job diario (ej: 6am)
- **Opción B:** Webhook desde ContaLink (si disponible)
- **Opción C:** Manual desde portal admin

## Tareas Pendientes

### Para Configurar:

- [ ] Obtener documentación oficial de API ContaLink
- [ ] Probar endpoints con API key de Jorge
- [ ] Crear lib `contalink.ts` con funciones de API
- [ ] Implementar sincronización automática
- [ ] Crear endpoint `/api/contalink/sync`
- [ ] Configurar cron job para sync diario

### Para Cada Cliente Nuevo:

1. Cliente crea cuenta en ContaLink
2. Cliente registra FIEL en ContaLink
3. Cliente obtiene API key de su cuenta
4. Admin configura API key en Firebase (empresa)
5. Se activa sincronización automática

## Seguridad

⚠️ **IMPORTANTE:**
- Las API keys de ContaLink son **por cliente**
- NO almacenar FIEL/e.firma en nuestros sistemas
- El usuario sube su FIEL directamente a ContaLink
- Solo almacenamos el API key para consultas

## Preguntas para Jorge

1. ¿Tienes acceso a la documentación de API de ContaLink?
2. ¿El matcheo actual (Make/n8n) está funcionando? ¿Dónde está?
3. ¿Qué datos exactos devuelve la API de ContaLink?
4. ¿Hay webhook disponible cuando llegan nuevos CFDIs?

---

## Notas de Implementación Futura

### Opción 1: Polling (actual)
```
Cada día a las 6am:
  1. Para cada empresa con contalinkApiKey:
     a. Llamar API ContaLink: GET /cfdis?desde={lastSync}
     b. Para cada CFDI nuevo:
        - Buscar match en Monday
        - Actualizar o crear item
     c. Actualizar lastSync
```

### Opción 2: Webhook (ideal)
```
ContaLink envía webhook cuando hay nuevo CFDI:
  1. Recibir en /api/webhooks/contalink
  2. Validar firma/autenticación
  3. Procesar CFDI inmediatamente
  4. Actualizar Monday en tiempo real
```

### Opción 3: Híbrido
- Webhook para CFDIs nuevos (tiempo real)
- Cron diario para reconciliación y catchup
