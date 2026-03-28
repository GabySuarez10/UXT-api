import { NextResponse } from "next/server";
import { getEstadisticasDashboard } from "@/queries/visitasQueries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: "El parámetro 'url' es requerido" },
        { status: 400 }
      );
    }

    console.log(`GET /estadisticas - URL filter: ${url}`);

    const estadisticas = await getEstadisticasDashboard(url);

    return NextResponse.json(estadisticas);
  } catch (error) {
    console.error("Error en GET /estadisticas:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener estadisticas" },
      { status: 500 }
    );
  }
}
