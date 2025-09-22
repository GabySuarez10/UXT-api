// src/app/api/todos/route.ts
import { NextResponse } from "next/server";
import { swaggerSpec } from '@/lib/swagger';
import prisma from "@/lib/prisma";
import { z } from "zod";
import { link } from "fs";


// Esquema de validación con Zod
const createTodoSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  link: z.string().min(1, "El link es obligatorio"),
  completed: z.boolean().optional(),
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
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(todos);
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
    data: { title: data.title, completed: data.completed ?? false, link: data.link},
  });

  return NextResponse.json(todo, { status: 201 });
}
