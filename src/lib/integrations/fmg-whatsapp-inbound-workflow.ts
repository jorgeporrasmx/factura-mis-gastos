import type { WhatsAppInboundMessage } from './fmg-whatsapp-status-core';

export type WhatsAppInboundClaim =
  | { matched: false }
  | { matched: true; itemId: string; eventKey: string; shouldMirror: boolean };

export type WhatsAppInboundWorkflowPorts = {
  claim(message: WhatsAppInboundMessage): Promise<WhatsAppInboundClaim>;
  mirror(itemId: string, message: WhatsAppInboundMessage): Promise<void>;
  markMirrored(eventKey: string): Promise<void>;
};

export type WhatsAppInboundWorkflowResult =
  | { status: 'unmatched' }
  | { status: 'ignored'; itemId: string }
  | { status: 'updated'; itemId: string };

export async function runWhatsAppInboundWorkflow(
  message: WhatsAppInboundMessage,
  ports: WhatsAppInboundWorkflowPorts
): Promise<WhatsAppInboundWorkflowResult> {
  const claim = await ports.claim(message);
  if (!claim.matched) return { status: 'unmatched' };
  if (!claim.shouldMirror) return { status: 'ignored', itemId: claim.itemId };

  await ports.mirror(claim.itemId, message);
  await ports.markMirrored(claim.eventKey);
  return { status: 'updated', itemId: claim.itemId };
}
