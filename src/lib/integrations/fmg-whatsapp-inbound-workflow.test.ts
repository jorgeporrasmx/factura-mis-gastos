import assert from 'node:assert/strict';
import test from 'node:test';
import type { WhatsAppInboundMessage } from './fmg-whatsapp-status-core.ts';
import {
  runWhatsAppInboundWorkflow,
  type WhatsAppInboundWorkflowPorts,
} from './fmg-whatsapp-inbound-workflow.ts';

const message: WhatsAppInboundMessage = {
  messageId: 'wamid.inbound',
  from: '521234567890',
  timestamp: 1785547500,
  type: 'text',
  content: 'Respuesta del cliente',
};

const target = {
  companyId: 'company-1',
  boardId: 'board-1',
  itemId: 'item-1',
  columns: {
    method: 'method', phone: 'phone', purchaseDate: 'date', total: 'total',
    receiptDriveUrl: 'receipt', whatsAppMessageId: 'wa_id', whatsAppState: 'wa_state',
  },
};

function portsForClaim(claim: Awaited<ReturnType<WhatsAppInboundWorkflowPorts['claim']>>) {
  const calls: string[] = [];
  const ports: WhatsAppInboundWorkflowPorts = {
    async claim() { calls.push('claim'); return claim; },
    async mirror(selectedTarget) { calls.push(`mirror:${selectedTarget.itemId}`); },
    async markMirrored(eventKey) { calls.push(`mirrored:${eventKey}`); },
  };
  return { ports, calls };
}

test('publica una respuesta correlacionada una sola vez', async () => {
  const { ports, calls } = portsForClaim({
    matched: true, target, eventKey: 'inbound-1', shouldMirror: true,
  });
  assert.deepEqual(await runWhatsAppInboundWorkflow(message, ports), {
    status: 'updated', itemId: 'item-1',
  });
  assert.deepEqual(calls, ['claim', 'mirror:item-1', 'mirrored:inbound-1']);
});

test('ignora un mensaje entrante ya reflejado', async () => {
  const { ports, calls } = portsForClaim({
    matched: true, target, eventKey: 'inbound-1', shouldMirror: false,
  });
  assert.deepEqual(await runWhatsAppInboundWorkflow(message, ports), {
    status: 'ignored', itemId: 'item-1',
  });
  assert.deepEqual(calls, ['claim']);
});
