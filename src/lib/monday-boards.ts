// Monday.com Board Management
// Funciones para crear y duplicar tableros de Monday

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MACHOTE_BOARD_ID = '18398058025'; // ID del tablero MACHOTE

interface MondayResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface DuplicateBoardResult {
  id: string;
  name: string;
  board_folder_id?: number;
  workspace?: {
    id: string;
    name: string;
  };
}

interface BoardInfo {
  id: string;
  name: string;
  columns: Array<{
    id: string;
    title: string;
    type: string;
  }>;
}

/**
 * Verificar si Monday está configurado
 */
export function isMondayBoardsConfigured(): boolean {
  return Boolean(process.env.MONDAY_API_KEY);
}

/**
 * Hacer query a Monday API
 */
async function mondayQuery<T>(query: string, variables?: Record<string, unknown>): Promise<MondayResponse<T>> {
  const token = process.env.MONDAY_API_KEY;
  
  if (!token) {
    throw new Error('MONDAY_API_KEY no configurado');
  }

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Monday API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Duplicar el tablero MACHOTE para una nueva empresa
 * @param companyName - Nombre de la empresa (se usará en el nombre del tablero)
 * @param workspaceId - ID del workspace donde crear el tablero (opcional)
 * @returns ID del nuevo tablero
 */
export async function duplicateMachoteBoard(
  companyName: string,
  workspaceId?: string
): Promise<{ boardId: string; boardName: string }> {
  const boardName = `Facturas ${companyName}`;
  
  console.log('[Monday/Boards] Duplicando MACHOTE para:', companyName);

  // Mutation para duplicar tablero
  // duplicate_type: duplicate_board_with_structure (solo estructura, sin items)
  const mutation = `
    mutation DuplicateBoard($boardId: ID!, $boardName: String!, $workspaceId: ID) {
      duplicate_board(
        board_id: $boardId,
        duplicate_type: duplicate_board_with_structure,
        board_name: $boardName,
        workspace_id: $workspaceId
      ) {
        board {
          id
          name
          workspace {
            id
            name
          }
        }
      }
    }
  `;

  const variables: Record<string, unknown> = {
    boardId: MACHOTE_BOARD_ID,
    boardName,
  };

  if (workspaceId) {
    variables.workspaceId = workspaceId;
  }

  const result = await mondayQuery<{ duplicate_board: { board: DuplicateBoardResult } }>(
    mutation,
    variables
  );

  if (result.errors && result.errors.length > 0) {
    console.error('[Monday/Boards] Error duplicando tablero:', result.errors);
    throw new Error(`Error duplicando tablero: ${result.errors[0].message}`);
  }

  if (!result.data?.duplicate_board?.board?.id) {
    throw new Error('No se pudo obtener el ID del tablero duplicado');
  }

  const newBoard = result.data.duplicate_board.board;

  console.log('[Monday/Boards] Tablero duplicado exitosamente:', {
    boardId: newBoard.id,
    boardName: newBoard.name,
    workspace: newBoard.workspace?.name,
  });

  return {
    boardId: newBoard.id,
    boardName: newBoard.name,
  };
}

/**
 * Obtener información de un tablero
 */
export async function getBoardInfo(boardId: string): Promise<BoardInfo | null> {
  const query = `
    query GetBoard($boardId: [ID!]!) {
      boards(ids: $boardId) {
        id
        name
        columns {
          id
          title
          type
        }
      }
    }
  `;

  const result = await mondayQuery<{ boards: BoardInfo[] }>(query, { boardId: [boardId] });

  if (result.errors || !result.data?.boards?.[0]) {
    return null;
  }

  return result.data.boards[0];
}

/**
 * Crear una etiqueta (tag) en un tablero
 * @param boardId - ID del tablero
 * @param tagColumnId - ID de la columna de tags
 * @param tagName - Nombre de la etiqueta a crear
 */
export async function createTag(
  boardId: string,
  tagColumnId: string,
  tagName: string
): Promise<number> {
  // Para crear un tag, primero necesitamos crear un item temporal o usar
  // la API de tags directamente
  const mutation = `
    mutation CreateTag($boardId: ID!) {
      create_or_get_tag(board_id: $boardId, tag_name: "${tagName}") {
        id
        name
      }
    }
  `;

  const result = await mondayQuery<{ create_or_get_tag: { id: number; name: string } }>(
    mutation,
    { boardId }
  );

  if (result.errors) {
    throw new Error(`Error creando tag: ${result.errors[0].message}`);
  }

  return result.data?.create_or_get_tag?.id || 0;
}

/**
 * Agregar un item al tablero con el tag del empleado
 */
export async function createExpenseItem(
  boardId: string,
  itemName: string,
  columnValues: Record<string, unknown>,
  groupId?: string
): Promise<string> {
  const mutation = `
    mutation CreateItem($boardId: ID!, $itemName: String!, $columnValues: JSON!, $groupId: String) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues,
        group_id: $groupId
      ) {
        id
        name
      }
    }
  `;

  const result = await mondayQuery<{ create_item: { id: string; name: string } }>(
    mutation,
    {
      boardId,
      itemName,
      columnValues: JSON.stringify(columnValues),
      groupId,
    }
  );

  if (result.errors) {
    throw new Error(`Error creando item: ${result.errors[0].message}`);
  }

  return result.data?.create_item?.id || '';
}

/**
 * Actualizar columna de un item (para asignar tag de empleado)
 */
export async function updateItemColumn(
  boardId: string,
  itemId: string,
  columnId: string,
  value: unknown
): Promise<void> {
  const mutation = `
    mutation UpdateColumn($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
      change_column_value(
        board_id: $boardId,
        item_id: $itemId,
        column_id: $columnId,
        value: $value
      ) {
        id
      }
    }
  `;

  const result = await mondayQuery(mutation, {
    boardId,
    itemId,
    columnId,
    value: JSON.stringify(value),
  });

  if (result.errors) {
    throw new Error(`Error actualizando columna: ${result.errors[0].message}`);
  }
}

/**
 * Obtener ID del workspace de Factura Mis Gastos (si existe)
 */
export async function getFacturaWorkspaceId(): Promise<string | null> {
  const query = `
    query GetWorkspaces {
      workspaces {
        id
        name
      }
    }
  `;

  const result = await mondayQuery<{ workspaces: Array<{ id: string; name: string }> }>(query);

  if (result.errors || !result.data?.workspaces) {
    return null;
  }

  // Buscar workspace que contenga "Factura" en el nombre
  const facturaWorkspace = result.data.workspaces.find(
    ws => ws.name.toLowerCase().includes('factura')
  );

  return facturaWorkspace?.id || null;
}
