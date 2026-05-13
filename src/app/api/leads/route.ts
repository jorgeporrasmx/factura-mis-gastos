import { NextRequest, NextResponse } from "next/server";
import { createLead, type LeadData } from "@/lib/monday";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Tipos de formulario
type FormType = "express" | "standard" | "pilot" | "corporate" | "callback";

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
    problema_principal?: string;
    plan_interes?: string;
    notas?: string;
    cuando_llamar?: string;
  };
}

async function saveLeadFallback(type: FormType, data: LeadData, mondayError?: string): Promise<{ success: boolean; leadId?: string }> {
  try {
    const db = getAdminFirestore();
    if (!db) return { success: false };

    const ref = await db.collection("leads_fmg").add({
      ...data,
      type,
      status: "pending_manual_followup",
      mondayError: mondayError || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, leadId: ref.id };
  } catch (error) {
    console.error("Error saving fallback lead:", error);
    return { success: false };
  }
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
    standard: "Diagnóstico",
    pilot: "Control Mensual FMG",
    corporate: "FMG Empresa",
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

    // Validaciones adicionales para servicio/corporativo
    if ((type === "pilot" || type === "corporate") && !data.empresa?.trim()) {
      return NextResponse.json(
        { success: false, error: "La empresa es requerida" },
        { status: 400 }
      );
    }

    if (type === "corporate") {
      if (!data.cargo?.trim()) {
        return NextResponse.json(
          { success: false, error: "El cargo es requerido" },
          { status: 400 }
        );
      }
    }

    // Preparar notas adicionales
    let notas = data.notas || "";
    if (data.problema_principal) {
      notas = `Problema principal: ${data.problema_principal}${notas ? `\n${notas}` : ""}`;
    }
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
      plan_interes: data.plan_interes || (type === "pilot" ? "Control Mensual FMG" : type === "standard" ? "Diagnóstico de deducciones perdidas" : type === "corporate" ? "FMG Empresa" : undefined),
      notas: notas || undefined,
    };

    const result = await createLead(leadData);

    if (!result.success) {
      console.error("Error creating lead in Monday; saving fallback:", result.error);
      const fallback = await saveLeadFallback(type, leadData, result.error);

      if (!fallback.success) {
        return NextResponse.json(
          { success: false, error: "Error al registrar. Intenta de nuevo." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Lead guardado para seguimiento manual",
        fallback: true,
        leadId: fallback.leadId,
      });
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
