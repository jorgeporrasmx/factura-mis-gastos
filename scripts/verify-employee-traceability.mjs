// Prueba reproducible de la lógica de trazabilidad de empleados.
// Ejecuta con:  node scripts/verify-employee-traceability.mjs
//
// No requiere red ni credenciales: valida las funciones puras que sostienen
// la identificación del empleado en Monday, Firestore y el export CSV.
// Node >= 22 puede importar TypeScript directamente (type stripping).

import assert from 'node:assert/strict';
import {
  detectEmployeeColumns,
  buildEmployeeColumnValues,
  resolveEmployeeForItem,
  mergeEmployeePreservingNonEmpty,
  buildExpensesCsv,
  normalizeTitle,
} from '../src/lib/employee-traceability.ts';
import { generateInviteCode } from '../src/types/company.ts';

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

console.log('\n[1] normalizeTitle (tolerante a acentos/mayúsculas)');
check('normaliza acentos y espacios', () => {
  assert.equal(normalizeTitle('  Página Web '), 'pagina web');
  assert.equal(normalizeTitle('Empleado Email'), 'empleado email');
  assert.equal(normalizeTitle('CORREO'), 'correo');
});

console.log('\n[2] detectEmployeeColumns (tolerante a columnas faltantes)');
check('detecta las 3 columnas cuando existen', () => {
  const cols = [
    { id: 'text_a', title: 'Empleado', type: 'text' },
    { id: 'email_b', title: 'Empleado Email', type: 'email' },
    { id: 'text_c', title: 'Empleado ID', type: 'text' },
    { id: 'x', title: 'Monto', type: 'numbers' },
  ];
  const { match, warnings } = detectEmployeeColumns(cols);
  assert.equal(match.nombreColId, 'text_a');
  assert.equal(match.emailColId, 'email_b');
  assert.equal(match.idColId, 'text_c');
  assert.deepEqual(warnings, []);
});
check('devuelve warnings por columnas faltantes, sin lanzar error', () => {
  const cols = [{ id: 'x', title: 'Monto', type: 'numbers' }];
  const { match, warnings } = detectEmployeeColumns(cols);
  assert.equal(match.nombreColId, undefined);
  assert.deepEqual(warnings.sort(), ['Empleado', 'Empleado Email', 'Empleado ID'].sort());
});

console.log('\n[3] buildEmployeeColumnValues (respeta tipos, no rompe)');
check('escribe columnas existentes con el tipo correcto', () => {
  const cols = [
    { id: 'text_a', title: 'Empleado', type: 'text' },
    { id: 'email_b', title: 'Empleado Email', type: 'email' },
    { id: 'text_c', title: 'Empleado ID', type: 'text' },
  ];
  const { columnValues, warnings } = buildEmployeeColumnValues(cols, {
    uid: 'uid-123',
    name: 'Juan Pérez',
    email: 'juan@acme.com',
  });
  assert.equal(columnValues['text_a'], 'Juan Pérez');
  assert.deepEqual(columnValues['email_b'], { email: 'juan@acme.com', text: 'juan@acme.com' });
  assert.equal(columnValues['text_c'], 'uid-123');
  assert.deepEqual(warnings, []);
});
check('no escribe nada si faltan columnas (tolerante)', () => {
  const { columnValues, warnings } = buildEmployeeColumnValues(
    [{ id: 'x', title: 'Monto', type: 'numbers' }],
    { uid: 'u', name: 'n', email: 'e@e.com' }
  );
  assert.deepEqual(columnValues, {});
  assert.equal(warnings.length, 3);
});

