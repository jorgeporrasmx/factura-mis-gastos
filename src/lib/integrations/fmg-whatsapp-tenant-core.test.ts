import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildVerifiedTenant,
  getFiscalProfileVersion,
  isTenantMondayTrigger,
  resolveMondayColumnMap,
  validateFiscalProfile,
} from './fmg-whatsapp-tenant-core.ts';

const unversionedProfile = {
  legalName: 'EMPRESA DEMO SA DE CV',
  rfc: 'EDE010101AAA',
  taxRegime: '601 - General de Ley Personas Morales',
  postalCode: '31000',
  cfdiUse: 'G03 - Gastos en general',
  invoiceEmail: 'facturas@example.com',
  csfUrl: 'https://drive.google.com/file/d/csf/view',
  verifiedAt: '2026-08-02T00:00:00.000Z',
  verifiedBy: 'operaciones@example.com',
};

const fiscalProfile = {
  ...unversionedProfile,
  version: getFiscalProfileVersion(unversionedProfile),
};

const mondayColumns = {
  method: 'method',
  phone: 'phone',
  purchaseDate: 'date',
  total: 'total',
  receiptDriveUrl: 'receipt',
  whatsAppMessageId: 'wa_id',
  whatsAppState: 'wa_state',
};

test('acepta un perfil fiscal completo cuya versión coincide con sus datos', () => {
  assert.deepEqual(validateFiscalProfile(fiscalProfile), fiscalProfile);
});

test('bloquea un perfil fiscal alterado después de la verificación', () => {
  assert.throws(
    () => validateFiscalProfile({ ...fiscalProfile, rfc: 'ABC010101AAA' }),
    /versión del perfil fiscal/
  );
});

test('una empresa solo queda habilitada con estado activo, perfil y columnas listas', () => {
  const tenant = buildVerifiedTenant({
    companyId: 'company-1',
    companyName: 'Empresa Demo',
    companyStatus: 'active',
    boardId: 'board-1',
    automation: {
      enabled: true,
      status: 'ready',
      fiscalProfile,
      mondayColumns,
    },
  });
  assert.equal(tenant.companyId, 'company-1');
  assert.equal(tenant.fiscalProfile.rfc, 'EDE010101AAA');

  assert.throws(
    () => buildVerifiedTenant({
      companyId: 'company-2', companyName: 'Otra', companyStatus: 'active', boardId: 'board-2',
      automation: { enabled: false, status: 'ready', fiscalProfile, mondayColumns },
    }),
    /no está habilitada/
  );
});

test('resuelve IDs distintos por tablero usando títulos y tipos verificados', () => {
  assert.deepEqual(
    resolveMondayColumnMap([
      { id: 'sutilde_method', title: 'Método', type: 'status' },
      { id: 'sutilde_phone', title: 'Whatsapp', type: 'phone' },
      { id: 'sutilde_date', title: 'Fecha de compra', type: 'date' },
      { id: 'sutilde_total', title: 'Total', type: 'numbers' },
      { id: 'sutilde_receipt', title: 'Recibo', type: 'text' },
      { id: 'sutilde_wa_id', title: 'WhatsApp ID', type: 'text' },
      { id: 'sutilde_wa_state', title: 'WhatsApp estado', type: 'status' },
    ]),
    {
      method: 'sutilde_method', phone: 'sutilde_phone', purchaseDate: 'sutilde_date',
      total: 'sutilde_total', receiptDriveUrl: 'sutilde_receipt',
      whatsAppMessageId: 'sutilde_wa_id', whatsAppState: 'sutilde_wa_state',
    }
  );
});

test('bloquea tableros ambiguos o con columnas incompatibles', () => {
  assert.throws(
    () => resolveMondayColumnMap([
      { id: 'method-1', title: 'Método', type: 'status' },
      { id: 'method-2', title: 'Método', type: 'status' },
    ]),
    /duplicada/
  );
});

test('el disparador debe coincidir simultáneamente con tablero y columna del cliente', () => {
  const tenant = { boardId: 'board-1', columns: mondayColumns };
  const event = {
    boardId: 'board-1', pulseId: 'item-1', columnId: 'method',
    value: { label: { text: 'WhatsApp' } },
  };
  assert.equal(isTenantMondayTrigger(event, tenant), true);
  assert.equal(isTenantMondayTrigger({ ...event, boardId: 'board-2' }, tenant), false);
  assert.equal(isTenantMondayTrigger({ ...event, columnId: 'other-method' }, tenant), false);
});
