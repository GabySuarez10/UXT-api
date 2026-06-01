/**
 * @swagger
 * /restablecer-password:
 *   post:
 *     summary: Restablecer contraseña con código verificado
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
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Error al restablecer la contraseña
 */

import { NextResponse } from "next/server";
import { UserController } from "@/controladores/usersController";

export async function POST(req) {
  try {
    const data = await req.json();
    const result = await UserController.restablecerContrasena(data);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error al restablecer la contraseña" },
      { status: 400 }
    );
  }
}
