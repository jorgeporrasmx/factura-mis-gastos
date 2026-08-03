import type { InvoiceRequest } from './fmg-whatsapp-core';

export type WorkflowReservation = {
  key: string;
  duplicate: boolean;
  messageId?: string;
};

export type WorkflowReceipt = {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
};

export type InvoiceRequestWorkflowPorts = {
  loadRequest(itemId: string): Promise<InvoiceRequest>;
  reserve(request: InvoiceRequest): Promise<WorkflowReservation>;
  markPreparing(request: InvoiceRequest, key: string): Promise<void>;
  downloadReceipt(fileId: string): Promise<WorkflowReceipt>;
  uploadReceipt(receipt: WorkflowReceipt): Promise<string>;
  sendTemplate(request: InvoiceRequest, mediaId: string): Promise<string>;
  markSent(request: InvoiceRequest, key: string, messageId: string): Promise<void>;
  markFailure(request: InvoiceRequest, key: string, message: string): Promise<void>;
};

export type WorkflowResult =
  | { status: 'sent'; messageId: string; idempotencyKey: string }
  | { status: 'duplicate'; messageId?: string; idempotencyKey: string };

export async function runInvoiceRequestWorkflow(
  itemId: string,
  ports: InvoiceRequestWorkflowPorts
): Promise<WorkflowResult> {
  const request = await ports.loadRequest(itemId);
  const reservation = await ports.reserve(request);

  if (reservation.duplicate) {
    return {
      status: 'duplicate',
      messageId: reservation.messageId,
      idempotencyKey: reservation.key,
    };
  }

  try {
    await ports.markPreparing(request, reservation.key);
    const receipt = await ports.downloadReceipt(request.receiptDriveFileId);
    const mediaId = await ports.uploadReceipt(receipt);
    const messageId = await ports.sendTemplate(request, mediaId);
    await ports.markSent(request, reservation.key, messageId);
    return { status: 'sent', messageId, idempotencyKey: reservation.key };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    await ports.markFailure(request, reservation.key, message);
    throw error;
  }
}

export async function runInvoiceRequestValidation(
  itemId: string,
  ports: Pick<InvoiceRequestWorkflowPorts, 'loadRequest' | 'downloadReceipt'>
): Promise<{ request: InvoiceRequest; receipt: WorkflowReceipt }> {
  const request = await ports.loadRequest(itemId);
  const receipt = await ports.downloadReceipt(request.receiptDriveFileId);
  return { request, receipt };
}
