// src/app/api/todos/route.ts
import { NextResponse } from "next/server";
import { swaggerSpec } from '@/lib/swagger';
import prisma from "@/lib/prisma";
import { z } from "zod";
import { url } from "inspector";

// función que crea las cabeceras CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // cualquier origen
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Manejo del preflight (OPTIONS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
// Esquema de validación con Zod
const createTodoSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  url: z.string().min(1, "El url es obligatorio"),   
  dominio: z.string().min(1, "El domnio es obligatorio"),
  userAgent: z.string().min(1, "no se pero es obligatorio"),
  referrer: z.string().min(1, "tampoco se pero es obligatorio"),
  
});

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Lista todos los todos
 *     responses:
 *       200:""
 *         description: Lista de todos
 */
// --- GET /api/todos ---
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(todos, { status: 200, headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },} );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al obtener todos' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Crea un nuevo todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Todo creado
 */
// --- POST /api/todos ---
export async function POST(request: Request) {
  const json = await request.json();

  // Usamos safeParse para no lanzar excepción
  const result = createTodoSchema.safeParse(json);

  if (!result.success) {
    // result.error.issues ya está tipado
    const issues = result.error.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return NextResponse.json({ errors: issues }, { status: 422 });
  }

  // data validado
  const data = result.data;

  const todo = await prisma.todo.create({
    data: { title: data.title, url: data.url, dominio: data.dominio, timestamp: new Date(), userAgent: data.userAgent, referrer: data.referrer },
  });

  return NextResponse.json(todo, {status: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },});
}
