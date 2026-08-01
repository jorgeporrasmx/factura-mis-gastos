import type { WhatsAppStatusEvent } from './fmg-whatsapp-status-core';

export type WhatsAppStatusClaim =
  | { matched: false }
  | { matched: true; itemId: string; eventKey: string; shouldMirror: boolean };

export type WhatsAppStatusWorkflowPorts = {
  claim(event: WhatsAppStatusEvent): Promise<WhatsAppStatusClaim>;
  mirror(itemId: string, event: WhatsAppStatusEvent): Promise<void>;
  markMirrored(eventKey: string): Promise<void>;
};

export type WhatsAppStatusWorkflowResult =
  | { status: 'unmatched' }
  | { status: 'ignored'; itemId: string }
  | { status: 'updated'; itemId: string };

export async function runWhatsAppStatusWorkflow(
  event: WhatsAppStatusEvent,
  ports: WhatsAppStatusWorkflowPorts
): Promise<WhatsAppStatusWorkflowResult> {
  const claim = await ports.claim(event);
  if (!claim.matched) return { status: 'unmatched' };
  if (!claim.shouldMirror) return { status: 'ignored', itemId: claim.itemId };

  await ports.mirror(claim.itemId, event);
  await ports.markMirrored(claim.eventKey);
  return { status: 'updated', itemId: claim.itemId };
}
