/**
 * @swagger
 * /updateFirstTime:
 *   put:
 *     summary: Establecer que un usuario ya no es primerizo
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
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos incompletos
 */

import { NextResponse } from "next/server";
import { UserController } from "@/controladores/usersController";

export async function PUT(req) {
  try {
    const data = await req.json();
    await UserController.actualizarPrimerizo(data);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error en el servidor" },
      { status: 400 }
    );
  }
}