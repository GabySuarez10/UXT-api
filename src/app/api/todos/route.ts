// src/app/api/todos/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// --- Función que crea cabeceras CORS ---
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // cualquier origen
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// --- Helper para devolver JSON con CORS ---
function jsonWithCors(body: any, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

// --- Manejo del preflight (OPTIONS) ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// --- Esquema de validación con Zod ---
const createTodoSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  url: z.string().min(1, "El url es obligatorio"),
  dominio: z.string().min(1, "El dominio es obligatorio"),
  userAgent: z.string().min(1, "User Agent es obligatorio"),
  referrer: z.string().min(1, "Referrer es obligatorio"),
});

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Lista todos los todos
 *     responses:
 *       200:
 *         description: Lista de todos
 */
// --- GET /api/todos ---
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { id: "desc" },
    });
    return jsonWithCors(todos);
  } catch (err) {
    console.error(err);
    return jsonWithCors({ error: "Error al obtener todos" }, 500);
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

  // Validación con Zod
  const result = createTodoSchema.safeParse(json);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return jsonWithCors({ errors: issues }, 422);
  }

  const data = result.data;

  const todo = await prisma.todo.create({
    data: {
      title: data.title,
      url: data.url,
      dominio: data.dominio,
      timestamp: new Date(),
      userAgent: data.userAgent,
      referrer: data.referrer,
    },
  });

  return jsonWithCors(todo, 201);
}
