import { NextResponse } from "next/server";
import { updateSitioSnapshot } from "@/queries/sitiosQueries.js";

export async function POST(req) {
  try {
    const data = await req.json();
    const { url, snapshot } = data;

    if (!url || !snapshot) {
      return NextResponse.json(
        { error: "Los campos 'url' y 'snapshot' son obligatorios" },
        { status: 400 }
      );
    }

    console.log(`POST /api/snapshot - URL: ${url}`);
    const updated = await updateSitioSnapshot({ url, snapshot });

    return NextResponse.json(
      { mensaje: "Captura de pantalla (snapshot) guardada exitosamente", url: updated.url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en POST /api/snapshot:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar snapshot" },
      { status: error.message.includes("No se encontró") ? 404 : 500 }
    );
  }
}
