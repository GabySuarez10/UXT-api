import { getUsers, createUser, getUserByName, updateFirstTime, deactivateUser, getUserByEmail, saveRecoveryCode, clearRecoveryCode, updatePasswordByEmail } from "@/queries/userQueries";
import { User } from "@/clases/user";
import { sendRecoveryEmail } from "@/lib/emailService";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class UserController {
  static async listarUsuarios() {
    const usuarios = await getUsers();
    return usuarios.map(u => new User(u.id, u.name, u.email));
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
      password: hashedPassword
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
  const passwordMatch = await bcrypt.compare(password, String(usuario.contraseña));
  
  if (!passwordMatch) {
    throw new Error("Credenciales inválidas");
  }
  
  // Crear payload del token
  const payload = {
    id: usuario.id,
    name: usuario.nombre,
    email: usuario.email
  };
  
  // Generar token JWT
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'secreto-temporal',
    { expiresIn: '24h' }
  );
  
  return {
    token,
    user: {
      id: usuario.id,
      name: usuario.nombre,
      email: usuario.email,
      active: usuario.activo,
      firstTime: usuario.primeravez
    }
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
    if (!usuario) {
      // Por seguridad, no revelamos si el email existe o no
      return { message: "Si el correo existe, recibirás un código de verificación" };
    }

    // Generar código de 6 dígitos
    const code = crypto.randomInt(100000, 999999).toString();

    // Expiración: 15 minutos
    const expiration = new Date(Date.now() + 15 * 60 * 1000);

    // Guardar código en BD
    await saveRecoveryCode(email, code, expiration);

    // Enviar email
    await sendRecoveryEmail(email, code);

    return { message: "Si el correo existe, recibirás un código de verificación" };
  }

  static async verificarCodigo(data) {
    const { email, code } = data;
    if (!email || !code) {
      throw new Error("Email y código son obligatorios");
    }

    const usuario = await getUserByEmail(email);
    if (!usuario) {
      throw new Error("Código inválido o expirado");
    }

    // Verificar código
    if (usuario.codigo_recuperacion !== code) {
      throw new Error("Código inválido o expirado");
    }

    // Verificar expiración
    if (new Date() > new Date(usuario.codigo_expira)) {
      await clearRecoveryCode(email);
      throw new Error("El código ha expirado. Solicita uno nuevo");
    }

    return { message: "Código verificado correctamente", verified: true };
  }

  static async restablecerContrasena(data) {
    const { email, code, newPassword } = data;
    if (!email || !code || !newPassword) {
      throw new Error("Email, código y nueva contraseña son obligatorios");
    }

    if (newPassword.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const usuario = await getUserByEmail(email);
    if (!usuario) {
      throw new Error("Solicitud inválida");
    }

    // Verificar código nuevamente
    if (usuario.codigo_recuperacion !== code) {
      throw new Error("Código inválido");
    }

    if (new Date() > new Date(usuario.codigo_expira)) {
      await clearRecoveryCode(email);
      throw new Error("El código ha expirado");
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePasswordByEmail(email, hashedPassword);

    // Limpiar código de recuperación
    await clearRecoveryCode(email);

    return { message: "Contraseña restablecida exitosamente" };
  }

}