/**
 * @swagger
 * /visitas:
 *   get:
 *     summary: Obtiene todas las visitas web o filtra por URL específica
 *     tags: [Visitas]
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         description: URL del sitio para filtrar las visitas
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de visitas web
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   uid:
 *                     type: string
 *                   recurrente:
 *                     type: boolean
 *                   title:
 *                     type: string
 *                   url:
 *                     type: string
 *                   dominio:
 *                     type: string
 *                   userAgent:
 *                     type: string
 *                   referrer:
 *                     type: string
 *                   ultimavisita:
 *                     type: string
 *                     format: date-time
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *   post:
 *     summary: Registra una nueva visita o actualiza una existente
 *     tags: [Visitas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - url
 *             properties:
 *               uid:
 *                 type: string
 *                 description: Identificador único del usuario
 *               recurrente:
 *                 type: boolean
 *                 description: Indica si es una visita recurrente
 *               title:
 *                 type: string
 *                 description: Título de la página
 *               url:
 *                 type: string
 *                 description: URL completa de la página
 *               dominio:
 *                 type: string
 *                 description: Dominio del sitio
 *               userAgent:
 *                 type: string
 *                 description: Agente de usuario del navegador
 *               referrer:
 *                 type: string
 *                 description: Página de referencia
 *     responses:
 *       200:
 *         description: Visita registrada o actualizada exitosamente
 *       201:
 *         description: Nueva visita creada exitosamente
 *       400:
 *         description: Datos incompletos o inválidos
 */

import { NextResponse } from "next/server";
import { VisitasController } from "@/controladores/visitasController.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const tipo = searchParams.get("tipo_evento");

    console.log(`GET /visitas - URL filter: ${url}, tipo: ${tipo}`);

    const visitas = await VisitasController.listar(url, tipo);
    return NextResponse.json(visitas);
  } catch (error) {
    console.error("Error en GET /visitas:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener visitas" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Datos recibidos en POST /visitas:", data);

    const { tipo_evento } = data;

    // ── Clic ──────────────────────────────────────────────────────────────
    if (tipo_evento === "clic") {
      const clic = await VisitasController.registrarClic(data);
      return NextResponse.json(
        { ...clic.toJSON(), mensaje: "Clic registrado" },
        { status: 201 },
      );
    }

    // ── Scroll ────────────────────────────────────────────────────────────
    if (tipo_evento === "scroll") {
      const scroll = await VisitasController.registrarScroll(data);
      return NextResponse.json(
        { ...scroll.toJSON(), mensaje: "Scroll registrado" },
        { status: 201 },
      );
    }

    // ── Visita (comportamiento original) ──────────────────────────────────
    const visitaExistente = await checkVisitaReciente(data.uid, data.url);
    const statusCode = !visitaExistente ? 201 : 200;

    const visita = await VisitasController.crear(data);

    return NextResponse.json(
      {
        ...visita.toJSON(),
        mensaje:
          statusCode === 201
            ? "Nueva visita registrada"
            : visitaExistente && !visitaExistente.esReciente
              ? "Visita actualizada como recurrente"
              : "Visita reciente, no se registró nueva visita",
      },
      { status: statusCode },
    );
  } catch (error) {
    console.error("Error en POST /visitas:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar evento" },
      { status: 400 },
    );
  }
}

async function checkVisitaReciente(uid, url) {
  const { checkVisitaReciente } = await import("@/queries/visitasQueries");
  return await checkVisitaReciente(uid, url);
}
