import pool from "@/lib/db";

export async function getUsers() {
  const result = await pool.query(
    "SELECT * FROM usuarios ORDER BY id ASC"
  );
  return result.rows;
}

export async function createUser({ name, email, password }) {
  const result = await pool.query(
    "INSERT INTO usuarios (nombre, email, contraseña) VALUES ($1, $2, $3) RETURNING nombre, email, contraseña",
    [name, email, password]
  );
  return result.rows[0];
}

export async function getUserByName(name) {
  const result = await pool.query(
    "SELECT * FROM usuarios WHERE nombre = $1",
    [name]
  );
  return result.rows[0];
}

export async function updateFirstTime(name) {
  await pool.query(
    "UPDATE usuarios SET primeravez = false WHERE nombre = $1",
    [name]
  );
}

export async function deactivateUser(name) {
  await pool.query(
    "UPDATE usuarios SET activo = false WHERE nombre = $1",
    [name]
  );
}