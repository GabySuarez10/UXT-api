/**
 * @swagger
 * /heatmaps:
 *   get:
 *     summary: Obtiene datos de clics y scrolls para generar un mapa de calor de una URL específica
 *     tags: [Heatmaps]
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         description: URL del sitio para filtrar los eventos de mapa de calor
 *         required: true
 *     responses:
 *       200:
 *         description: Datos de clics y scrolls
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clics:
 *                   type: array
 *                   items:
 *                     type: object
 *                 scrolls:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Falta el parámetro URL
 */

import { NextResponse } from "next/server";
import { getClics, getScrolls } from "@/queries/visitasQueries";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "El parámetro 'url' es requerido" },
        { status: 400 },
      );
    }

    console.log(`GET /heatmaps - URL filter: ${url}`);

    const clics = await getClics(url);
    const scrolls = await getScrolls(url);

    return NextResponse.json({ clics, scrolls });
  } catch (error) {
    console.error("Error en GET /heatmaps:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener datos de heatmaps" },
      { status: 500 },
    );
  }
}
