import { getUsers, createUser } from "@/queries/userQueries";
import { User } from "@/clases/user";

export class UserController {
  static async listarUsuarios() {
    const usuarios = await getUsers();
    return usuarios.map(u => new User(u.id, u.name, u.email));
  }

  static async crearUsuario(data) {
    if (!data.name || !data.email) {
      throw new Error("Nombre y correo son obligatorios");
    }
    const nuevoUsuario = await createUser(data);
    return new User(nuevoUsuario.id, nuevoUsuario.name, nuevoUsuario.email);
  }
}
