// Constancia de Situación Fiscal
export interface CSFDocument {
  id: string;
  userId: string;
  fileUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  expiresAt: Date; // uploadedAt + 3 meses
  status: CSFStatus;
  rfc?: string; // Extraído del documento si es posible
}

export type CSFStatus =
  | 'pending_upload'  // No se ha subido
  | 'uploaded'        // Subido, pendiente validación
  | 'valid'           // Validado y vigente
  | 'expiring_soon'   // Vence en menos de 15 días
  | 'expired';        // Vencido, requiere actualización

// Recibo/Gasto
export interface Receipt {
  id: string;
  userId: string;
  fileUrl: string;
  storagePath: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  status: ReceiptStatus;
  metadata?: ReceiptMetadata;
}

export type ReceiptStatus =
  | 'uploading'       // En proceso de subida
  | 'processing'      // Procesando/optimizando
  | 'pending'         // Pendiente de gestión
  | 'in_progress'     // En proceso de facturación
  | 'completed'       // Facturado
  | 'rejected';       // Rechazado

export interface ReceiptMetadata {
  capturedAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: string;
  notes?: string;
}

// Helpers para CSF
export const CSF_VALIDITY_MONTHS = 3;
export const CSF_EXPIRY_WARNING_DAYS = 15;

export function calculateCSFExpiryDate(uploadDate: Date): Date {
  const expiryDate = new Date(uploadDate);
  expiryDate.setMonth(expiryDate.getMonth() + CSF_VALIDITY_MONTHS);
  return expiryDate;
}

export function getCSFStatus(csf: CSFDocument | null): CSFStatus {
  if (!csf) return 'pending_upload';

  const now = new Date();
  const expiresAt = new Date(csf.expiresAt);
  const warningDate = new Date(expiresAt);
  warningDate.setDate(warningDate.getDate() - CSF_EXPIRY_WARNING_DAYS);

  if (now >= expiresAt) return 'expired';
  if (now >= warningDate) return 'expiring_soon';
  return 'valid';
}

export function getDaysUntilExpiry(expiresAt: Date): number {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
