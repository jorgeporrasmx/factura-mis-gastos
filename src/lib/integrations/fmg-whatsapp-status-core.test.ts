import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  extractWhatsAppInboundMessages,
  extractWhatsAppStatusEvents,
  getWhatsAppStatusLabel,
  shouldApplyWhatsAppStatus,
  verifyMetaWebhookSignature,
  type WhatsAppStatusEvent,
} from './fmg-whatsapp-status-core.ts';

test('verifica la firma HMAC SHA-256 sobre el cuerpo crudo', () => {
  const body = JSON.stringify({ object: 'whatsapp_business_account' });
  const secret = 'app-secret-de-prueba';
  const signature = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
  assert.equal(verifyMetaWebhookSignature(body, signature, secret), true);
  assert.equal(verifyMetaWebhookSignature(`${body} `, signature, secret), false);
  assert.equal(verifyMetaWebhookSignature(body, 'sha256=incorrecta', secret), false);
});

test('extrae únicamente estados válidos del número autorizado', () => {
  const events = extractWhatsAppStatusEvents(
    {
      object: 'whatsapp_business_account',
      entry: [{ changes: [
        { field: 'messages', value: {
          metadata: { phone_number_id: 'phone-1' },
          statuses: [
            { id: 'wamid.1', status: 'delivered', timestamp: '1785547383', recipient_id: '521234567890' },
            { id: 'wamid.2', status: 'unsupported', timestamp: '1785547384' },
          ],
        } },
        { field: 'messages', value: {
          metadata: { phone_number_id: 'phone-2' },
          statuses: [{ id: 'wamid.3', status: 'read', timestamp: '1785547385' }],
        } },
      ] }],
    },
    'phone-1'
  );

  assert.deepEqual(events, [{
    messageId: 'wamid.1',
    status: 'delivered',
    timestamp: 1785547383,
    recipientId: '521234567890',
    detail: undefined,
  }]);
});

test('extrae el detalle seguro de una falla', () => {
  const events = extractWhatsAppStatusEvents({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ field: 'messages', value: { statuses: [{
      id: 'wamid.failed',
      status: 'failed',
      timestamp: '1785547386',
      errors: [{
        code: 131026,
        title: 'Message undeliverable',
        error_data: { details: 'Destino no disponible' },
      }],
    }] } }] }],
  });

  assert.equal(events[0]?.detail, '131026 · Message undeliverable · Destino no disponible');
  assert.equal(getWhatsAppStatusLabel(events[0]!.status), 'Fallido');
});

test('usa el timestamp de Meta para impedir regresiones por eventos fuera de orden', () => {
  const delivered: WhatsAppStatusEvent = { messageId: 'wamid.1', status: 'delivered', timestamp: 200 };
  const olderSent: WhatsAppStatusEvent = { messageId: 'wamid.1', status: 'sent', timestamp: 100 };
  const newerRead: WhatsAppStatusEvent = { messageId: 'wamid.1', status: 'read', timestamp: 300 };
  assert.equal(shouldApplyWhatsAppStatus(undefined, undefined, delivered), true);
  assert.equal(shouldApplyWhatsAppStatus('delivered', 200, olderSent), false);
  assert.equal(shouldApplyWhatsAppStatus('delivered', 200, newerRead), true);
});

test('extrae mensajes entrantes y conserva la referencia al envío contestado', () => {
  const messages = extractWhatsAppInboundMessages(
    {
      object: 'whatsapp_business_account',
      entry: [{ changes: [{
        field: 'messages',
        value: {
          metadata: { phone_number_id: 'phone-1' },
          contacts: [{ wa_id: '521234567890', profile: { name: 'Cliente Demo' } }],
          messages: [{
            id: 'wamid.inbound',
            from: '521234567890',
            timestamp: '1785547500',
            type: 'text',
            context: { id: 'wamid.outbound' },
            text: { body: 'Sí, en un momento envío la factura.' },
          }],
        },
      }] }],
    },
    'phone-1'
  );

  assert.deepEqual(messages, [{
    messageId: 'wamid.inbound',
    from: '521234567890',
    timestamp: 1785547500,
    type: 'text',
    content: 'Sí, en un momento envío la factura.',
    contactName: 'Cliente Demo',
    contextMessageId: 'wamid.outbound',
  }]);
});

test('representa archivos entrantes sin descargarlos ni procesarlos', () => {
  const messages = extractWhatsAppInboundMessages({
    object: 'whatsapp_business_account',
    entry: [{ changes: [{ field: 'messages', value: { messages: [{
      id: 'wamid.document',
      from: '521234567890',
      timestamp: '1785547600',
      type: 'document',
      document: { filename: 'factura.pdf', caption: 'Aquí está' },
    }] } }] }],
  });
  assert.equal(messages[0]?.content, '[Documento recibido: factura.pdf] Aquí está');
});
