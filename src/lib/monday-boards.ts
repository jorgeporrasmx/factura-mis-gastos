// Monday.com Board Operations
// Crear y duplicar tableros para nuevas empresas

const MONDAY_API_URL = 'https://api.monday.com/v2';

// ID del tablero MACHOTE (template)
const TEMPLATE_BOARD_ID = '18398058025';

// Workspace ID donde crear los tableros (Factura Mis Gastos)
const WORKSPACE_ID = process.env.MONDAY_WORKSPACE_ID || '10710743';

/**
 * Ejecutar mutation GraphQL a Monday
 */
async function executeMondayMutation<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.MONDAY_API_KEY;

  if (!apiKey) {
    throw new Error('MONDAY_API_KEY no configurada');
  }

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Monday API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`Monday GraphQL error: ${result.errors[0].message}`);
  }

  return result.data;
}

/**
 * Duplicar el tablero MACHOTE para una nueva empresa
 * Retorna el ID del nuevo tablero
 */
export async function duplicateBoardForCompany(companyName: string): Promise<{
  boardId: string;
  boardUrl: string;
}> {
  const boardName = `FMG - ${companyName}`;
  
  console.log(`[Monday] Duplicando tablero MACHOTE para empresa: ${companyName}`);

  const query = `
    mutation ($boardId: ID!, $boardName: String!, $workspaceId: ID!) {
      duplicate_board(
        board_id: $boardId,
        duplicate_type: duplicate_board_with_structure,
        board_name: $boardName,
        workspace_id: $workspaceId
      ) {
        board {
          id
          name
        }
      }
    }
  `;

  try {
    const result = await executeMondayMutation<{
      duplicate_board: {
        board: {
          id: string;
          name: string;
        };
      };
    }>(query, {
      boardId: TEMPLATE_BOARD_ID,
      boardName,
      workspaceId: WORKSPACE_ID,
    });

    const newBoardId = result.duplicate_board.board.id;
    const boardUrl = `https://sutilde.monday.com/boards/${newBoardId}`;

    console.log(`[Monday] Tablero creado: ${newBoardId} - ${boardName}`);
    console.log(`[Monday] URL: ${boardUrl}`);

    return {
      boardId: newBoardId,
      boardUrl,
    };
  } catch (error) {
    console.error('[Monday] Error duplicando tablero:', error);
    throw error;
  }
}

/**
 * Crear vista de dashboard para el cliente
 * Esta vista muestra solo las columnas relevantes para el usuario final
 */
export async function createClientDashboardView(boardId: string): Promise<string> {
  // Columnas visibles para el cliente (ocultar las internas)
  const clientColumns = [
    'name',           // Proveedor
    'text_mkthrxct',  // Fecha compra
    'n_meros',        // Total
    'formula_mkt75fbv', // Neto
    'formula_mkt7rhw3', // IVA
    'status',         // Estado
    'text_mky72d18',  // UUID CFDI
    'text_mky7nh3g',  // Razón Social
    'tag_mm063vts',   // Empleado
  ];

  console.log(`[Monday] Creando vista de cliente para tablero: ${boardId}`);

  const query = `
    mutation {
      create_board_view(
        board_id: ${boardId},
        view_name: "Vista Cliente",
        view_type: table
      ) {
        id
      }
    }
  `;

  try {
    const result = await executeMondayMutation<{
      create_board_view: { id: string };
    }>(query);

    console.log(`[Monday] Vista de cliente creada: ${result.create_board_view.id}`);
    return result.create_board_view.id;
  } catch (error) {
    // Si falla crear la vista, no es crítico
    console.warn('[Monday] No se pudo crear vista de cliente:', error);
    return '';
  }
}

export interface ExpenseEmployeeInfo {
  name: string;
  email?: string;
  whatsapp?: string;
}

/**
 * Crear (o reutilizar) un tag de empleado en el tablero.
 * Los tags de Monday son la columna visual de empleado (tag_mm063vts).
 */
export async function createOrGetEmployeeTag(
  boardId: string,
  tagName: string
): Promise<string | null> {
  const query = `
    mutation ($boardId: ID!, $tagName: String!) {
      create_or_get_tag(tag_name: $tagName, board_id: $boardId) {
        id
      }
    }
  `;

  try {
    const result = await executeMondayMutation<{
      create_or_get_tag: { id: string };
    }>(query, { boardId, tagName });
    return result.create_or_get_tag?.id ?? null;
  } catch (error) {
    console.warn('[Monday] No se pudo crear/obtener tag de empleado:', error);
    return null;
  }
}

/**
 * Crear item de gasto en el tablero de una empresa.
 * Si se proporciona información del empleado, se llena el tag de empleado
 * y se agrega un update con nombre/email/WhatsApp para trazabilidad.
 */
