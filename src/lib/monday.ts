// Monday.com API Client
// Configuración para integración con tablero de Leads

export const MONDAY_CONFIG = {
  boardId: "18393740781",
  apiUrl: "https://api.monday.com/v2",

  columns: {
    estado: "color_mkz79aj8",
    whatsapp: "phone_mkz742fw",
    email: "email_mkz7ydhm",
    empresa: "text_mkz75aj8",
    cargo: "text_mkz7hm0p",
    recibos_mes: "dropdown_mkz7a2wd",
    empleados: "dropdown_mkz7x7bs",
    integraciones: "dropdown_mkz7d3mf",
    origen: "dropdown_mkz77f67",
    plan_interes: "dropdown_mkz77fz1",
    asignado: "multiple_person_mkz7e7y4",
    fecha_entrada: "date_mkz7qq3d",
    proximo_contacto: "date_mkz73bkw",
    valor_estimado: "numeric_mkz72ecg",
    notas: "long_text_mkz7v1b1",
    ultima_actividad: "pulse_updated_mkz775m2",
  },

  groups: {
    nuevos: "group_mkz7pm5x",
    enproceso: "group_mkz7q58a",
    demos: "group_mkz7jsgz",
    cerrados: "group_mkz7y3yy",
  },

  // Mapeo de valores para dropdowns
  dropdownValues: {
    recibos_mes: {
      "1-50": "1-50",
      "51-150": "51-150",
      "151-300": "151-300",
      "300+": "300+",
    },
    empleados: {
      "1-10": "1-10",
      "11-50": "11-50",
      "51-200": "51-200",
      "201-500": "201-500",
      "500+": "500+",
    },
    origen: {
      "cta_comenzar": "CTA Comenzar",
      "cta_asesor": "CTA Asesor",
      "plan_corporativo": "Plan Corporativo",
      "widget_whatsapp": "Widget WhatsApp",
      "calendly": "Calendly",
      "organico": "Orgánico",
    },
    plan_interes: {
      "personal": "Personal",
      "equipos": "Equipos",
      "empresa": "Empresa",
      "corporativo": "Corporativo",
    },
  },
} as const;

// Tipos para los leads
export interface LeadData {
  nombre: string;
  whatsapp: string;
  email: string;
  empresa?: string;
  cargo?: string;
  recibos_mes?: string;
  empleados?: string;
  integraciones?: string[];
  origen: string;
  plan_interes?: string;
  notas?: string;
}

// Función para formatear los valores de columnas para Monday API
export function formatColumnValues(data: LeadData): string {
  const today = new Date().toISOString().split("T")[0];

  const columnValues: Record<string, unknown> = {
    // Teléfono WhatsApp
    [MONDAY_CONFIG.columns.whatsapp]: {
      phone: data.whatsapp.replace(/\D/g, ""),
      countryShortName: "MX",
    },
    // Email
    [MONDAY_CONFIG.columns.email]: {
      email: data.email,
      text: data.email,
    },
    // Fecha de entrada (hoy)
    [MONDAY_CONFIG.columns.fecha_entrada]: {
      date: today,
    },
    // Origen
    [MONDAY_CONFIG.columns.origen]: {
      labels: [data.origen],
    },
  };

  // Campos opcionales
  if (data.empresa) {
    columnValues[MONDAY_CONFIG.columns.empresa] = data.empresa;
  }

  if (data.cargo) {
    columnValues[MONDAY_CONFIG.columns.cargo] = data.cargo;
  }

  if (data.recibos_mes) {
    columnValues[MONDAY_CONFIG.columns.recibos_mes] = {
      labels: [data.recibos_mes],
    };
  }

  if (data.empleados) {
    columnValues[MONDAY_CONFIG.columns.empleados] = {
      labels: [data.empleados],
    };
  }

  if (data.integraciones && data.integraciones.length > 0) {
    columnValues[MONDAY_CONFIG.columns.integraciones] = {
      labels: data.integraciones,
    };
  }

  if (data.plan_interes) {
    columnValues[MONDAY_CONFIG.columns.plan_interes] = {
      labels: [data.plan_interes],
    };
  }

  if (data.notas) {
    columnValues[MONDAY_CONFIG.columns.notas] = {
      text: data.notas,
    };
  }

  return JSON.stringify(columnValues);
}

// Función para crear un lead en Monday
export async function createLead(data: LeadData): Promise<{ success: boolean; itemId?: string; error?: string }> {
  const apiKey = process.env.MONDAY_API_KEY;

  if (!apiKey) {
    return { success: false, error: "MONDAY_API_KEY no configurada" };
  }

  const columnValues = formatColumnValues(data);

  const query = `
    mutation {
      create_item (
        board_id: ${MONDAY_CONFIG.boardId},
        group_id: "${MONDAY_CONFIG.groups.nuevos}",
        item_name: "${data.nombre.replace(/"/g, '\\"')}",
        column_values: ${JSON.stringify(columnValues)}
      ) {
        id
      }
    }
  `;

  try {
    const response = await fetch(MONDAY_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey,
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("Monday API Error:", result.errors);
      return { success: false, error: result.errors[0]?.message || "Error de API" };
    }

    return {
      success: true,
      itemId: result.data?.create_item?.id
    };
  } catch (error) {
    console.error("Error creating lead:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error de conexión"
    };
  }
}
