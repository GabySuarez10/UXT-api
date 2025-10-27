// src/queries/pruebasQueries.js
import  pool  from "@/lib/db";


// Obtener todas las pruebas
export async function getPruebas() {
  const result = await pool.query("SELECT * FROM pruebas1 ORDER BY id ASC");
  return result.rows;
}

// Crear una nueva prueba
export async function createPrueba({ title, url, dominio, userAgent, referrer }) {
  const result = await pool.query(
    `INSERT INTO pruebas1 (title, url, dominio, userAgent, referrer)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, url, dominio, userAgent, referrer]
  );
  return result.rows[0];
}