export async function createExpenseItem(
  boardId: string,
  itemName: string,
  columnValues: Record<string, unknown>,
  employee?: ExpenseEmployeeInfo
): Promise<string> {
  const finalColumnValues = { ...columnValues };

  if (employee?.name) {
    const tagId = await createOrGetEmployeeTag(boardId, employee.name);
    if (tagId) {
      finalColumnValues['tag_mm063vts'] = { tag_ids: [Number(tagId)] };
    }
  }

  const query = `
    mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const result = await executeMondayMutation<{
    create_item: { id: string };
  }>(query, {
    boardId,
    itemName,
    columnValues: JSON.stringify(finalColumnValues),
  });

  const itemId = result.create_item.id;

  if (employee?.name) {
    const lines = [
      `Empleado: ${employee.name}`,
      employee.email ? `Email: ${employee.email}` : null,
      employee.whatsapp ? `WhatsApp: ${employee.whatsapp}` : null,
    ].filter(Boolean);
    try {
      await createItemUpdate(itemId, lines.join(' | '));
    } catch (updateError) {
      console.warn('[Monday] No se pudo agregar update de empleado:', updateError);
    }
  }

  return itemId;
}

export async function findExpenseItemByDriveFileId(
  boardId: string,
  driveFileId: string
): Promise<string | null> {
  const query = `
    query ($boardId: ID!, $driveFileId: String!) {
      items_page_by_column_values(
        board_id: $boardId,
        columns: [{ column_id: "enlace4", column_values: [$driveFileId] }],
        limit: 1
      ) {
        items {
          id
        }
      }
    }
  `;

  const result = await executeMondayMutation<{
    items_page_by_column_values: {
      items: Array<{ id: string }>;
    };
  }>(query, {
    boardId,
    driveFileId,
  });

  return result.items_page_by_column_values.items[0]?.id ?? null;
}

export async function updateExpenseItem(
  boardId: string,
  itemId: string,
  columnValues: Record<string, unknown>
): Promise<string> {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
      change_multiple_column_values(
        board_id: $boardId,
        item_id: $itemId,
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const result = await executeMondayMutation<{
    change_multiple_column_values: { id: string };
  }>(query, {
    boardId,
    itemId,
    columnValues: JSON.stringify(columnValues),
  });

  return result.change_multiple_column_values.id;
}

export async function createItemUpdate(itemId: string, body: string): Promise<string> {
  const query = `
    mutation ($itemId: ID!, $body: String!) {
      create_update(item_id: $itemId, body: $body) {
        id
      }
    }
  `;

  const result = await executeMondayMutation<{
    create_update: { id: string };
  }>(query, {
    itemId,
    body,
  });

  return result.create_update.id;
}

/**
 * Obtener información de un tablero
 */
export async function getBoardInfo(boardId: string): Promise<{
  id: string;
  name: string;
  url: string;
} | null> {
  const query = `
    query {
      boards(ids: ${boardId}) {
        id
        name
      }
    }
  `;

  try {
    const result = await executeMondayMutation<{
      boards: Array<{ id: string; name: string }>;
    }>(query);

    if (result.boards && result.boards.length > 0) {
      const board = result.boards[0];
      return {
        id: board.id,
        name: board.name,
        url: `https://sutilde.monday.com/boards/${board.id}`,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export interface AccountantBoardContext {
  id: string;
  name: string;
  description: string | null;
  items: Array<{
    id: string;
    name: string;
    groupTitle?: string;
    values: Record<string, string>;
  }>;
}

/**
 * Obtener contexto operativo/fiscal mínimo del tablero FMG.
 * Se usa para el Contador IA: descripción fiscal + últimos recibos visibles.
 */
export async function getAccountantBoardContext(boardId: string): Promise<AccountantBoardContext | null> {
  const query = `
    query ($boardId: [ID!]!) {
      boards(ids: $boardId) {
        id
        name
        description
        items_page(limit: 15) {
          items {
            id
            name
            group {
              title
            }
            column_values {
              id
              text
            }
          }
        }
      }
    }
  `;

  try {
    const result = await executeMondayMutation<{
      boards: Array<{
        id: string;
        name: string;
        description: string | null;
        items_page?: {
          items: Array<{
            id: string;
            name: string;
            group?: { title?: string };
            column_values: Array<{ id: string; text: string | null }>;
          }>;
        };
      }>;
    }>(query, { boardId: [boardId] });

    const board = result.boards?.[0];
    if (!board) return null;

    const columnLabels: Record<string, string> = {
      person: 'responsable',
      status: 'estado',
      text_mkthrxct: 'fecha_compra',
      n_meros: 'total',
      text_mky72d18: 'uuid_cfdi',
      text_mky7nh3g: 'razon_social',
      text_mkqygzgk: 'archivo_o_factura',
      proyecto: 'metodo',
      enlace4: 'drive_file_id',
      correo: 'ticket_o_correo',
      link_mkqg4vhb: 'portal_facturacion',
      tag_mm063vts: 'empleado',
    };

    return {
      id: board.id,
      name: board.name,
      description: board.description,
      items: (board.items_page?.items || []).map((item) => {
        const values: Record<string, string> = {};
        for (const column of item.column_values) {
          const key = columnLabels[column.id] || column.id;
          if (column.text) values[key] = column.text;
        }
        return {
          id: item.id,
          name: item.name,
          groupTitle: item.group?.title,
          values,
        };
      }),
    };
  } catch (error) {
    console.warn('[Monday] No se pudo obtener contexto para Contador IA:', error);
    return null;
  }
}

/**
 * Verificar si Monday está configurado
 */
export function isMondayBoardsConfigured(): boolean {
  return Boolean(process.env.MONDAY_API_KEY);
}
