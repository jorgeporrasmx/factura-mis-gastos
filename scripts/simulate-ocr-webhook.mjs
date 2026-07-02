// Simula el webhook OCR contra /api/internal/receipt-extraction.
//
// Uso:
//   FMG_BASE_URL=http://localhost:3000 \
//   FMG_AUTOMATION_SECRET=<secret> \
//   node scripts/simulate-ocr-webhook.mjs [driveFileId] [userId] [companyId]
//
// - Sin secret: verifica que el endpoint rechace con 401 (auth).
// - Con secret + Firebase configurado: procesa el payload completo y puedes
//   verificar en Firestore los 3 paths:
//     receipts/{driveFileId}
//     companies/{companyId}/expenses/{driveFileId}
//     receiptAutomation/{driveFileId}
//   y en Monday las columnas de empleado.
// - Idempotencia: correrlo dos veces con el mismo driveFileId debe actualizar
//   el mismo item de Monday (vía enlace4) y los mismos documentos.
// - Regla de reproceso: correrlo una segunda vez SIN datos de empleado
//   (flag --sin-empleado) no debe vaciar userName/userEmail ya poblados.

const baseUrl = process.env.FMG_BASE_URL || 'http://localhost:3000';
const secret = process.env.FMG_AUTOMATION_SECRET || process.env.INTERNAL_AUTOMATION_TOKEN || '';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const sinEmpleado = process.argv.includes('--sin-empleado');

const driveFileId = args[0] || `test-drive-file-${Math.random().toString(36).slice(2, 10)}`;
const userId = args[1] || 'test-user-uid';
const companyId = args[2] || undefined;

const payload = {
  driveFileId,
  fileUrl: `https://drive.google.com/file/d/${driveFileId}/view`,
  userId,
  ...(companyId ? { companyId } : {}),
  source: 'manual',
  ...(sinEmpleado
    ? {}
    : {
        employeeId: userId,
        employeeName: 'Empleada de Prueba',
        employeeEmail: 'empleada.prueba@example.com',
        employeeWhatsapp: '+525512345678',
      }),
  extraction: {
    proveedor: 'OXXO',
    razonSocial: 'Cadena Comercial OXXO SA de CV',
    rfcProveedor: 'CCO8605231N4',
    fecha: '2026-07-01',
    total: 156.5,
    ticket: 'T-000123',
    metodo: 'Web',
    ruta: 'portal_web',
  },
};

const headers = { 'Content-Type': 'application/json' };
if (secret) headers['Authorization'] = `Bearer ${secret}`;

console.log(`POST ${baseUrl}/api/internal/receipt-extraction`);
console.log(`  driveFileId: ${driveFileId}`);
console.log(`  con secret: ${secret ? 'sí' : 'NO (se espera 401)'}`);
console.log(`  con datos de empleado: ${sinEmpleado ? 'NO (prueba de reproceso)' : 'sí'}`);

const response = await fetch(`${baseUrl}/api/internal/receipt-extraction`, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
});

const body = await response.json().catch(() => ({}));
console.log(`\nHTTP ${response.status}`);
console.log(JSON.stringify(body, null, 2));

if (!secret && response.status === 401) {
  console.log('\n✅ Auth OK: el endpoint rechaza requests sin secret.');
  process.exit(0);
}

if (secret && response.status === 200 && body.success) {
  console.log('\n✅ Extracción procesada. Verifica en Firestore:');
  console.log(`   receipts/${body.receiptId}`);
  console.log(`   companies/${body.companyId}/expenses/${driveFileId}`);
  console.log(`   receiptAutomation/${driveFileId}`);
  process.exit(0);
}

console.log('\n⚠️ Respuesta inesperada (revisa configuración de Firebase/secret).');
process.exit(1);
