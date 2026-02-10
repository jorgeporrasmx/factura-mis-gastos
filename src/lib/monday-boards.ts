// Monday.com Board Operations
// Crear y duplicar tableros para nuevas empresas

const MONDAY_API_URL = 'https://api.monday.com/v2';

// ID del tablero MACHOTE (template)
const TEMPLATE_BOARD_ID = '18398058025';

// Workspace ID donde crear los tableros
const WORKSPACE_ID = process.env.MONDAY_WORKSPACE_ID || '7660065';

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
    mutation {
      duplicate_board(
        board_id: ${TEMPLATE_BOARD_ID},
        duplicate_type: duplicate_board_with_structure,
        board_name: "${boardName}",
        workspace_id: ${WORKSPACE_ID}
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
    }>(query);

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

/**
 * Crear item de gasto en el tablero de una empresa
 */
export async function createExpenseItem(
  boardId: string,
  itemName: string,
  columnValues: Record<string, unknown>
): Promise<string> {
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
    columnValues: JSON.stringify(columnValues),
  });

  return result.create_item.id;
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

/**
 * Verificar si Monday está configurado
 */
export function isMondayBoardsConfigured(): boolean {
  return Boolean(process.env.MONDAY_API_KEY);
}
