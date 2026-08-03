import assert from 'node:assert/strict';
import test from 'node:test';
import type { InvoiceRequest } from './fmg-whatsapp-core.ts';
import {
  runInvoiceRequestValidation,
  runInvoiceRequestWorkflow,
  type InvoiceRequestWorkflowPorts,
} from './fmg-whatsapp-workflow.ts';

const request: InvoiceRequest = {
  companyId: 'company-1',
  companyName: 'Empresa Demo',
  boardId: '8964055261',
  itemId: 'monday-item-1',
  merchant: 'Comercio de prueba',
  phone: '526144273301',
  purchaseDate: '2026-07-29',
  total: '100.00 MXN',
  receiptDriveFileId: 'drive-file-1',
  fiscalProfile: {
    legalName: 'EMPRESA DEMO SA DE CV',
    rfc: 'EDE010101AAA',
    taxRegime: '601',
    postalCode: '31000',
    cfdiUse: 'G03',
    invoiceEmail: 'facturas@example.com',
    csfUrl: 'https://drive.google.com/csf',
    verifiedAt: '2026-08-02T00:00:00.000Z',
    verifiedBy: 'operaciones@example.com',
    version: 'profile-v1',
  },
  mondayColumns: {
    method: 'method', phone: 'phone', purchaseDate: 'date', total: 'total',
    receiptDriveUrl: 'receipt', whatsAppMessageId: 'wa_id', whatsAppState: 'wa_state',
  },
};

function isolatedPorts() {
  let reserved = false;
  const calls: string[] = [];

  const ports: InvoiceRequestWorkflowPorts = {
    async loadRequest(itemId) {
      calls.push(`load:${itemId}`);
      return request;
    },
    async reserve() {
      calls.push('reserve');
      if (reserved) {
        return { key: 'key-1', duplicate: true };
      }
      reserved = true;
      return { key: 'key-1', duplicate: false };
    },
    async markPreparing() {
      calls.push('trace:preparing');
    },
    async downloadReceipt() {
      calls.push('receipt:download');
      return {
        bytes: new Uint8Array([1, 2, 3]),
        fileName: 'recibo.jpg',
        mimeType: 'image/jpeg',
      };
    },
    async uploadReceipt() {
      calls.push('meta:media');
      return 'media-1';
    },
    async sendTemplate(sentRequest, mediaId) {
      calls.push(`meta:message:${sentRequest.phone}:${mediaId}`);
      return 'wamid.test';
    },
    async markSent() {
      calls.push('trace:sent');
    },
    async markFailure() {
      calls.push('trace:failure');
    },
  };

  return { ports, calls };
}

test('simulación aislada valida sin reservar, trazar ni llamar a Meta', async () => {
  const { ports, calls } = isolatedPorts();
  const result = await runInvoiceRequestValidation(request.itemId, ports);

  assert.equal(result.request.phone, '526144273301');
  assert.equal(result.receipt.mimeType, 'image/jpeg');
  assert.deepEqual(calls, ['load:monday-item-1', 'receipt:download']);
});

test('flujo saliente registra preparación, envía una vez y registra éxito', async () => {
  const { ports, calls } = isolatedPorts();
  const result = await runInvoiceRequestWorkflow(request.itemId, ports);

  assert.deepEqual(result, {
    status: 'sent',
    messageId: 'wamid.test',
    idempotencyKey: 'key-1',
  });
  assert.deepEqual(calls, [
    'load:monday-item-1',
    'reserve',
    'trace:preparing',
    'receipt:download',
    'meta:media',
    'meta:message:526144273301:media-1',
    'trace:sent',
  ]);
});

test('dos eventos concurrentes producen un solo envío de plantilla', async () => {
  const { ports, calls } = isolatedPorts();
  const [first, second] = await Promise.all([
    runInvoiceRequestWorkflow(request.itemId, ports),
    runInvoiceRequestWorkflow(request.itemId, ports),
  ]);

  assert.deepEqual(
    [first.status, second.status].sort(),
    ['duplicate', 'sent']
  );
  assert.equal(
    calls.filter((call) => call.startsWith('meta:message:')).length,
    1
  );
  assert.equal(calls.filter((call) => call === 'meta:media').length, 1);
});

test('un duplicado posterior no descarga ni vuelve a enviar', async () => {
  const { ports, calls } = isolatedPorts();
  await runInvoiceRequestWorkflow(request.itemId, ports);
  const duplicate = await runInvoiceRequestWorkflow(request.itemId, ports);

  assert.equal(duplicate.status, 'duplicate');
  assert.equal(
    calls.filter((call) => call.startsWith('meta:message:')).length,
    1
  );
  assert.equal(calls.filter((call) => call === 'receipt:download').length, 1);
});

test('una falla se registra y se propaga sin un segundo intento automático', async () => {
  const { ports, calls } = isolatedPorts();
  ports.sendTemplate = async () => {
    calls.push('meta:message:error');
    throw new Error('respuesta incierta de Meta');
  };

  await assert.rejects(
    runInvoiceRequestWorkflow(request.itemId, ports),
    /respuesta incierta de Meta/
  );
  const duplicate = await runInvoiceRequestWorkflow(request.itemId, ports);

  assert.equal(duplicate.status, 'duplicate');
  assert.equal(calls.filter((call) => call === 'meta:message:error').length, 1);
  assert.equal(calls.filter((call) => call === 'trace:failure').length, 1);
});
