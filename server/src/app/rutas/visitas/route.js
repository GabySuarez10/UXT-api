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
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    console.log(`GET /visitas - URL filter: ${url}`);
    
    const visitas = await VisitasController.listar(url);
    return NextResponse.json(visitas);
  } catch (error) {
    console.error("Error en GET /visitas:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener visitas" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Datos recibidos en POST /visitas:", data);
    
    // Verificar si es una visita nueva o recurrente
    const visitaExistente = await checkVisitaReciente(data.uid, data.url);
    let statusCode = 200;
    
    if (!visitaExistente) {
      statusCode = 201; // Nueva visita
    } else if (!visitaExistente.esReciente) {
      statusCode = 200; // Visita actualizada como recurrente
    }
    // Si es reciente (menos de 1 minuto), status 200 pero no se crea/actualiza
    
    const visita = await VisitasController.crear(data);
    
    return NextResponse.json({
      ...visita.toJSON(),
      mensaje: statusCode === 201 ? "Nueva visita registrada" : 
               visitaExistente && !visitaExistente.esReciente ? "Visita actualizada como recurrente" : 
               "Visita reciente, no se registró nueva visita"
    }, { status: statusCode });
    
  } catch (error) {
    console.error("Error en POST /visitas:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar visita" },
      { status: 400 }
    );
  }
}

// Función auxiliar para verificar visitas recientes
async function checkVisitaReciente(uid, url) {
  const { checkVisitaReciente } = await import("@/queries/visitasQueries");
  return await checkVisitaReciente(uid, url);
}