import {
  getUsers,
  createUser,
  getUserByName,
  updateFirstTime,
  deactivateUser,
  getUserByEmail,
  saveRecoveryCode,
  clearRecoveryCode,
  updatePasswordByEmail,
} from "@/queries/userQueries";
import { User } from "@/clases/user";
import { sendRecoveryEmail } from "@/lib/emailService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

export class UserController {
  static async listarUsuarios() {
    const usuarios = await getUsers();
    return usuarios.map((u) => new User(u.id, u.name, u.email));
  }

  static async crearUsuario(data) {
    if (!data.username || !data.email || !data.password) {
      throw new Error("Nombre, correo y contraseña son obligatorios");
    }

    // Hash de la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const nuevoUsuario = await createUser({
      name: data.username,
      email: data.email,
      password: hashedPassword,
    });
    return new User(nuevoUsuario.id, nuevoUsuario.name, nuevoUsuario.email);
  }

  static async loggearUsuario(data) {
    const { username, password } = data;

    // Validar datos de entrada
    if (!username || !password) {
      throw new Error("Nombre y contraseña son obligatorios");
    }

    // Obtener usuario de la base de datos
    const usuario = await getUserByName(username);
    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(
      password,
      String(usuario.contraseña),
    );

    if (!passwordMatch) {
      throw new Error("Credenciales inválidas");
    }

    // Crear payload del token
    const payload = {
      id: usuario.id,
      name: usuario.nombre,
      email: usuario.email,
    };

    // Generar token JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "secreto-temporal",
      { expiresIn: "24h" },
    );

    return {
      token,
      user: {
        id: usuario.id,
        name: usuario.nombre,
        email: usuario.email,
        active: usuario.activo,
        firstTime: usuario.primeravez,
      },
    };
  }
  static async actualizarPrimerizo(data) {
    const name = data.nombre;
    if (!name) {
      throw new Error("Nombre es obligatorio");
    }
    // Obtener usuario de la base de datos
    const usuario = await getUserByName(name);
    if (!usuario) {
      throw new Error("Usuario no existe");
    }
    await updateFirstTime(name);
  }

  static async desactivarUsuario(data) {
    const name = data.nombre;
    if (!name) {
      throw new Error("Nombre es obligatorio");
    }
    // Obtener usuario de la base de datos
    const usuario = await getUserByName(name);
    if (!usuario) {
      throw new Error("Usuario no existe");
    }
    await deactivateUser(name);
  }

  static async solicitarRecuperacion(data) {
    const { email } = data;

    if (!email) {
      throw new Error("El correo electrónico es obligatorio");
    }

    const usuario = await getUserByEmail(email);

    // Por seguridad
    if (!usuario) {
      return {
        message:
          "Si el correo existe, recibirás un código de verificación",
      };
    }

    // Generar código
    const code = crypto.randomInt(100000, 999999).toString();

    // Expira en 15 minutos
    const expiration = new Date(Date.now() + 15 * 60 * 1000);

    // Guardar código
    await saveRecoveryCode(email, code, expiration);

    // Intentar enviar correo
    try {

      await sendRecoveryEmail(email, code);

      console.log("Correo enviado correctamente");

    } catch (error) {

      console.error("Error enviando correo:", error);

      // Evita que el frontend quede cargando infinito
      return {
        message:
          "El código fue generado, pero ocurrió un problema al enviar el correo.",
        emailError: true,
      };
    }

    return {
      message:
        "Si el correo existe, recibirás un código de verificación",
    };
  }
}
