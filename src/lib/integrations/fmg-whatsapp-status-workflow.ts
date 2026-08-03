import type { WhatsAppStatusEvent } from './fmg-whatsapp-status-core';
import type { InvoiceRequestMondayTarget } from './fmg-whatsapp-tenant-core';

export type WhatsAppStatusClaim =
  | { matched: false }
  | {
      matched: true;
      target: InvoiceRequestMondayTarget;
      eventKey: string;
      shouldMirror: boolean;
    };

export type WhatsAppStatusWorkflowPorts = {
  claim(event: WhatsAppStatusEvent): Promise<WhatsAppStatusClaim>;
  mirror(target: InvoiceRequestMondayTarget, event: WhatsAppStatusEvent): Promise<void>;
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
  if (!claim.shouldMirror) return { status: 'ignored', itemId: claim.target.itemId };

  await ports.mirror(claim.target, event);
  await ports.markMirrored(claim.eventKey);
  return { status: 'updated', itemId: claim.target.itemId };
}
