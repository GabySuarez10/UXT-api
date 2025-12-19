/**
 * @swagger
 * /sitios:
 *   get:
 *     summary: Obtiene todos los sitios web monitoreados, opcionalmente filtrados por usuario
 *     tags: [Sitios]
 *     parameters:
 *       - in: query
 *         name: usuario
 *         schema:
 *           type: string
 *         description: Nombre del usuario para filtrar los sitios
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de sitios web monitoreados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   usuario:
 *                     type: string
 *                   titulo:
 *                     type: string
 *                   url:
 *                     type: string
 *                   ultimaRevision:
 *                     type: integer
 *                   fechaInicio:
 *                     type: string
 *                     format: date-time
 *   post:
 *     summary: Crea un nuevo sitio web monitoreado
 *     tags: [Sitios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *               recurrente:
 *                 type: boolean
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               dominio:
 *                 type: string
 *               userAgent:
 *                 type: string
 *               referrer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sitio añadido exitosamente
 * 
 *   put:
 *     summary: Establece la última revisión de un sitio web
 *     tags: [Sitios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sitio actualizado exitosamente
 *       400:
 *         description: Datos incompletos
 * 
 *   delete:
 *     summary: Elimina un sitio web monitoreado por su URL
 *     tags: [Sitios]
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         required: true
 *         description: URL del sitio web a eliminar
 *     responses:
 *       200:
 *         description: Sitio eliminado exitosamente
 *       400:
 *         description: URL no proporcionada
 *       404:
 *         description: Sitio no encontrado
 *
 */

import { NextResponse } from "next/server";
import { SitiosController } from "@/controladores/sitiosController.js";

export async function GET(request) {
  try {
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const usuario = searchParams.get('usuario');
    
    // Si hay parámetro usuario, filtrar por usuario
    if (usuario) {
      console.log(`Buscando sitios para el usuario: ${usuario}`);
      const sitios = await SitiosController.listarPorUsuario(usuario);
      console.log(sitios)
      return NextResponse.json(sitios);
    }
    
    // Si no hay parámetro, devolver todos los sitios
    const sitios = await SitiosController.listar();
    return NextResponse.json(sitios);
  } catch (error) {
    console.error("Error en GET /sitios:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener sitios" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const sitio = await SitiosController.crear(data);
    return NextResponse.json(sitio, { status: 201 });
  } catch (error) {
    console.error("Error en POST /sitios:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear sitio" },
      { status: 400 }
    );
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();
    const sitioActualizado = await SitiosController.updateTimeSitio(data);
    return NextResponse.json(sitioActualizado);
  } catch (error) {
    console.error("Error en PUT /sitios:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar sitio" },
      { status: 400 }
    );
  }
}
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: "La URL del sitio es obligatoria" },
        { status: 400 }
      );
    }
    console.log(`DELETE /sitios - URL: ${url}`);
    const sitioEliminado = await SitiosController.deleteSitio(url);

    return NextResponse.json(sitioEliminado);
  } catch (error) {
    console.error("Error en DELETE /sitios:", error);

    return NextResponse.json(
      { error: error.message || "Error al eliminar sitio" },
      { status: 500 }
    );
  }
}
