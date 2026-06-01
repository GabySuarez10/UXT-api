import { NextResponse } from "next/server";
import { getEstadisticasDashboard, getTendenciasDiarias } from "@/queries/visitasQueries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const startDate = searchParams.get('startDate') || null;
    const endDate = searchParams.get('endDate') || null;

    if (!url) {
      return NextResponse.json(
        { error: "El parámetro 'url' es requerido" },
        { status: 400 }
      );
    }

    console.log(`GET /estadisticas - URL: ${url}, desde: ${startDate}, hasta: ${endDate}`);

    const [estadisticas, tendencias] = await Promise.all([
      getEstadisticasDashboard(url, startDate, endDate),
      getTendenciasDiarias(url, startDate, endDate),
    ]);

    return NextResponse.json({ ...estadisticas, tendencias });
  } catch (error) {
    console.error("Error en GET /estadisticas:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener estadisticas" },
      { status: 500 }
    );
  }
}
