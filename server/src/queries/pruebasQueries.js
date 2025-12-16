// src/queries/pruebasQueries.js
import  pool  from "@/lib/db";


// Obtener todas las pruebas
export async function getPruebas() {
  const result = await pool.query("SELECT uid, recurrente, title, url, dominio, userAgent, referrer FROM pruebas1 ORDER BY uid ASC");
  //console.log(result.rows);
  return result.rows;
}

// Crear una nueva prueba
export async function createPrueba({ uid, recurrente, title, url, dominio, userAgent, referrer }) {
  const result = await pool.query(
    `INSERT INTO pruebas1 (uid, recurrente, title, url, dominio, userAgent, referrer)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [uid, recurrente, title, url, dominio, userAgent, referrer]
  );
  return result.rows[0];
}


export async function updatePrueba({ uid, recurrente, title, url, dominio, userAgent, referrer }) {
  const result = await pool.query(
    `UPDATE pruebas1
     SET recurrente = $2, title = $3, url = $4, dominio = $5, userAgent = $6, referrer = $7
     WHERE uid = $1
     RETURNING *`,
    [uid, recurrente, title, url, dominio, userAgent, referrer]
  );
  return result.rows[0];
}