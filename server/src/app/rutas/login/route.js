/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión de un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario loggeado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 *       400:
 *         description: Datos incompletos
 */

import { NextResponse } from "next/server";
import { UserController } from "@/controladores/usersController";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log(data);
    const result = await UserController.loggearUsuario(data);
    console.log(result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error.message === "Credenciales inválidas") {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Error en el servidor" },
      { status: 400 }
    );
  }
}