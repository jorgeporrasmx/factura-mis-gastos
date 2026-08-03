import assert from 'node:assert/strict';
import test from 'node:test';
import type { WhatsAppStatusEvent } from './fmg-whatsapp-status-core.ts';
import {
  runWhatsAppStatusWorkflow,
  type WhatsAppStatusWorkflowPorts,
} from './fmg-whatsapp-status-workflow.ts';

const event: WhatsAppStatusEvent = {
  messageId: 'wamid.test',
  status: 'delivered',
  timestamp: 1785547383,
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

function portsForClaim(claim: Awaited<ReturnType<WhatsAppStatusWorkflowPorts['claim']>>) {
  const calls: string[] = [];
  const ports: WhatsAppStatusWorkflowPorts = {
    async claim() { calls.push('claim'); return claim; },
    async mirror(selectedTarget, statusEvent) { calls.push(`mirror:${selectedTarget.itemId}:${statusEvent.status}`); },
    async markMirrored(eventKey) { calls.push(`mirrored:${eventKey}`); },
  };
  return { ports, calls };
}

test('ignora estados que no pertenecen a un mensaje registrado', async () => {
  const { ports, calls } = portsForClaim({ matched: false });
  assert.deepEqual(await runWhatsAppStatusWorkflow(event, ports), { status: 'unmatched' });
  assert.deepEqual(calls, ['claim']);
});

test('refleja una transición nueva en Monday y después confirma el espejo', async () => {
  const { ports, calls } = portsForClaim({
    matched: true, target, eventKey: 'event-1', shouldMirror: true,
  });
  assert.deepEqual(await runWhatsAppStatusWorkflow(event, ports), {
    status: 'updated', itemId: 'item-1',
  });
  assert.deepEqual(calls, ['claim', 'mirror:item-1:delivered', 'mirrored:event-1']);
});

test('un evento repetido no vuelve a escribir en Monday', async () => {
  const { ports, calls } = portsForClaim({
    matched: true, target, eventKey: 'event-1', shouldMirror: false,
  });
  assert.deepEqual(await runWhatsAppStatusWorkflow(event, ports), {
    status: 'ignored', itemId: 'item-1',
  });
  assert.deepEqual(calls, ['claim']);
});

test('si Monday falla no marca el evento como reflejado y permite el reintento de Meta', async () => {
  const { ports, calls } = portsForClaim({
    matched: true, target, eventKey: 'event-1', shouldMirror: true,
  });
  ports.mirror = async () => {
    calls.push('mirror:error');
    throw new Error('Monday temporalmente no disponible');
  };
  await assert.rejects(runWhatsAppStatusWorkflow(event, ports), /Monday/);
  assert.deepEqual(calls, ['claim', 'mirror:error']);
});
