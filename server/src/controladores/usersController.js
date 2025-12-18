import { getUsers, createUser, getUserByName, updateFirstTime, deactivateUser } from "@/queries/userQueries";
import { User } from "@/clases/user";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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

}