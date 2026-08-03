import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildWhatsAppTemplatePayload,
  canSendInvoiceRequest,
  extractDriveFileId,
  formatInvoiceTotal,
  getInvoiceRequestIdempotencyKey,
  isMondayWhatsAppTrigger,
  normalizeWhatsAppPhone,
  type InvoiceRequest,
} from './fmg-whatsapp-core.ts';

const fiscalProfile = {
  legalName: 'EMPRESA DEMO SA DE CV',
  rfc: 'EDE010101AAA',
  taxRegime: '601 - General de Ley Personas Morales',
  postalCode: '31000',
  cfdiUse: 'G03 - Gastos en general',
  invoiceEmail: 'facturas@example.com',
  csfUrl: 'https://drive.google.com/file/d/csf/view',
  verifiedAt: '2026-08-02T00:00:00.000Z',
  verifiedBy: 'operaciones@example.com',
  version: 'profile-v1',
};

const mondayColumns = {
  method: 'method',
  phone: 'phone',
  purchaseDate: 'purchase_date',
  total: 'total',
  receiptDriveUrl: 'receipt',
  whatsAppMessageId: 'wa_id',
  whatsAppState: 'wa_state',
};

function invoiceRequest(overrides: Partial<InvoiceRequest> = {}): InvoiceRequest {
  return {
    companyId: 'company-1',
    companyName: 'Empresa Demo',
    boardId: '8964055261',
    itemId: '1',
    merchant: 'Comercio',
    phone: '526144273301',
    purchaseDate: '2026-07-29',
    total: '100.00 MXN',
    receiptDriveFileId: '1AbCdEfGhIjKlMnOpQrStUvWxYz',
    fiscalProfile,
    mondayColumns,
    ...overrides,
  };
}

test('normaliza teléfonos mexicanos sin duplicar el prefijo', () => {
  assert.equal(normalizeWhatsAppPhone('614 427 3301'), '526144273301');
  assert.equal(normalizeWhatsAppPhone('+52 614 427 3301'), '526144273301');
  assert.equal(normalizeWhatsAppPhone('+52 1 614 427 3301'), '526144273301');
});

test('rechaza teléfonos inválidos', () => {
  assert.throws(() => normalizeWhatsAppPhone('123'), /formato internacional/);
});

test('extrae IDs de los formatos habituales de Google Drive', () => {
  const id = '1AbCdEfGhIjKlMnOpQrStUvWxYz';
  assert.equal(extractDriveFileId(`https://drive.google.com/file/d/${id}/view`), id);
  assert.equal(extractDriveFileId(`https://drive.google.com/open?id=${id}`), id);
  assert.equal(extractDriveFileId(id), id);
});

test('formatea el total en MXN', () => {
  assert.equal(formatInvoiceTotal('1234.5'), '1,234.50 MXN');
});

test('la clave idempotente es estable y cambia con el elemento', () => {
  const request = invoiceRequest();
  const first = getInvoiceRequestIdempotencyKey(request, 'template');
  assert.equal(first, getInvoiceRequestIdempotencyKey(request, 'template'));
  assert.notEqual(
    first,
    getInvoiceRequestIdempotencyKey({ ...request, itemId: '2' }, 'template')
  );
  assert.notEqual(
    first,
    getInvoiceRequestIdempotencyKey({ ...request, companyId: 'company-2' }, 'template')
  );
  assert.equal(
    first,
    getInvoiceRequestIdempotencyKey(
      {
        ...request,
        phone: '521111111111',
        total: '$999.00',
        purchaseDate: '2026-07-30',
        receiptDriveFileId: 'otro-recibo',
      },
      'renamed-template'
    )
  );
});

test('acepta únicamente el cambio correcto de Monday a WhatsApp', () => {
  const event = {
    boardId: 8964055261,
    pulseId: 123,
    columnId: 'proyecto',
    value: { label: { text: ' WhatsApp ' } },
  };
  assert.equal(isMondayWhatsAppTrigger(event, '8964055261', 'proyecto'), true);
  assert.equal(
    isMondayWhatsAppTrigger({ ...event, boardId: 1 }, '8964055261', 'proyecto'),
    false
  );
  assert.equal(
    isMondayWhatsAppTrigger(
      { ...event, value: { label: { text: 'Correo' } } },
      '8964055261',
      'proyecto'
    ),
    false
  );
});

test('construye la plantilla aprobada con recibo, fecha y total', () => {
  const request = invoiceRequest({ receiptDriveFileId: 'drive-id' });
  const payload = buildWhatsAppTemplatePayload(
    request,
    'media-1',
    'solicitud_factura_fmg_v1',
    'es_MX'
  );

  assert.equal(payload.to, '526144273301');
  assert.equal(payload.template.name, 'solicitud_factura_fmg_v1');
  assert.equal(payload.template.language.code, 'es_MX');
  assert.deepEqual(payload.template.components[0], {
    type: 'header',
    parameters: [{ type: 'image', image: { id: 'media-1' } }],
  });
  assert.deepEqual(payload.template.components[1], {
    type: 'body',
    parameters: [
      { type: 'text', text: '2026-07-29' },
      { type: 'text', text: '100.00 MXN' },
      { type: 'text', text: 'EMPRESA DEMO SA DE CV' },
      { type: 'text', text: 'EDE010101AAA' },
      { type: 'text', text: '601 - General de Ley Personas Morales' },
      { type: 'text', text: '31000' },
      { type: 'text', text: 'G03 - Gastos en general' },
      { type: 'text', text: 'facturas@example.com' },
      { type: 'text', text: 'https://drive.google.com/file/d/csf/view' },
    ],
  });
});

test('el envío real está cerrado salvo modo live o elemento de prueba autorizado', () => {
  assert.equal(canSendInvoiceRequest(undefined, '123', undefined), false);
  assert.equal(canSendInvoiceRequest('disabled', '123', '123'), false);
  assert.equal(canSendInvoiceRequest('test', '123', '999'), false);
  assert.equal(canSendInvoiceRequest('test', '123', '123'), true);
  assert.equal(canSendInvoiceRequest('live', '123', undefined), true);
});
