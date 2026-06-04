/**
 * @swagger
 * /recuperar-password:
 *   post:
 *     summary: Solicitar código de recuperación de contraseña
 *     tags: [Recuperación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código enviado (si el email existe)
 *       400:
 *         description: Datos incompletos o error
 */

import { NextResponse } from "next/server";
import { UserController } from "@/controladores/usersController";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const data = await req.json();
    const result = await UserController.solicitarRecuperacion(data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al enviar el código" },
      { status: 400 },
    );
  }
}
