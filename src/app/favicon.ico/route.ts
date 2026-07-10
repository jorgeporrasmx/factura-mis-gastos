// Sirve /favicon.ico con el logotipo de Factura Mis Gastos embebido.
// Solucion temporal libre de binarios: reemplazar por el archivo real en
// public/ cuando se pueda hacer push de binarios (ver PR #74).
import { NextResponse } from "next/server";

export const dynamic = "force-static";

const DATA_BASE64 =
  "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";

export function GET() {
  return new NextResponse(Buffer.from(DATA_BASE64, "base64"), {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
