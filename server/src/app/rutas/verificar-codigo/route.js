/**
 * @swagger
 * /verificar-codigo:
 *   post:
 *     summary: Verificar código de recuperación
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
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código verificado correctamente
 *       400:
 *         description: Código inválido o expirado
 */

import { NextResponse } from "next/server";
import { UserController } from "@/controladores/usersController";

export async function POST(req) {
  try {
    const data = await req.json();
    const result = await UserController.verificarCodigo(data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al verificar el código" },
      { status: 400 },
    );
  }
}