console.log('\n[4] resolveEmployeeForItem (uid > email > fallback)');
const employees = [
  { uid: 'uid-emp', email: 'empleado@acme.com', displayName: 'Empleada Uno' },
  { uid: 'uid-emp2', email: 'otro@acme.com', displayName: 'Empleado Dos' },
];
const fallback = { userId: 'uid-admin', userName: 'Admin', userEmail: 'admin@acme.com' };
check('resuelve por email', () => {
  const r = resolveEmployeeForItem({ empleadoEmail: 'empleado@acme.com' }, employees, fallback);
  assert.equal(r.userId, 'uid-emp');
  assert.equal(r.userName, 'Empleada Uno');
  assert.equal(r.userEmail, 'empleado@acme.com');
});
check('resuelve por uid aunque el email no matchee', () => {
  const r = resolveEmployeeForItem({ empleadoId: 'uid-emp2', empleadoEmail: 'no-existe@x.com' }, employees, fallback);
  assert.equal(r.userId, 'uid-emp2');
  assert.equal(r.userName, 'Empleado Dos');
});
check('cae a fallback (admin) cuando no hay datos de empleado', () => {
  const r = resolveEmployeeForItem({}, employees, fallback);
  assert.deepEqual(r, fallback);
});
check('conserva email de Monday aunque no exista en Firestore', () => {
  const r = resolveEmployeeForItem({ empleadoEmail: 'externo@x.com' }, employees, fallback);
  assert.equal(r.userEmail, 'externo@x.com');
});

console.log('\n[5] mergeEmployeePreservingNonEmpty (regla dura de reprocesos)');
check('no sobrescribe campo poblado con vacío', () => {
  const merged = mergeEmployeePreservingNonEmpty(
    { userId: '', userName: '', userEmail: '', monto: 100 },
    { userId: 'uid-emp', userName: 'Empleada Uno', userEmail: 'empleado@acme.com' }
  );
  assert.equal(merged.userId, 'uid-emp');
  assert.equal(merged.userName, 'Empleada Uno');
  assert.equal(merged.userEmail, 'empleado@acme.com');
  assert.equal(merged.monto, 100);
});
check('sí actualiza cuando el nuevo valor no es vacío', () => {
  const merged = mergeEmployeePreservingNonEmpty(
    { userName: 'Nombre Corregido' },
    { userName: 'Nombre Viejo' }
  );
  assert.equal(merged.userName, 'Nombre Corregido');
});
check('documento nuevo (sin existing) pasa tal cual', () => {
  const merged = mergeEmployeePreservingNonEmpty({ userName: 'x' }, undefined);
  assert.equal(merged.userName, 'x');
});

console.log('\n[6] buildExpensesCsv (incluye empleado, escapa comas/comillas)');
check('genera encabezados y filas con datos de empleado', () => {
  const csv = buildExpensesCsv([
    {
      id: '1', mondayItemId: '1', companyId: 'c', userId: 'uid-emp',
      userName: 'Empleada, Uno', userEmail: 'empleado@acme.com',
      nombre: 'Comida "de trabajo"', monto: 123.5, fecha: new Date('2026-07-01T00:00:00Z'),
      proveedor: 'Restaurante', categoria: 'alimentacion', estado: 'pendiente',
      createdAt: new Date(), updatedAt: new Date(), syncedAt: new Date(),
    },
  ]);
  const lines = csv.replace(/^﻿/, '').split('\r\n');
  assert.ok(lines[0].startsWith('Fecha,Concepto,Empleado,Email empleado,ID empleado'));
  assert.ok(lines[1].includes('"Empleada, Uno"'));
  assert.ok(lines[1].includes('"Comida ""de trabajo"""'));
  assert.ok(lines[1].includes('empleado@acme.com'));
  assert.ok(lines[1].includes('uid-emp'));
  assert.ok(lines[1].includes('2026-07-01'));
});

console.log('\n[7] generateInviteCode (idempotente / determinista)');
check('genera slug estable y sin acentos', () => {
  assert.equal(generateInviteCode('Acme Corp'), 'acme-corp');
  assert.equal(generateInviteCode('Café Málaga S.A.'), 'cafe-malaga-s-a');
  // Determinista: misma entrada -> misma salida (base de idempotencia).
  assert.equal(generateInviteCode('Acme Corp'), generateInviteCode('Acme Corp'));
});

console.log(`\n✅ Todas las pruebas pasaron (${passed} checks).\n`);
