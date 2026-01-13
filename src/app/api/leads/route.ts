import { NextRequest, NextResponse } from "next/server";
import { createLead, type LeadData } from "@/lib/monday";

// Tipos de formulario
type FormType = "express" | "standard" | "corporate" | "callback";

interface LeadRequest {
  type: FormType;
  data: {
    nombre: string;
    whatsapp: string;
    email: string;
    empresa?: string;
    cargo?: string;
    recibos_mes?: string;
    empleados?: string;
    integraciones?: string[];
    plan_interes?: string;
    notas?: string;
    cuando_llamar?: string;
  };
}

// Validación básica de email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validación de teléfono mexicano (10 dígitos)
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10;
}

// Mapeo de tipo de formulario a origen
function getOrigen(type: FormType): string {
  const origenes: Record<FormType, string> = {
    express: "CTA Comenzar",
    standard: "CTA Asesor",
    corporate: "Plan Corporativo",
    callback: "Widget WhatsApp",
  };
  return origenes[type];
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadRequest = await request.json();
    const { type, data } = body;

    // Validaciones
    if (!data.nombre?.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!data.whatsapp || !isValidPhone(data.whatsapp)) {
      return NextResponse.json(
        { success: false, error: "WhatsApp inválido (mínimo 10 dígitos)" },
        { status: 400 }
      );
    }

    if (!data.email || !isValidEmail(data.email)) {
      return NextResponse.json(
        { success: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    // Validaciones adicionales para formulario corporativo
    if (type === "corporate") {
      if (!data.empresa?.trim()) {
        return NextResponse.json(
          { success: false, error: "La empresa es requerida" },
          { status: 400 }
        );
      }
      if (!data.cargo?.trim()) {
        return NextResponse.json(
          { success: false, error: "El cargo es requerido" },
          { status: 400 }
        );
      }
    }

    // Preparar notas adicionales
    let notas = data.notas || "";
    if (data.cuando_llamar) {
      notas = `Preferencia de contacto: ${data.cuando_llamar}${notas ? `\n${notas}` : ""}`;
    }

    // Crear lead en Monday
    const leadData: LeadData = {
      nombre: data.nombre.trim(),
      whatsapp: data.whatsapp,
      email: data.email.trim().toLowerCase(),
      empresa: data.empresa?.trim(),
      cargo: data.cargo?.trim(),
      recibos_mes: data.recibos_mes,
      empleados: data.empleados,
      integraciones: data.integraciones,
      origen: getOrigen(type),
      plan_interes: data.plan_interes || (type === "corporate" ? "Corporativo" : undefined),
      notas: notas || undefined,
    };

    const result = await createLead(leadData);

    if (!result.success) {
      console.error("Error creating lead:", result.error);
      return NextResponse.json(
        { success: false, error: "Error al registrar. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead creado exitosamente",
      itemId: result.itemId,
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor" },
      { status: 500 }
    );
  }
}
