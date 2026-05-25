const WHATSAPP_NUMBER = '5216144273301';

const DEFAULT_MESSAGE =
  'Hola, quiero probar Factura Mis Gastos. Te mando mi primer recibo.';

export function getWhatsAppUrl(message = DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const firstReceiptWhatsAppUrl = getWhatsAppUrl();

