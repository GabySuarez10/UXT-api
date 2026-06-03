import pool from "@/lib/db";

// Obtener todas los sitios (sin filtro)
export async function getSitios() {
  try {
    const result = await pool.query(
      `SELECT id, usuario, titulo, url, 
       ultimarevision AT TIME ZONE 'America/Bogota' as ultimarevision_local,
       fechainicio AT TIME ZONE 'America/Bogota' as fechainicio_local  FROM sitios ORDER BY fechainicio DESC`,
    );
    return result.rows;
  } catch (error) {
    console.error("Error en getSitios:", error);
    throw error;
  }
}

// Obtener sitios por usuario específico
export async function getSitiosPorUsuario(usuario) {
  try {
    console.log(`Query: buscando sitios para usuario: ${usuario}`);

    const result = await pool.query(
      `SELECT id, usuario, titulo, url, 
       ultimarevision AT TIME ZONE 'America/Bogota' as ultimarevision_local,
       fechainicio AT TIME ZONE 'America/Bogota' as fechainicio_local FROM sitios 
       WHERE usuario = $1 
       ORDER BY fechainicio DESC`,
      [usuario],
    );

    console.log(`Resultado: ${result.rows.length} sitios encontrados`);
    return result.rows;
  } catch (error) {
    console.error(
      `Error en getSitiosPorUsuario para usuario ${usuario}:`,
      error,
    );
    throw error;
  }
}

// Crear un nuevo sitio
export async function createSitio({ usuario, titulo, url }) {
  try {
    const result = await pool.query(
      `INSERT INTO sitios (usuario, titulo, url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [usuario, titulo, url],
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error en createSitio:", error);
    throw error;
  }
}

export async function updateSitio({ ultimaRevision, url }) {
  try {
    const result = await pool.query(
      `UPDATE sitios
       SET ultimaRevision = $2
       WHERE url = $1
       RETURNING *`,
      [url, ultimaRevision],
    );

    if (result.rows.length === 0) {
      throw new Error(`No se encontró un sitio con URL: ${url}`);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error en updateSitio:", error);
    throw error;
  }
}

export async function deleteSitioPorUrl(url) {
  try {
    const result = await pool.query(
      `DELETE FROM sitios
       WHERE url = $1
       RETURNING *`,
      [url],
    );

    if (result.rows.length === 0) {
      throw new Error(`No se encontró un sitio con URL: ${url}`);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error en deleteSitioPorUrl:", error);
    throw error;
  }
}

export async function updateSitioSnapshot({
  url,
  snapshot,
  snapshot_width,
  snapshot_height
}) {

  try {

    const result = await pool.query(

      `UPDATE sitios
       SET
         snapshot = $2,
         snapshot_width = $3,
         snapshot_height = $4
       WHERE url = $1
       OR TRIM(TRAILING '/' FROM url) =
          TRIM(TRAILING '/' FROM $1)
       RETURNING *`,

      [
        url,
        snapshot,
        snapshot_width || 1280,
        snapshot_height || 4000
      ]

    );

    if (result.rows.length === 0) {

      throw new Error(
        `No se encontró un sitio con URL: ${url}`
      );

    }

    return result.rows[0];

  } catch (error) {

    console.error(
      "Error en updateSitioSnapshot:",
      error
    );

    throw error;

  }

}

export async function getSitioSnapshot(url) {

  try {

    const result = await pool.query(

      `SELECT
          snapshot,
          snapshot_width,
          snapshot_height
       FROM sitios
       WHERE url = $1
       OR TRIM(TRAILING '/' FROM url) =
          TRIM(TRAILING '/' FROM $1)
       LIMIT 1`,

      [url]

    );

    return result.rows[0] || null;

  } catch (error) {

    console.error(
      "Error en getSitioSnapshot:",
      error
    );

    throw error;

  }

}
