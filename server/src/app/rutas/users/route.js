/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */

import { NextResponse } from "next/server";
import { UserController } from "@/controladores/usersController";

export async function GET() {
  const usuarios = await UserController.listarUsuarios();
  return NextResponse.json(usuarios);
}

export async function POST(req) {
  const data = await req.json();
  const usuario = await UserController.crearUsuario(data);
  return NextResponse.json(usuario, { status: 201 });
}
