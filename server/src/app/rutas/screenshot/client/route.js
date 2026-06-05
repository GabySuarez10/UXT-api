import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Aumentar límite de body para aceptar imágenes base64 grandes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request) {
  try {
    const { url, snapshot, width, height } = await request.json();

    if (!url || !snapshot) {
      return NextResponse.json(
        { error: "Los campos 'url' y 'snapshot' son requeridos" },
        { status: 400 }
      );
    }

    if (!snapshot.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "El snapshot debe ser una imagen en formato Base64" },
        { status: 400 }
      );
    }

    await pool.query(
      `INSERT INTO sitios_capturas (url, snapshot, width, height, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (url) DO UPDATE
         SET snapshot = EXCLUDED.snapshot,
             width = EXCLUDED.width,
             height = EXCLUDED.height,
             updated_at = NOW()`,
      [url, snapshot, width || 1280, height || 900]
    );

    console.log(`[screenshot/client] Snapshot guardado para: ${url}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en POST /screenshot/client:", error);
    return NextResponse.json(
      { error: error.message || "Error al guardar snapshot" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "El parámetro 'url' es requerido" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT snapshot, width, height FROM sitios_capturas WHERE url = $1",
      [url]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ snapshot: null });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error en GET /screenshot/client:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener snapshot" },
      { status: 500 }
    );
  }
}
