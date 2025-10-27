/**
 * @swagger
 * /pruebas:
 *   get:
 *     summary: Obtiene todas las pruebas
 *     responses:
 *       200:
 *         description: Lista de pruebas
 *   post:
 *     summary: Crea una nueva prueba
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *         description: Prueba creada exitosamente
 */
// src/app/api/pruebas/route.js
import { NextResponse } from "next/server";
import { PruebasController } from "@/controladores/pruebasController.js";

export async function GET() {
  const pruebas = await PruebasController.listar();
  return NextResponse.json(pruebas);
}

export async function POST(req) {
  const data = await req.json();
  const prueba = await PruebasController.crear(data);
  return NextResponse.json(prueba, { status: 201 });
 

  
}
