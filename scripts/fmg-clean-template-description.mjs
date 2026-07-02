import fs from 'node:fs';

const TEMPLATE_BOARD_ID = '18398058025';
const MONDAY_API_URL = 'https://api.monday.com/v2';

const TEMPLATE_DESCRIPTION = `Datos de facturación:
Razón social: {{RAZON_SOCIAL}}
RFC: {{RFC}}
Régimen fiscal: {{REGIMEN_FISCAL}}
Domicilio fiscal: {{DOMICILIO_FISCAL}}
Código postal: {{CODIGO_POSTAL}}
Uso CFDI default: {{USO_CFDI_DEFAULT}}
Método de pago default: {{METODO_PAGO_DEFAULT}}
Contacto administrativo: {{CONTACTO_ADMIN}}
Correo de facturación: {{CORREO_FACTURACION}}
Notas operativas: {{NOTAS_OPERATIVAS}}`;

function readMondayToken() {
  if (process.env.MONDAY_API_KEY) return process.env.MONDAY_API_KEY;

  const candidates = [
    '/Users/juansutilde/.openclaw/workspace/credentials/monday.md',
    '/Users/juansutilde/.openclaw/workspace/.monday-api',
    '/Users/juansutilde/.monday-api',
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const match =
      text.match(/API_TOKEN\s*[:=]\s*['"`]?([^'"`\s,}]+)/) ||
      text.match(/MONDAY_API_KEY\s*[:=]\s*['"`]?([^'"`\s,}]+)/) ||
      text.match(/MONDAY_TOKEN\s*[:=]\s*['"`]?([^'"`\s,}]+)/) ||
      text.match(/eyJ[a-zA-Z0-9._-]+/);
    if (match?.[1] || match?.[0]) return match[1] || match[0];
  }

  throw new Error('No Monday API token found');
}

async function monday(query, variables = {}) {
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: readMondayToken(),
      'Content-Type': 'application/json',
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (!response.ok || result.errors?.length) {
    throw new Error(JSON.stringify(result.errors || result, null, 2));
  }
  return result.data;
}

const before = await monday(`
  query ($boardId: [ID!]) {
    boards(ids: $boardId) {
      id
      name
      description
    }
  }
`, { boardId: [TEMPLATE_BOARD_ID] });

console.log('Before:', before.boards[0]);

const updated = await monday(`
  mutation ($boardId: ID!, $description: String!) {
    update_board(
      board_id: $boardId,
      board_attribute: description,
      new_value: $description
    )
  }
`, {
  boardId: TEMPLATE_BOARD_ID,
  description: TEMPLATE_DESCRIPTION,
});

console.log('Updated:', updated);

const after = await monday(`
  query ($boardId: [ID!]) {
    boards(ids: $boardId) {
      id
      name
      description
    }
  }
`, { boardId: [TEMPLATE_BOARD_ID] });

console.log('After:', after.boards[0]);
